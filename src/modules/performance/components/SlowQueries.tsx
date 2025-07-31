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
  Database,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Eye,
  Zap,
  MoreHorizontal,
  RefreshCw,
  Copy,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatNumber, formatDuration } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces baseadas no projeto
interface SlowQuery {
  id: string;
  query: string;
  database: string;
  table?: string;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  count: number;
  totalTime: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: Date;
  lastSeen: Date;
  trend: 'improving' | 'stable' | 'degrading';
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  executionPlan?: string;
  parameters?: Record<string, any>;
  frequency: number;
  affectedRows?: number;
  suggestion?: string;
  indexRecommendations?: string[];
  history: Array<{
    timestamp: Date;
    duration: number;
    count: number;
  }>;
}

interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  averageDuration: number;
  slowestQuery: number;
  impactDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Mock data
const mockSlowQueries: SlowQuery[] = [
  {
    id: '1',
    query: `SELECT u.*, p.payment_method, p.amount, p.created_at as payment_date 
FROM users u 
LEFT JOIN payments p ON u.id = p.user_id 
WHERE u.status = 'active' 
AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
ORDER BY p.amount DESC 
LIMIT 1000`,
    database: 'main_db',
    table: 'users',
    averageDuration: 2840,
    maxDuration: 8900,
    minDuration: 1200,
    count: 145,
    totalTime: 411800,
    impact: 'critical',
    firstSeen: new Date(Date.now() - 86400000 * 7),
    lastSeen: new Date(Date.now() - 3600000),
    trend: 'degrading',
    operation: 'SELECT',
    frequency: 12.3,
    affectedRows: 856,
    suggestion: 'Adicionar índice composto em (status, created_at)',
    indexRecommendations: [
      'CREATE INDEX idx_users_status ON users(status)',
      'CREATE INDEX idx_payments_user_date ON payments(user_id, created_at)'
    ],
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      duration: 2000 + Math.random() * 2000,
      count: Math.floor(Math.random() * 10) + 5
    }))
  },
  {
    id: '2',
    query: `UPDATE products SET stock_count = stock_count - 1 WHERE id IN (SELECT product_id FROM order_items WHERE order_id = ?)`,
    database: 'inventory_db',
    table: 'products',
    averageDuration: 1650,
    maxDuration: 4200,
    minDuration: 800,
    count: 89,
    totalTime: 146850,
    impact: 'high',
    firstSeen: new Date(Date.now() - 86400000 * 3),
    lastSeen: new Date(Date.now() - 1800000),
    trend: 'stable',
    operation: 'UPDATE',
    frequency: 8.7,
    affectedRows: 234,
    suggestion: 'Otimizar subconsulta ou usar JOIN',
    indexRecommendations: [
      'CREATE INDEX idx_order_items_order_id ON order_items(order_id)'
    ],
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      duration: 1400 + Math.random() * 1000,
      count: Math.floor(Math.random() * 8) + 3
    }))
  },
  {
    id: '3',
    query: `SELECT COUNT(*) FROM events WHERE created_at BETWEEN ? AND ? AND user_id = ? GROUP BY DATE(created_at)`,
    database: 'analytics_db',
    table: 'events',
    averageDuration: 980,
    maxDuration: 2100,
    minDuration: 450,
    count: 234,
    totalTime: 229320,
    impact: 'medium',
    firstSeen: new Date(Date.now() - 86400000 * 5),
    lastSeen: new Date(Date.now() - 900000),
    trend: 'improving',
    operation: 'SELECT',
    frequency: 15.6,
    affectedRows: 1245,
    suggestion: 'Particionar tabela por data',
    indexRecommendations: [
      'CREATE INDEX idx_events_user_date ON events(user_id, created_at)'
    ],
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      duration: 800 + Math.random() * 600,
      count: Math.floor(Math.random() * 12) + 8
    }))
  }
];

const mockStats: QueryStats = {
  totalQueries: 15680,
  slowQueries: 468,
  averageDuration: 1856,
  slowestQuery: 8900,
  impactDistribution: {
    critical: 23,
    high: 67,
    medium: 234,
    low: 144
  }
};

