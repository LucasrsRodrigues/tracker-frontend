import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Database,
  Globe,
  Zap
} from 'lucide-react';
import { useSystemHealth } from '../hooks/useSystemHealth';
import { formatDuration } from '@/utils/formatters';

export function SystemHealth() {
  const { data: healthData, isLoading, error } = useSystemHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning':
        return <Badge variant="secondary">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'down':
        return <Badge variant="outline">Offline</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.includes('database')) return <Database className="h-5 w-5" />;
    if (service.includes('api')) return <Globe className="h-5 w-5" />;
    if (service.includes('queue')) return <Zap className="h-5 w-5" />;
    return <Server className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saúde do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saúde do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar o status de saúde do sistema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const criticalServices = healthData.filter(service =>
    service.status === 'critical' || service.status === 'down'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Saúde do Sistema
          {criticalServices.length > 0 && (
            <Badge variant="destructive">{criticalServices.length} críticos</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {criticalServices.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{criticalServices.length} serviços</strong> com problemas críticos
            </AlertDescription>
          </Alert>
        )}

        {/* Services List */}
        <div className="space-y-3">
          {healthData.map((service) => (
            <div key={service.service} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div className="flex items-center gap-2">
                    {getServiceIcon(service.service)}
                    <span className="font-medium">{service.service}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(service.status)}
                  <span className="text-sm text-muted-foreground">
                    {service.responseTime}ms
                  </span>
                </div>
              </div>

              {/* Service Metrics */}
              <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <div className="font-medium">{service.uptime.toFixed(2)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Erros:</span>
                  <div className="font-medium">{service.errorCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Latência:</span>
                  <div className="font-medium">{service.responseTime}ms</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Última verificação:</span>
                  <div className="font-medium">
                    {formatDuration(Date.now() - new Date(service.lastCheck).getTime())} atrás
                  </div>
                </div>
              </div>

              {/* Dependencies */}
              {service.dependencies && service.dependencies.length > 0 && (
                <div className="ml-8 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Dependências:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {service.dependencies.map((dep) => (
                      <div key={dep.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${dep.status === 'connected' ? 'bg-green-500' :
                              dep.status === 'degraded' ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`} />
                          <span className="text-sm">{dep.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dep.latency}ms • {dep.errorRate.toFixed(1)}% erro
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}