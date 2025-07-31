import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useSlaIndicators } from '../hooks/useMonitoringData';
import { formatPercentage, formatDuration } from '@/utils/formatters';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SlaMetrics, SlaBreach } from '../types/monitoring.types';

export function SlaIndicators() {
  const { data: slaMetrics, isLoading, refetch } = useSlaIndicators();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'degrading':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'degrading': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (current: number, target: number) => {
    if (current >= target) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (current >= target * 0.95) {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getComplianceStatus = (current: number, target: number) => {
    if (current >= target) return 'meeting';
    if (current >= target * 0.95) return 'at_risk';
    return 'breached';
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'meeting': return 'text-green-600 bg-green-50 border-green-200';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'breached': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceLabel = (status: string) => {
    switch (status) {
      case 'meeting': return 'Atendendo';
      case 'at_risk': return 'Em Risco';
      case 'breached': return 'Violado';
      default: return 'Desconhecido';
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return period;
    }
  };

  const getBreachImpactColor = (impact: string) => {
    switch (impact) {
      case 'minor': return 'text-yellow-600 bg-yellow-50';
      case 'major': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getBreachImpactLabel = (impact: string) => {
    switch (impact) {
      case 'minor': return 'Menor';
      case 'major': return 'Maior';
      case 'critical': return 'Crítica';
      default: return impact;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Indicadores SLA</h2>
          <p className="text-muted-foreground">
            Monitoramento de cumprimento de SLA por provedor
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  SLAs Ativos
                </p>
                <p className="text-2xl font-bold">
                  {slaMetrics?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Atendendo
                </p>
                <p className="text-2xl font-bold">
                  {slaMetrics?.filter(s => getComplianceStatus(s.current, s.target) === 'meeting').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Em Risco
                </p>
                <p className="text-2xl font-bold">
                  {slaMetrics?.filter(s => getComplianceStatus(s.current, s.target) === 'at_risk').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Compliance Médio
                </p>
                <p className="text-2xl font-bold">
                  {slaMetrics?.length ?
                    formatPercentage(slaMetrics.reduce((acc, s) => acc + s.current, 0) / slaMetrics.length)
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Metrics */}
      <div className="space-y-4">
        {slaMetrics?.map((sla) => {
          const status = getComplianceStatus(sla.current, sla.target);
          const progressValue = (sla.current / sla.target) * 100;

          return (
            <Card key={`${sla.provider}-${sla.period}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sla.current, sla.target)}
                    <div>
                      <CardTitle className="text-lg">{sla.provider}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Período: {getPeriodLabel(sla.period)} • Meta: {formatPercentage(sla.target)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getComplianceColor(status)}>
                      {getComplianceLabel(status)}
                    </Badge>
                    <Badge variant="outline" className={getTrendColor(sla.trend)}>
                      {getTrendIcon(sla.trend)}
                      {sla.trend === 'improving' ? 'Melhorando' :
                        sla.trend === 'degrading' ? 'Piorando' : 'Estável'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="current">Atual</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                    <TabsTrigger value="breaches">Violações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="current" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Cumprimento Atual</span>
                          <span className="text-lg font-bold">
                            {formatPercentage(sla.current)}
                          </span>
                        </div>
                        <Progress value={Math.min(progressValue, 100)} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span className="font-medium">Meta: {formatPercentage(sla.target)}</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Meta</span>
                          </div>
                          <div className="text-xl font-bold">
                            {formatPercentage(sla.target)}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Diferença</span>
                          </div>
                          <div className={`text-xl font-bold ${sla.current >= sla.target ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {sla.current >= sla.target ? '+' : ''}{formatPercentage(sla.current - sla.target)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sla.history}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              `${value.toFixed(2)}%`,
                              name === 'value' ? 'Atual' : 'Meta'
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="value"
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="target"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="breaches" className="mt-4">
                    <div className="space-y-3">
                      {sla.breaches.length > 0 ? (
                        sla.breaches.slice(0, 5).map((breach, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${breach.resolved ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                              <div>
                                <div className="font-medium text-sm">
                                  {format(breach.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {breach.reason}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getBreachImpactColor(breach.impact)}>
                                {getBreachImpactLabel(breach.impact)}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDuration(breach.duration * 1000)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                          <p>Nenhuma violação registrada</p>
                        </div>
                      )}

                      {sla.breaches.length > 5 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            Ver mais {sla.breaches.length - 5} violações
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!slaMetrics?.length && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum SLA configurado</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}