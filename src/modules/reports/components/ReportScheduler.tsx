import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Calendar,
  Clock,
  Mail,
  FileText,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces baseadas na estrutura do projeto
interface ReportSchedule {
  id: string;
  name: string;
  description?: string;
  reportTemplate: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  cronExpression?: string;
  timezone: string;
  enabled: boolean;
  recipients: ScheduleRecipient[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  parameters: Record<string, any>;
  nextRun?: Date;
  lastRun?: Date;
  status: 'active' | 'paused' | 'error' | 'completed';
  createdAt: Date;
  createdBy: string;
  runCount: number;
  successCount: number;
  failureCount: number;
}

interface ScheduleRecipient {
  id: string;
  type: 'user' | 'email' | 'webhook';
  destination: string;
  name: string;
}

interface ScheduleExecution {
  id: string;
  scheduleId: string;
  executedAt: Date;
  status: 'success' | 'failed' | 'running';
  duration: number;
  fileSize?: number;
  error?: string;
  deliveryStatus: Record<string, 'sent' | 'failed' | 'pending'>;
}

// Mock data
const mockSchedules: ReportSchedule[] = [
  {
    id: '1',
    name: 'Relatório Executivo Semanal',
    description: 'Resumo executivo com métricas principais para diretoria',
    reportTemplate: 'executive-summary',
    frequency: 'weekly',
    timezone: 'America/Sao_Paulo',
    enabled: true,
    recipients: [
      { id: '1', type: 'email', destination: 'diretoria@empresa.com', name: 'Diretoria' },
      { id: '2', type: 'user', destination: 'ceo', name: 'CEO' }
    ],
    format: 'pdf',
    parameters: { includeCharts: true, detailLevel: 'summary' },
    nextRun: new Date(Date.now() + 86400000 * 2),
    lastRun: new Date(Date.now() - 86400000 * 5),
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 30),
    createdBy: 'admin',
    runCount: 12,
    successCount: 11,
    failureCount: 1
  },
  {
    id: '2',
    name: 'Performance Diária - DevOps',
    description: 'Métricas de performance e disponibilidade para equipe técnica',
    reportTemplate: 'performance-daily',
    frequency: 'daily',
    timezone: 'America/Sao_Paulo',
    enabled: true,
    recipients: [
      { id: '3', type: 'email', destination: 'devops@empresa.com', name: 'Equipe DevOps' }
    ],
    format: 'excel',
    parameters: { includeAlerts: true, timeRange: '24h' },
    nextRun: new Date(Date.now() + 3600000 * 8),
    lastRun: new Date(Date.now() - 3600000 * 16),
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 15),
    createdBy: 'devops-lead',
    runCount: 15,
    successCount: 15,
    failureCount: 0
  },
  {
    id: '3',
    name: 'Análise Financeira Mensal',
    description: 'Relatório financeiro completo para controladoria',
    reportTemplate: 'financial-monthly',
    frequency: 'monthly',
    timezone: 'America/Sao_Paulo',
    enabled: false,
    recipients: [
      { id: '4', type: 'email', destination: 'financeiro@empresa.com', name: 'Financeiro' },
      { id: '5', type: 'webhook', destination: 'https://api.erp.com/reports', name: 'Sistema ERP' }
    ],
    format: 'csv',
    parameters: { includeForecast: true, detailLevel: 'full' },
    nextRun: new Date(Date.now() + 86400000 * 15),
    lastRun: new Date(Date.now() - 86400000 * 45),
    status: 'paused',
    createdAt: new Date(Date.now() - 86400000 * 90),
    createdBy: 'cfo',
    runCount: 3,
    successCount: 2,
    failureCount: 1
  }
];

