import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Settings,
  Activity,
  Globe,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useProvider, useProviderMetrics } from '../hooks/useProvidersData';
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Provider } from '../types/integrations.types';

interface ProviderDetailsProps {
  provider: Provider;
  onBack?: () => void;
}

export function ProviderDetails({ provider, onBack }: ProviderDetailsProps) {
  const { data: providerDetails, isLoading } = useProvider(provider.id);
  const { data: metrics } = useProviderMetrics(provider.id, '24h');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'outage': return 'text-red-600';
      case 'maintenance': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getEndpointStatusIcon = (isHealthy: boolean) => {
    return isHealthy
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const providerData = providerDetails || provider;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{providerData.name}</h1>
          <p className="text-muted-foreground capitalize">
            Provedor de {providerData.type}
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className={`h-4 w-4 ${getStatusColor(providerData.status)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getStatusColor(providerData.status)}`}>
              {providerData.status}
            </div>
            <div className="text-xs text-muted-foreground">
              Uptime: {formatPercentage(metrics?.uptime || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics?.availability || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              SLA: {formatPercentage(providerData.sla.availability)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgResponseTime || 0}ms
            </div>
            <div className="text-xs text-muted-foreground">
              P95: {metrics?.p95ResponseTime || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics?.errorRate || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(metrics?.failedRequests || 0)} falhas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="configuration">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance das Últimas 24h</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.performanceTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm')}
                        formatter={(value, name) => [
                          name === 'responseTime' ? `${value}ms` : `${value}%`,
                          name === 'responseTime' ? 'Tempo Resposta' :
                            name === 'availability' ? 'Disponibilidade' :
                              name === 'errorRate' ? 'Taxa Erro' : 'Throughput'
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="responseTime"
                      />
                      <Line
                        type="monotone"
                        dataKey="availability"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="availability"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerData.rateLimits?.map((limit) => (
                    <div key={limit.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{limit.name}</span>
                        <Badge variant="outline">
                          {limit.current}/{limit.limit}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={(limit.current / limit.limit) * 100}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{limit.type.replace('_', ' ')}</span>
                          <span>
                            Reset: {format(new Date(limit.resetTime), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card>
              <CardHeader>
                <CardTitle>Incidentes Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.incidents?.length ? (
                  <div className="space-y-3">
                    {metrics.incidents.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-start gap-3 p-3 border rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {incident.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={incident.status === 'resolved' ? 'default' : 'destructive'}>
                              {incident.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(incident.startTime), 'dd/MM HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum incidente recente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base URL:</span>
                  <span className="text-sm font-mono">
                    {providerData.configuration.baseUrl}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Autenticação:</span>
                  <Badge variant="outline">
                    {providerData.configuration.authentication.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Timeout:</span>
                  <span className="text-sm">
                    {formatDuration(providerData.configuration.timeout)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Circuit Breaker:</span>
                  <Badge variant={providerData.configuration.circuitBreaker.enabled ? 'default' : 'secondary'}>
                    {providerData.configuration.circuitBreaker.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints Monitorados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerData.endpoints?.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      {getEndpointStatusIcon(endpoint.isActive)}
                      <div>
                        <div className="font-medium">
                          <Badge variant="outline" className="mr-2">
                            {endpoint.method}
                          </Badge>
                          {endpoint.name}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {endpoint.path}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ~{endpoint.expectedResponseTime}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {endpoint.monitoring.enabled ? 'Monitorado' : 'Não monitorado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerData.webhooks?.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">{webhook.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {webhook.url}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Max retries: {webhook.retryPolicy.maxRetries}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SLA Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Disponibilidade:</span>
                    <span className="font-medium">
                      {formatPercentage(providerData.sla.availability)}
                    </span>
                  </div>
                  <Progress value={providerData.sla.availability} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Tempo de Resposta:</span>
                    <span className="font-medium">
                      {'<'}{providerData.sla.responseTime}ms
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Taxa de Erro:</span>
                    <span className="font-medium">
                      {'<'}{formatPercentage(providerData.sla.errorRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SLA Performance Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Disponibilidade:</span>
                    <span className={`font-medium ${(metrics?.availability || 0) >= providerData.sla.availability
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      {formatPercentage(metrics?.availability || 0)}
                    </span>
                  </div>
                  <Progress
                    value={metrics?.availability || 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Tempo de Resposta:</span>
                    <span className={`font-medium ${(metrics?.avgResponseTime || 0) <= providerData.sla.responseTime
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      {metrics?.avgResponseTime || 0}ms
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Taxa de Erro:</span>
                    <span className={`font-medium ${(metrics?.errorRate || 0) <= providerData.sla.errorRate
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      {formatPercentage(metrics?.errorRate || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Compliance Geral:</span>
                    <span className={`font-bold text-lg ${(metrics?.slaCompliance || 0) >= 95
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      {formatPercentage(metrics?.slaCompliance || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Authentication */}
                <div>
                  <h3 className="font-medium mb-3">Autenticação</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded">
                    <div>
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <p className="font-medium capitalize">
                        {providerData.configuration.authentication.type}
                      </p>
                    </div>
                    {providerData.configuration.authentication.expiresAt && (
                      <div>
                        <span className="text-sm text-muted-foreground">Expira em:</span>
                        <p className="font-medium">
                          {format(new Date(providerData.configuration.authentication.expiresAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Retry Policy */}
                <div>
                  <h3 className="font-medium mb-3">Política de Retry</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded">
                    <div>
                      <span className="text-sm text-muted-foreground">Max Retries:</span>
                      <p className="font-medium">
                        {providerData.configuration.retryPolicy.maxRetries}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Estratégia:</span>
                      <p className="font-medium capitalize">
                        {providerData.configuration.retryPolicy.backoffStrategy}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Delay Inicial:</span>
                      <p className="font-medium">
                        {formatDuration(providerData.configuration.retryPolicy.initialDelay)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Max Delay:</span>
                      <p className="font-medium">
                        {formatDuration(providerData.configuration.retryPolicy.maxDelay)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Circuit Breaker */}
                <div>
                  <h3 className="font-medium mb-3">Circuit Breaker</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded">
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <p className="font-medium">
                        {providerData.configuration.circuitBreaker.enabled ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Threshold:</span>
                      <p className="font-medium">
                        {providerData.configuration.circuitBreaker.failureThreshold} falhas
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Recovery Timeout:</span>
                      <p className="font-medium">
                        {formatDuration(providerData.configuration.circuitBreaker.recoveryTimeout)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Half-Open Calls:</span>
                      <p className="font-medium">
                        {providerData.configuration.circuitBreaker.halfOpenMaxCalls}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}