import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { useDashboardAlerts } from '../hooks/useDashboardMetrics';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CriticalAlerts() {
  const { data: alerts, isLoading } = useDashboardAlerts();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Críticos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts?.filter(alert => !alert.acknowledged) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alertas Críticos</CardTitle>
        {criticalAlerts.length > 0 && (
          <Badge variant="destructive">{criticalAlerts.length}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {criticalAlerts.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Nenhum alerta crítico</span>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                    <Button variant="ghost" size="sm">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}