export function ReportScheduler() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>(mockSchedules);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [formData, setFormData] = useState<Partial<ReportSchedule>>({
    name: '',
    description: '',
    reportTemplate: '',
    frequency: 'weekly',
    timezone: 'America/Sao_Paulo',
    enabled: true,
    recipients: [],
    format: 'pdf',
    parameters: {}
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Pausado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      hourly: 'A cada hora',
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      custom: 'Personalizado'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'excel':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'json':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      description: '',
      reportTemplate: '',
      frequency: 'weekly',
      timezone: 'America/Sao_Paulo',
      enabled: true,
      recipients: [],
      format: 'pdf',
      parameters: {}
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditSchedule = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setIsCreateDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!formData.name || !formData.reportTemplate) return;

    const scheduleData: ReportSchedule = {
      id: editingSchedule?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      reportTemplate: formData.reportTemplate,
      frequency: formData.frequency || 'weekly',
      timezone: formData.timezone || 'America/Sao_Paulo',
      enabled: formData.enabled || true,
      recipients: formData.recipients || [],
      format: formData.format || 'pdf',
      parameters: formData.parameters || {},
      status: 'active',
      createdAt: editingSchedule?.createdAt || new Date(),
      createdBy: 'current-user',
      runCount: editingSchedule?.runCount || 0,
      successCount: editingSchedule?.successCount || 0,
      failureCount: editingSchedule?.failureCount || 0,
      nextRun: new Date(Date.now() + 86400000), // Tomorrow
      lastRun: editingSchedule?.lastRun
    };

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? scheduleData : s));
    } else {
      setSchedules(prev => [...prev, scheduleData]);
    }

    setIsCreateDialogOpen(false);
    setEditingSchedule(null);
    setFormData({});
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s =>
      s.id === scheduleId
        ? { ...s, enabled: !s.enabled, status: s.enabled ? 'paused' : 'active' }
        : s
    ));
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  const handleRunNow = (scheduleId: string) => {
    console.log('Running schedule now:', scheduleId);
    // Implementar execução imediata
  };

  const calculateSuccessRate = (schedule: ReportSchedule) => {
    if (schedule.runCount === 0) return 0;
    return Math.round((schedule.successCount / schedule.runCount) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agendamento de Relatórios</h2>
          <p className="text-muted-foreground">
            Configure relatórios automáticos e recorrentes
          </p>
        </div>
        <Button onClick={handleCreateSchedule}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-xl font-bold">
                  {schedules.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pausados</p>
                <p className="text-xl font-bold">
                  {schedules.filter(s => s.status === 'paused').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Execuções/mês</p>
                <p className="text-xl font-bold">
                  {schedules.reduce((acc, s) => acc + s.runCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima Execução</TableHead>
                <TableHead>Taxa de Sucesso</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.name}</div>
                      {schedule.description && (
                        <div className="text-sm text-muted-foreground">{schedule.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.reportTemplate}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {getFrequencyLabel(schedule.frequency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(schedule.format)}
                      <span className="text-sm uppercase">{schedule.format}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(schedule.status)}
                      {getStatusBadge(schedule.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.nextRun ? (
                      <div>
                        <div className="text-sm">
                          {format(schedule.nextRun, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(schedule.nextRun, { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {calculateSuccessRate(schedule)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {schedule.successCount}/{schedule.runCount}
                      </div>
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
                        <DropdownMenuItem onClick={() => handleRunNow(schedule.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Executar Agora
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleSchedule(schedule.id)}>
                          {schedule.enabled ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSchedule(schedule)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteSchedule(schedule.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              Configure um relatório para ser gerado automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Relatório Executivo Semanal"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="template">Template</Label>
                <Select
                  value={formData.reportTemplate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reportTemplate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive-summary">Resumo Executivo</SelectItem>
                    <SelectItem value="performance-daily">Performance Diária</SelectItem>
                    <SelectItem value="financial-monthly">Financeiro Mensal</SelectItem>
                    <SelectItem value="analytics-weekly">Analytics Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição do relatório e seu propósito"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="format">Formato</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, format: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="enabled">Ativo</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSchedule}>
                {editingSchedule ? 'Salvar Alterações' : 'Criar Agendamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}