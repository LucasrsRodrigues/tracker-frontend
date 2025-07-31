import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Webhook,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  Play,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatNumber, formatDuration } from '@/utils/formatters';

// Mock interfaces based on the project structure
interface WebhookEvent {
  id: string;
  providerId: string;
  providerName: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  statusCode?: number;
  responseTime: number;
  attempts: number;
  maxAttempts: number;
  payload: Record<string, any>;
  createdAt: Date;
  deliveredAt?: Date;
  nextRetryAt?: Date;
  errorMessage?: string;
  headers?: Record<string, string>;
}

interface WebhookAttempt {
  id: string;
  attemptNumber: number;
  timestamp: Date;
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
}

interface WebhookStats {
  totalEvents: number;
  deliveredEvents: number;
  failedEvents: number;
  pendingEvents: number;
  averageResponseTime: number;
  successRate: number;
  retryRate: number;
  hourlyData: Array<{
    hour: string;
    delivered: number;
    failed: number;
    pending: number;
  }>;
  providerStats: Array<{
    provider: string;
    total: number;
    delivered: number;
    failed: number;
    successRate: number;
    avgResponseTime: number;
  }>;
}

// Mock data
const mockWebhookEvents: WebhookEvent[] = [
  {
    id: '1',
    providerId: 'stripe',
    providerName: 'Stripe',
    endpoint: 'https://api.empresa.com/webhooks/stripe',
    method: 'POST',
    status: 'delivered',
    statusCode: 200,
    responseTime: 145,
    attempts: 1,
    maxAttempts: 3,
    payload: { event: 'payment.succeeded', amount: 5000 },
    createdAt: new Date(Date.now() - 30000),
    deliveredAt: new Date(Date.now() - 29800),
  },
  {
    id: '2',
    providerId: 'github',
    providerName: 'GitHub',
    endpoint: 'https://api.empresa.com/webhooks/github',
    method: 'POST',
    status: 'failed',
    statusCode: 500,
    responseTime: 2100,
    attempts: 3,
    maxAttempts: 3,
    payload: { event: 'push', repository: 'empresa/api' },
    createdAt: new Date(Date.now() - 120000),
    errorMessage: 'Internal Server Error',
  },
  {
    id: '3',
    providerId: 'slack',
    providerName: 'Slack',
    endpoint: 'https://api.empresa.com/webhooks/slack',
    method: 'POST',
    status: 'retrying',
    statusCode: 429,
    responseTime: 890,
    attempts: 2,
    maxAttempts: 3,
    payload: { event: 'message.received', channel: 'general' },
    createdAt: new Date(Date.now() - 300000),
    nextRetryAt: new Date(Date.now() + 60000),
    errorMessage: 'Too Many Requests',
  },
];

const mockStats: WebhookStats = {
  totalEvents: 1247,
  deliveredEvents: 1156,
  failedEvents: 67,
  pendingEvents: 24,
  averageResponseTime: 234,
  successRate: 92.7,
  retryRate: 8.4,
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    delivered: Math.floor(Math.random() * 50) + 10,
    failed: Math.floor(Math.random() * 5) + 1,
    pending: Math.floor(Math.random() * 3),
  })),
  providerStats: [
    { provider: 'Stripe', total: 456, delivered: 445, failed: 11, successRate: 97.6, avgResponseTime: 198 },
    { provider: 'GitHub', total: 342, delivered: 320, failed: 22, successRate: 93.6, avgResponseTime: 456 },
    { provider: 'Slack', total: 289, delivered: 267, failed: 22, successRate: 92.4, avgResponseTime: 123 },
    { provider: 'PayPal', total: 160, delivered: 124, failed: 36, successRate: 77.5, avgResponseTime: 678 },
  ],
};

export function WebhookMonitor() {
  const [events] = useState<WebhookEvent[]>(mockWebhookEvents);
  const [stats] = useState<WebhookStats>(mockStats);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'retrying':
        return <RotateCcw className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Entregue</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'retrying':
        return <Badge className="bg-yellow-100 text-yellow-800">Tentando</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'retrying': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleViewDetails = (event: WebhookEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleRetryWebhook = (eventId: string) => {
    console.log('Retrying webhook:', eventId);
    // Implement retry logic
  };

  const filteredEvents = events.filter(event => {
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || event.providerId === providerFilter;
    const matchesSearch = searchQuery === '' ||
      event.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.endpoint.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesProvider && matchesSearch;
  });

  const uniqueProviders = Array.from(new Set(events.map(e => e.providerId)));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalEvents)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span>+12% vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatNumber(stats.deliveredEvents)} entregues</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              <span>-5ms vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Falhados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.failedEvents)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatNumber(stats.pendingEvents)} pendentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="delivered" stackId="a" fill="#10b981" name="Entregues" />
                  <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Falhados" />
                  <Bar dataKey="pending" stackId="a" fill="#3b82f6" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Provider Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas por Provedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.providerStats.map((provider) => (
                <div key={provider.provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{provider.provider}</span>
                    <Badge variant="outline">
                      {provider.successRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex space-x-2 text-xs text-muted-foreground">
                    <span>{formatNumber(provider.total)} total</span>
                    <span>•</span>
                    <span>{formatNumber(provider.delivered)} entregues</span>
                    <span>•</span>
                    <span>{provider.avgResponseTime}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${provider.successRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Eventos de Webhook</CardTitle>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por provedor ou endpoint..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="delivered">Entregues</SelectItem>
                <SelectItem value="failed">Falhados</SelectItem>
                <SelectItem value="retrying">Tentando</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Tempo Resposta</TableHead>
                <TableHead>Tentativas</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className="font-medium">{event.providerName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(event.status)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      <span className="text-muted-foreground">{event.method}</span> {event.endpoint}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${event.responseTime > 1000 ? 'text-red-600' :
                        event.responseTime > 500 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                      {event.responseTime}ms
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {event.attempts}/{event.maxAttempts}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(event.createdAt, { addSuffix: true, locale: ptBR })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(event)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {event.status === 'failed' && (
                          <DropdownMenuItem onClick={() => handleRetryWebhook(event.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Tentar Novamente
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Webhook</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o evento de webhook
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Provedor</h4>
                  <p className="text-sm">{selectedEvent.providerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Endpoint</h4>
                  <p className="text-sm font-mono">{selectedEvent.method} {selectedEvent.endpoint}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Código de Status</h4>
                  <p className="text-sm">{selectedEvent.statusCode || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tempo de Resposta</h4>
                  <p className="text-sm">{selectedEvent.responseTime}ms</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tentativas</h4>
                  <p className="text-sm">{selectedEvent.attempts}/{selectedEvent.maxAttempts}</p>
                </div>
              </div>

              {selectedEvent.errorMessage && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Erro</h4>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {selectedEvent.errorMessage}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Payload</h4>
                <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-40">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Criado: {format(selectedEvent.createdAt, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </span>
                {selectedEvent.deliveredAt && (
                  <span>
                    Entregue: {format(selectedEvent.deliveredAt, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}