import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Zap,
  Server,
  Cpu,
  HardDrive
} from 'lucide-react';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import { formatNumber, formatDuration } from '@/utils/formatters';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

export function LiveDashboard() {
  const { metrics, isConnected } = useRealtimeEvents();
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  useEffect(() => {
    if (metrics) {
      setMetricsHistory(prev => {
        const newHistory = [...prev, {
          timestamp: metrics.timestamp,
          eventsPerSecond: metrics.eventsPerSecond,
          responseTime: metrics.responseTime,
          errorRate: metrics.errorRate,
          activeUsers: metrics.activeUsers,
        }];
        return newHistory.slice(-20); // Keep last 20 points
      });
    }
  }, [metrics]);

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning': return <Badge variant="secondary">Atenção</Badge>;
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const responseTimeStatus = getMetricStatus(metrics.responseTime, { warning: 500, critical: 1000 });
  const errorRateStatus = getMetricStatus(metrics.errorRate, { warning: 5, critical: 10 });
  const cpuStatus = getMetricStatus(metrics.cpuUsage, { warning: 70, critical: 90 });
  const memoryStatus = getMetricStatus(metrics.memoryUsage, { warning: 80, critical: 95 });

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard em Tempo Real</h2>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Events Per Second */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos/seg</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.eventsPerSecond)}</div>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-muted-foreground">Throughput atual</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.activeUsers)}</div>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="h-3 w-3 text-green-600" />
              <span className="text-xs text-muted-foreground">Online agora</span>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
            <Clock className={`h-4 w-4 ${getStatusColor(responseTimeStatus)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(responseTimeStatus)}
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${getStatusColor(errorRateStatus)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(errorRateStatus)}
            </div>
          </CardContent>
        </Card>

        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className={`h-4 w-4 ${getStatusColor(cpuStatus)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpuUsage.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(cpuStatus)}
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <HardDrive className={`h-4 w-4 ${getStatusColor(memoryStatus)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(memoryStatus)}
            </div>
          </CardContent>
        </Card>

        {/* Throughput */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.throughput)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">req/min</span>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">OK</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-100 text-green-800">Operacional</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Events Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Segundo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [value, 'Eventos/seg']}
                  />
                  <Line
                    type="monotone"
                    dataKey="eventsPerSecond"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value) => [value + 'ms', 'Tempo']}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}