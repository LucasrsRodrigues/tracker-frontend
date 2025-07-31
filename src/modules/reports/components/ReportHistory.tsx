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
  Download,
  Eye,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Filter,
  BarChart3,
  Share2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatNumber, formatDuration } from '@/utils/formatters';

// Interfaces baseadas na estrutura do projeto
interface ReportExecution {
  id: string;
  reportName: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggeredBy: 'schedule' | 'manual' | 'api';
  user?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileSize?: number;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  downloadUrl?: string;
  downloadCount: number;
  expiresAt?: Date;
  parameters: Record<string, any>;
  error?: string;
  metrics: {
    recordsProcessed: number;
    pagesGenerated?: number;
    chartsCreated?: number;
    memoryUsage: number;
  };
  outputs: ReportOutput[];
}

interface ReportOutput {
  id: string;
  format: string;
  size: number;
  url: string;
  downloadCount: number;
  createdAt: Date;
  expiresAt?: Date;
}

interface ExecutionStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  avgDuration: number;
  successRate: number;
  totalSize: number;
  totalDownloads: number;
}

// Mock data
const mockExecutions: ReportExecution[] = [
  {
    id: '1',
    reportName: 'Relatório Executivo Semanal',
    templateId: 'exec-summary',
    templateName: 'Resumo Executivo',
    status: 'completed',
    triggeredBy: 'schedule',
    user: 'sistema',
    startTime: new Date(Date.now() - 3600000 * 2),
    endTime: new Date(Date.now() - 3600000 * 2 + 300000),
    duration: 300,
    fileSize: 2.4 * 1024 * 1024, // 2.4MB
    format: 'pdf',
    downloadUrl: '/reports/download/1',
    downloadCount: 12,
    expiresAt: new Date(Date.now() + 86400000 * 7),
    parameters: { period: 'weekly', includeForecasting: true },
    metrics: {
      recordsProcessed: 15420,
      pagesGenerated: 24,
      chartsCreated: 18,
      memoryUsage: 145
    },
    outputs: [
      {
        id: '1-pdf',
        format: 'pdf',
        size: 2.4 * 1024 * 1024,
        url: '/reports/download/1-pdf',
        downloadCount: 12,
        createdAt: new Date(Date.now() - 3600000 * 2 + 300000),
        expiresAt: new Date(Date.now() + 86400000 * 7)
      }
    ]
  },
  {
    id: '2',
    reportName: 'Performance Diária',
    templateId: 'perf-daily',
    templateName: 'Performance Diária',
    status: 'running',
    triggeredBy: 'manual',
    user: 'devops@empresa.com',
    startTime: new Date(Date.now() - 600000),
    format: 'excel',
    downloadCount: 0,
    parameters: { timeRange: '24h', includeAlerts: true },
    metrics: {
      recordsProcessed: 8500,
      memoryUsage: 78
    },
    outputs: []
  },
  {
    id: '3',
    reportName: 'Análise Financeira Mensal',
    templateId: 'financial-monthly',
    templateName: 'Análise Financeira Mensal',
    status: 'failed',
    triggeredBy: 'manual',
    user: 'financeiro@empresa.com',
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 86400000 + 180000),
    duration: 180,
    format: 'excel',
    downloadCount: 0,
    parameters: { detailLevel: 'full', includeForecast: true },
    error: 'Erro ao acessar dados financeiros: Timeout na conexão com o banco de dados',
    metrics: {
      recordsProcessed: 0,
      memoryUsage: 45
    },
    outputs: []
  },
  {
    id: '4',
    reportName: 'Analytics de Usuários - Q1',
    templateId: 'user-analytics',
    templateName: 'Analytics de Usuários',
    status: 'completed',
    triggeredBy: 'manual',
    user: 'product@empresa.com',
    startTime: new Date(Date.now() - 86400000 * 2),
    endTime: new Date(Date.now() - 86400000 * 2 + 480000),
    duration: 480,
    fileSize: 5.8 * 1024 * 1024, // 5.8MB
    format: 'excel',
    downloadUrl: '/reports/download/4',
    downloadCount: 8,
    expiresAt: new Date(Date.now() + 86400000 * 14),
    parameters: { includeSegmentation: true, conversionFunnels: true },
    metrics: {
      recordsProcessed: 125000,
      chartsCreated: 32,
      memoryUsage: 220
    },
    outputs: [
      {
        id: '4-excel',
        format: 'excel',
        size: 5.8 * 1024 * 1024,
        url: '/reports/download/4-excel',
        downloadCount: 8,
        createdAt: new Date(Date.now() - 86400000 * 2 + 480000),
        expiresAt: new Date(Date.now() + 86400000 * 14)
      }
    ]
  },
  {
    id: '5',
    reportName: 'Custom Report - API Metrics',
    templateId: 'custom-basic',
    templateName: 'Template Personalizado',
    status: 'completed',
    triggeredBy: 'api',
    startTime: new Date(Date.now() - 86400000 * 3),
    endTime: new Date(Date.now() - 86400000 * 3 + 120000),
    duration: 120,
    fileSize: 1.2 * 1024 * 1024, // 1.2MB
    format: 'csv',
    downloadUrl: '/reports/download/5',
    downloadCount: 3,
    expiresAt: new Date(Date.now() + 86400000 * 30),
    parameters: { title: 'API Metrics Report', sections: 5 },
    metrics: {
      recordsProcessed: 45000,
      memoryUsage: 67
    },
    outputs: [
      {
        id: '5-csv',
        format: 'csv',
        size: 1.2 * 1024 * 1024,
        url: '/reports/download/5-csv',
        downloadCount: 3,
        createdAt: new Date(Date.now() - 86400000 * 3 + 120000),
        expiresAt: new Date(Date.now() + 86400000 * 30)
      }
    ]
  }
];

