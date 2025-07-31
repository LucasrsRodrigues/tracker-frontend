import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAlertRules, useAlertRuleActions } from '../hooks/useAlertRules';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AlertRule } from '../types/alerts.types';

interface AlertRulesProps {
  onCreateRule?: () => void;
  onEditRule?: (rule: AlertRule) => void;
}

export function AlertRules({ onCreateRule, onEditRule }: AlertRulesProps) {
  const { data: rules, isLoading, error } = useAlertRules();
  const { toggleRule, deleteRule, testRule } = useAlertRuleActions();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'system': return '⚙️';
      case 'business': return '💼';
      case 'error': return '🚨';
      case 'performance': return '⚡';
      case 'custom': return '🔧';
      default: return '📊';
    }
  };

  const handleToggleRule = (id: string, enabled: boolean) => {
    toggleRule.mutate({ id, enabled });
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra de alerta?')) {
      deleteRule.mutate(id);
    }
  };

  const handleTestRule = (rule: AlertRule) => {
    testRule.mutate(rule);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regras de Alerta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regras de Alerta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Erro ao carregar regras de alerta
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Regras de Alerta
          <Badge variant="outline">{rules?.length || 0}</Badge>
        </CardTitle>
        <Button onClick={onCreateRule}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </CardHeader>
      <CardContent>
        {!rules || rules.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma regra configurada</p>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira regra de alerta para monitorar métricas importantes
            </p>
            <Button onClick={onCreateRule}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Regra
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Condições</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Ativação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        {rule.description && (
                          <div className="text-sm text-muted-foreground">
                            {rule.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          {rule.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getMetricIcon(rule.metric.type)}</span>
                        <div>
                          <div className="font-mono text-sm">{rule.metric.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {rule.metric.aggregation}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <div key={condition.id} className="text-sm">
                            {rule.metric.aggregation} {condition.operator} {condition.threshold}
                            {condition.unit && ` ${condition.unit}`}
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {rule.enabled ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {rule.lastTriggered ? (
                        <div>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(rule.lastTriggered), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rule.triggerCount} ativações
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditRule?.(rule)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTestRule(rule)}>
                            <Play className="h-4 w-4 mr-2" />
                            Testar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}