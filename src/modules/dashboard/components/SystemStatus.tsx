import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

export function SystemStatus() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'offline':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'offline':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Provedores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Provedores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics?.providersStatus?.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(provider.status)}
              <div>
                <p className="font-medium">{provider.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Uptime: {provider.uptime.toFixed(1)}%</span>
                  <span>•</span>
                  <span>Latência: {provider.latency}ms</span>
                </div>
              </div>
            </div>
            <Badge variant={getStatusVariant(provider.status)}>
              {provider.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
