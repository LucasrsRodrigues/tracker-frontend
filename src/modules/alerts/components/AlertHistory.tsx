import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAlertHistory } from '../hooks/useAlertHistory';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export function AlertHistory() {
  const [search, setSearch] = useState('');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useAlertHistory({ search });

  const { ref: loadMoreRef } = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetching: isFetchingNextPage,
  });

  const alerts = data?.pages.flatMap(page => page.alerts) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'firing': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'acknowledged': return <User className="h-4 w-4 text-blue-600" />;
      case 'suppressed': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'firing': return <Badge variant="destructive">Ativo</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>;
      case 'acknowledged': return <Badge className="bg-blue-100 text-blue-800">Reconhecido</Badge>;
      case 'suppressed': return <Badge variant="outline">Suprimido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length, 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Alertas</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alertas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-[250px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum alerta encontrado</p>
            <p className="text-muted-foreground">
              {search ? 'Tente ajustar os filtros de busca' : 'Ótimo! Não há alertas recentes'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(alert.status)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{alert.title}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {getStatusBadge(alert.status)}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Regra: {alert.ruleName}</span>
                      <span>Valor: {alert.value} (limite: {alert.threshold})</span>
                      {alert.acknowledgedBy && (
                        <span>Reconhecido por: {alert.acknowledgedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-right text-sm space-y-1">
                    <div className="font-medium">
                      {formatDistanceToNow(new Date(alert.firedAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                    {alert.resolvedAt && (
                      <div className="text-xs text-green-600">
                        Resolvido {formatDistanceToNow(new Date(alert.resolvedAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    )}
                    {alert.acknowledgedAt && (
                      <div className="text-xs text-blue-600">
                        Reconhecido {formatDistanceToNow(new Date(alert.acknowledgedAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div ref={loadMoreRef} className="text-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Carregando mais alertas...</span>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    Carregar Mais
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}