const mockStats: ExecutionStats = {
  total: 156,
  completed: 142,
  failed: 11,
  running: 3,
  avgDuration: 285,
  successRate: 91.0,
  totalSize: 245.8 * 1024 * 1024, // 245.8MB
  totalDownloads: 1247
};

export function ReportHistory() {
  const [executions, setExecutions] = useState<ReportExecution[]>(mockExecutions);
  const [stats] = useState<ExecutionStats>(mockStats);
  const [selectedExecution, setSelectedExecution] = useState<ReportExecution | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Executando</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTriggerBadge = (trigger: string) => {
    switch (trigger) {
      case 'schedule':
        return <Badge variant="outline">Agendado</Badge>;
      case 'manual':
        return <Badge className="bg-blue-100 text-blue-800">Manual</Badge>;
      case 'api':
        return <Badge className="bg-purple-100 text-purple-800">API</Badge>;
      default:
        return <Badge variant="outline">{trigger}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'excel':
        return <BarChart3 className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'json':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleViewDetails = (execution: ReportExecution) => {
    setSelectedExecution(execution);
    setIsDetailsDialogOpen(true);
  };

  const handleDownload = (execution: ReportExecution) => {
    if (execution.downloadUrl) {
      window.open(execution.downloadUrl, '_blank');
      // Update download count
      setExecutions(prev => prev.map(e =>
        e.id === execution.id ? { ...e, downloadCount: e.downloadCount + 1 } : e
      ));
    }
  };

  const handleDelete = (executionId: string) => {
    setExecutions(prev => prev.filter(e => e.id !== executionId));
  };

  const handleRetry = (execution: ReportExecution) => {
    console.log('Retrying execution:', execution.id);
    // Implementar retry
  };

  const filteredExecutions = executions.filter(execution => {
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    const matchesTrigger = triggerFilter === 'all' || execution.triggeredBy === triggerFilter;
    const matchesSearch = searchQuery === '' ||
      execution.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.user?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesTrigger && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Execuções</h2>
          <p className="text-muted-foreground">
            Acompanhe o status e resultados de todos os relatórios gerados
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatNumber(stats.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-xl font-bold">{formatNumber(stats.completed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Falharam</p>
                <p className="text-xl font-bold">{formatNumber(stats.failed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Duração Média</p>
                <p className="text-xl font-bold">{formatDuration(stats.avgDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-xl font-bold">{formatNumber(stats.totalDownloads)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Execuções</CardTitle>
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
                  placeholder="Buscar por nome, template ou usuário..."
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
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="running">Executando</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="schedule">Agendado</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relatório</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExecutions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{execution.reportName}</div>
                      <div className="text-sm text-muted-foreground">
                        {execution.templateName}
                      </div>
                      {execution.user && (
                        <div className="text-xs text-muted-foreground">
                          por {execution.user}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      {getStatusBadge(execution.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTriggerBadge(execution.triggeredBy)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(execution.format)}
                      <span className="text-sm uppercase">{execution.format}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {execution.duration ? (
                      <div>
                        <div className="text-sm">{formatDuration(execution.duration)}</div>
                        {execution.status === 'running' && (
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(execution.startTime, { addSuffix: true, locale: ptBR })}
                          </div>
                        )}
                      </div>
                    ) : execution.status === 'running' ? (
                      <div className="text-sm text-blue-600">
                        {formatDistanceToNow(execution.startTime, { addSuffix: true, locale: ptBR })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {execution.fileSize ? (
                      formatFileSize(execution.fileSize)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-sm font-medium">{execution.downloadCount}</div>
                      {execution.expiresAt && (
                        <div className="text-xs text-muted-foreground">
                          Expira {formatDistanceToNow(execution.expiresAt, { addSuffix: true, locale: ptBR })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(execution.startTime, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(execution.startTime, 'HH:mm', { locale: ptBR })}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(execution)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {execution.status === 'completed' && execution.downloadUrl && (
                          <DropdownMenuItem onClick={() => handleDownload(execution)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        )}
                        {execution.status === 'completed' && (
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartilhar
                          </DropdownMenuItem>
                        )}
                        {execution.status === 'failed' && (
                          <DropdownMenuItem onClick={() => handleRetry(execution)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tentar Novamente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(execution.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
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

      {/* Execution Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Execução</DialogTitle>
            <DialogDescription>
              Informações completas sobre a geração do relatório
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedExecution.status)}
                    {getStatusBadge(selectedExecution.status)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Duração</h4>
                  <p className="font-medium">
                    {selectedExecution.duration
                      ? formatDuration(selectedExecution.duration)
                      : selectedExecution.status === 'running'
                        ? 'Em execução'
                        : '-'
                    }
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tamanho</h4>
                  <p className="font-medium">
                    {selectedExecution.fileSize
                      ? formatFileSize(selectedExecution.fileSize)
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <Tabs defaultValue="general" className="w-full">
                <TabsList>
                  <TabsTrigger value="general">Geral</TabsTrigger>
                  <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                  {selectedExecution.outputs.length > 0 && (
                    <TabsTrigger value="outputs">Outputs</TabsTrigger>
                  )}
                  {selectedExecution.error && (
                    <TabsTrigger value="error">Erro</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="general" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Nome do Relatório</h4>
                        <p className="font-medium">{selectedExecution.reportName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Template</h4>
                        <p className="font-medium">{selectedExecution.templateName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Formato</h4>
                        <div className="flex items-center gap-2">
                          {getFormatIcon(selectedExecution.format)}
                          <span className="font-medium uppercase">{selectedExecution.format}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Origem</h4>
                        {getTriggerBadge(selectedExecution.triggeredBy)}
                      </div>
                      {selectedExecution.user && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Usuário</h4>
                          <p className="font-medium">{selectedExecution.user}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Iniciado em</h4>
                        <p className="font-medium">
                          {format(selectedExecution.startTime, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parameters" className="mt-4">
                  <div className="space-y-2">
                    {Object.entries(selectedExecution.parameters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-sm text-muted-foreground">
                          {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground">Registros Processados</div>
                      <div className="text-lg font-bold">
                        {formatNumber(selectedExecution.metrics.recordsProcessed)}
                      </div>
                    </div>
                    {selectedExecution.metrics.pagesGenerated && (
                      <div className="p-3 bg-muted rounded">
                        <div className="text-sm text-muted-foreground">Páginas Geradas</div>
                        <div className="text-lg font-bold">
                          {formatNumber(selectedExecution.metrics.pagesGenerated)}
                        </div>
                      </div>
                    )}
                    {selectedExecution.metrics.chartsCreated && (
                      <div className="p-3 bg-muted rounded">
                        <div className="text-sm text-muted-foreground">Gráficos Criados</div>
                        <div className="text-lg font-bold">
                          {formatNumber(selectedExecution.metrics.chartsCreated)}
                        </div>
                      </div>
                    )}
                    <div className="p-3 bg-muted rounded">
                      <div className="text-sm text-muted-foreground">Uso de Memória</div>
                      <div className="text-lg font-bold">
                        {selectedExecution.metrics.memoryUsage}MB
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {selectedExecution.outputs.length > 0 && (
                  <TabsContent value="outputs" className="mt-4">
                    <div className="space-y-3">
                      {selectedExecution.outputs.map((output) => (
                        <div key={output.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getFormatIcon(output.format)}
                            <div>
                              <div className="font-medium uppercase">{output.format}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatFileSize(output.size)} • {output.downloadCount} downloads
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => window.open(output.url, '_blank')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {selectedExecution.error && (
                  <TabsContent value="error" className="mt-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-red-800">Erro na Execução</h5>
                          <p className="text-sm text-red-700 mt-1">{selectedExecution.error}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}