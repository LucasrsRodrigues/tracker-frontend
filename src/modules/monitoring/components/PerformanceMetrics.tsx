import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePerformanceMetrics } from '../hooks/useSystemHealth';
import { formatNumber } from '@/utils/formatters';
import { Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export function PerformanceMetrics() {
  const { data: performanceData, isLoading, error } = usePerformanceMetrics();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'slow':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return <Badge className="bg-green-100 text-green-800">Ótimo</Badge>;
      case 'slow':
        return <Badge variant="secondary">Lento</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !performanceData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar as métricas de performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = performanceData.map(metric => ({
    name: metric.endpoint.split('/').pop() || metric.endpoint,
    responseTime: metric.avgResponseTime,
    requests: metric.requestsPerMinute,
    errorRate: metric.errorRate,
  }));

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tempo de Resposta por Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'responseTime' ? `${value}ms` : value,
                    name === 'responseTime' ? 'Tempo Resposta' :
                      name === 'requests' ? 'Requests/min' : 'Taxa Erro %'
                  ]}
                />
                <Bar dataKey="responseTime" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((metric) => (
              <div key={`${metric.endpoint}-${metric.method}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {metric.method}
                        </Badge>
                        <span className="font-medium">{metric.endpoint}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(metric.requestsPerMinute)} req/min
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(metric.status)}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="ml-7 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tempo Médio:</span>
                    <div className="font-medium">{metric.avgResponseTime}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P95:</span>
                    <div className="font-medium">{metric.p95ResponseTime}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P99:</span>
                    <div className="font-medium">{metric.p99ResponseTime}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Taxa Erro:</span>
                    <div className="font-medium">{metric.errorRate.toFixed(2)}%</div>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="ml-7 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Performance</span>
                    <span>{metric.avgResponseTime}ms</span>
                  </div>
                  <Progress
                    value={Math.min((metric.avgResponseTime / 1000) * 100, 100)}
                    className={`h-2 ${metric.status === 'optimal' ? '[&>div]:bg-green-500' :
                        metric.status === 'slow' ? '[&>div]:bg-yellow-500' :
                          '[&>div]:bg-red-500'
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
