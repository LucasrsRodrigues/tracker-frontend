import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Globe,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProvidersStatus } from '../hooks/useMonitoringData';
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ProviderStatus as ProviderStatusType } from '../types/monitoring.types';

export function ProviderStatus() {
  const { data: providers, isLoading, refetch } = useProvidersStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'outage':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'outage': return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Operacional';
      case 'degraded': return 'Degradado';
      case 'outage': return 'Indisponível';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRateLimitStatus = (provider: ProviderStatusType) => {
    const { current, limit } = provider.rateLimitStatus;
    const percentage = (current / limit) * 100;

    if (percentage >= 90) return { color: 'text-red-600', level: 'Crítico' };
    if (percentage >= 75) return { color: 'text-yellow-600', level: 'Alto' };
    return { color: 'text-green-600', level: 'Normal' };
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
                <div className="h-20 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold tracking-tight">Status dos Provedores</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de provedores externos
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
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Provedores
                </p>
                <p className="text-2xl font-bold">
                  {providers?.length || 0}
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
                  Operacionais
                </p>
                <p className="text-2xl font-bold">
                  {providers?.filter(p => p.status === 'operational').length || 0}
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
                  Com Problemas
                </p>
                <p className="text-2xl font-bold">
                  {providers?.filter(p => ['degraded', 'outage'].includes(p.status)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Uptime Médio
                </p>
                <p className="text-2xl font-bold">
                  {providers?.length ?
                    formatPercentage(providers.reduce((acc, p) => acc + p.uptime, 0) / providers.length)
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {providers?.map((provider) => {
          const rateLimitStatus = getRateLimitStatus(provider);
          const rateLimitPercentage = (provider.rateLimitStatus.current / provider.rateLimitStatus.limit) * 100;

          return (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(provider.status)}
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Última verificação: {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(provider.status)}>
                    {getStatusLabel(provider.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="limits">Rate Limits</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Uptime</span>
                          <span className={`text-sm font-medium ${getUptimeColor(provider.uptime)}`}>
                            {formatPercentage(provider.uptime)}
                          </span>
                        </div>
                        <Progress value={provider.uptime} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
                          <span className={`text-sm font-medium ${getUptimeColor(provider.successRate)}`}>
                            {formatPercentage(provider.successRate)}
                          </span>
                        </div>
                        <Progress value={provider.successRate} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">SLA Compliance</span>
                          <span className={`text-sm font-medium ${getUptimeColor(provider.slaCompliance)}`}>
                            {formatPercentage(provider.slaCompliance)}
                          </span>
                        </div>
                        <Progress value={provider.slaCompliance} className="h-2" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Latência</span>
                        </div>
                        <div className="text-2xl font-bold">
                          {formatNumber(provider.latency)}ms
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tempo médio de resposta
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm font-medium">Último Incidente</span>
                        </div>
                        <div className="text-sm">
                          {provider.lastIncident ?
                            format(provider.lastIncident, 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : 'Nenhum registro'
                          }
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="limits" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Rate Limit Status</span>
                          <Badge variant="outline" className={rateLimitStatus.color}>
                            {rateLimitStatus.level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                          <span>
                            {formatNumber(provider.rateLimitStatus.current)} / {formatNumber(provider.rateLimitStatus.limit)}
                          </span>
                          <span>{formatPercentage(rateLimitPercentage)}</span>
                        </div>
                        <Progress value={rateLimitPercentage} className="h-2" />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Reset em: {format(provider.rateLimitStatus.resetTime, 'HH:mm:ss', { locale: ptBR })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!providers?.length && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum provedor configurado</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}