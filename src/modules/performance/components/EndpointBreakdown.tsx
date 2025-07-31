import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { useEndpointPerformance } from '../hooks/usePerformanceMetrics';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { useState } from 'react';

export function EndpointBreakdown() {
  const [sortBy, setSortBy] = useState<'responseTime' | 'throughput' | 'errorRate'>('responseTime');
  const [timeRange, setTimeRange] = useState('24h');
  const { data: endpoints, isLoading } = useEndpointPerformance(timeRange);

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'bg-blue-100 text-blue-800';
      case 'post': return 'bg-green-100 text-green-800';
      case 'put': return 'bg-orange-100 text-orange-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'patch': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceStatus = (responseTime: number, errorRate: number) => {
    if (errorRate > 5 || responseTime > 2000) return 'critical';
    if (errorRate > 2 || responseTime > 1000) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getApdexColor = (apdex: number) => {
    if (apdex >= 0.94) return 'text-green-600';
    if (apdex >= 0.85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedEndpoints = endpoints?.sort((a, b) => {
    switch (sortBy) {
      case 'responseTime':
        return b.averageResponseTime - a.averageResponseTime;
      case 'throughput':
        return b.throughput - a.throughput;
      case 'errorRate':
        return b.errorRate - a.errorRate;
      default:
        return 0;
    }
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance por Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Performance por Endpoint
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'responseTime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('responseTime')}
          >
            Tempo Resposta
          </Button>
          <Button
            variant={sortBy === 'throughput' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('throughput')}
          >
            Throughput
          </Button>
          <Button
            variant={sortBy === 'errorRate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('errorRate')}
          >
            Taxa Erro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tempo Resposta</TableHead>
                <TableHead>Throughput</TableHead>
                <TableHead>Taxa Erro</TableHead>
                <TableHead>Apdex</TableHead>
                <TableHead>Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEndpoints.slice(0, 20).map((endpoint) => {
                const status = getPerformanceStatus(endpoint.averageResponseTime, endpoint.errorRate);
                return (
                  <TableRow key={`${endpoint.endpoint}-${endpoint.method}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <span className="font-mono text-sm">{endpoint.endpoint}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusIcon(status)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{endpoint.averageResponseTime}ms</div>
                        <div className="text-xs text-muted-foreground">
                          P95: {endpoint.p95ResponseTime}ms
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatNumber(endpoint.throughput)}</div>
                        <div className="text-xs text-muted-foreground">req/min</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatPercentage(endpoint.errorRate)}
                        </div>
                        <Progress
                          value={endpoint.errorRate}
                          className={`h-2 ${endpoint.errorRate > 5 ? '[&>div]:bg-red-500' :
                              endpoint.errorRate > 2 ? '[&>div]:bg-yellow-500' :
                                '[&>div]:bg-green-500'
                            }`}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={`font-medium ${getApdexColor(endpoint.apdex)}`}>
                        {endpoint.apdex.toFixed(2)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatNumber(endpoint.totalRequests)}</div>
                        <div className="text-xs text-muted-foreground">
                          {endpoint.trend.regression.slope > 0 ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              Crescendo
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="h-3 w-3" />
                              Decaindo
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}