export function SlowQueries() {
  const [queries] = useState<SlowQuery[]>(mockSlowQueries);
  const [stats] = useState<QueryStats>(mockStats);
  const [selectedQuery, setSelectedQuery] = useState<SlowQuery | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [operationFilter, setOperationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Database className="h-4 w-4 text-blue-600" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>;
      case 'low':
        return <Badge variant="outline">Baixo</Badge>;
      default:
        return <Badge variant="outline">{impact}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'degrading':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      default:
        return <Database className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'SELECT': return 'bg-blue-100 text-blue-800';
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (query: SlowQuery) => {
    setSelectedQuery(query);
    setIsDetailsDialogOpen(true);
  };

  const handleCopyQuery = (query: string) => {
    navigator.clipboard.writeText(query);
  };

  const filteredQueries = queries.filter(query => {
    const matchesImpact = impactFilter === 'all' || query.impact === impactFilter;
    const matchesOperation = operationFilter === 'all' || query.operation === operationFilter;
    const matchesSearch = searchQuery === '' ||
      query.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.database.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.table?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesImpact && matchesOperation && matchesSearch;
  });

  const formatQuery = (query: string, maxLength: number = 100) => {
    const cleaned = query.replace(/\s+/g, ' ').trim();
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalQueries)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatNumber(stats.slowQueries)} lentas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-red-600" />
              <span>+12% vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Mais Lenta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.slowestQuery)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Última ocorrência há 1h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impacto Crítico</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.impactDistribution.critical}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              <span>-3 vs ontem</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Impacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Crítico', value: stats.impactDistribution.critical, fill: '#ef4444' },
                { name: 'Alto', value: stats.impactDistribution.high, fill: '#f97316' },
                { name: 'Médio', value: stats.impactDistribution.medium, fill: '#eab308' },
                { name: 'Baixo', value: stats.impactDistribution.low, fill: '#3b82f6' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Queries Lentas</CardTitle>
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
                  placeholder="Buscar por query, database ou tabela..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Impacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="SELECT">SELECT</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Database/Tabela</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Duração Média</TableHead>
                <TableHead>Ocorrências</TableHead>
                <TableHead>Impacto</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueries.map((query) => (
                <TableRow key={query.id}>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {formatQuery(query.query, 80)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{query.database}</div>
                      {query.table && (
                        <div className="text-xs text-muted-foreground">{query.table}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getOperationColor(query.operation)}>
                      {query.operation}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatDuration(query.averageDuration)}</div>
                    <div className="text-xs text-muted-foreground">
                      Max: {formatDuration(query.maxDuration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatNumber(query.count)}</div>
                    <div className="text-xs text-muted-foreground">
                      {query.frequency}/hora
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getImpactIcon(query.impact)}
                      {getImpactBadge(query.impact)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(query.trend)}
                      <span className="text-xs capitalize">{query.trend}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(query)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyQuery(query.query)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Query
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir no SGBD
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Query Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Query Lenta</DialogTitle>
            <DialogDescription>
              Análise detalhada e recomendações de otimização
            </DialogDescription>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Database</h4>
                  <p className="font-medium">{selectedQuery.database}</p>
                  {selectedQuery.table && (
                    <p className="text-sm text-muted-foreground">{selectedQuery.table}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Duração Média</h4>
                  <p className="font-medium">{formatDuration(selectedQuery.averageDuration)}</p>
                  <p className="text-sm text-muted-foreground">
                    Max: {formatDuration(selectedQuery.maxDuration)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Impacto</h4>
                  <div className="flex items-center gap-2">
                    {getImpactIcon(selectedQuery.impact)}
                    {getImpactBadge(selectedQuery.impact)}
                  </div>
                </div>
              </div>

              {/* Query */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Query SQL</h4>
                  <Button size="sm" variant="outline" onClick={() => handleCopyQuery(selectedQuery.query)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-40 font-mono">
                  {selectedQuery.query}
                </pre>
              </div>

              {/* Performance History */}
              <div>
                <h4 className="text-sm font-medium mb-4">Histórico de Performance (24h)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedQuery.history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm', { locale: ptBR })}
                        formatter={(value: number, name: string) => [
                          name === 'duration' ? formatDuration(value) : formatNumber(value),
                          name === 'duration' ? 'Duração' : 'Ocorrências'
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="duration"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="duration"
                        yAxisId="left"
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="count"
                        yAxisId="right"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommendations */}
              {(selectedQuery.suggestion || selectedQuery.indexRecommendations?.length) && (
                <div>
                  <h4 className="text-sm font-medium mb-4">Recomendações de Otimização</h4>
                  <div className="space-y-4">
                    {selectedQuery.suggestion && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-blue-800">Sugestão Principal</h5>
                            <p className="text-sm text-blue-700 mt-1">{selectedQuery.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedQuery.indexRecommendations?.length && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Database className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-green-800">Índices Recomendados</h5>
                            <div className="mt-2 space-y-2">
                              {selectedQuery.indexRecommendations.map((index, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <code className="text-xs bg-white px-2 py-1 rounded border">
                                    {index}
                                  </code>
                                  <Button size="sm" variant="outline" onClick={() => handleCopyQuery(index)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground">Ocorrências</div>
                  <div className="text-lg font-bold">{formatNumber(selectedQuery.count)}</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground">Frequência</div>
                  <div className="text-lg font-bold">{selectedQuery.frequency}/hora</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground">Tempo Total</div>
                  <div className="text-lg font-bold">{formatDuration(selectedQuery.totalTime)}</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground">Linhas Afetadas</div>
                  <div className="text-lg font-bold">{formatNumber(selectedQuery.affectedRows || 0)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}