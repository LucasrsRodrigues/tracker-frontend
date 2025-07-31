import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  User,
  Monitor,
  MapPin,
  ExternalLink,
  Copy,
  Share
} from 'lucide-react';
import { JsonViewer } from '../components/JsonViewer';
import { useEventDetails, useEventCorrelation } from '../hooks/useEventDetails';
import { formatDuration } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TrackingEvent } from '../types/events.types';

interface EventDetailsProps {
  event: TrackingEvent;
  onClose?: () => void;
  onNavigateToCorrelation?: (traceId: string) => void;
  onNavigateToSession?: (sessionId: string) => void;
}

export function EventDetails({
  event,
  onClose,
  onNavigateToCorrelation,
  onNavigateToSession
}: EventDetailsProps) {
  const { data: eventDetails, isLoading } = useEventDetails(event.id);
  const { data: correlation } = useEventCorrelation(event.traceId || '');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'integration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const eventData = eventDetails || event;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Detalhes do Evento
            <Badge className={getCategoryColor(eventData.category)}>
              {eventData.category}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {eventData.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(eventData.id)}>
            <Copy className="h-4 w-4 mr-1" />
            Copiar ID
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Compartilhar
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Timestamp</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(eventData.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Usuário</p>
              <p className="text-sm text-muted-foreground">
                {eventData.userId ? eventData.userId.slice(-8) : 'Anônimo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Plataforma</p>
              <p className="text-sm text-muted-foreground">
                {eventData.context.platform} / {eventData.context.device.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Localização</p>
              <p className="text-sm text-muted-foreground">
                {eventData.context.country || 'N/A'} {eventData.context.city && `/ ${eventData.context.city}`}
              </p>
            </div>
          </div>
        </div>

        {/* Action & Label */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{eventData.action}</h3>
          {eventData.label && (
            <p className="text-muted-foreground">{eventData.label}</p>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-2">
          {eventData.traceId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToCorrelation?.(eventData.traceId!)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver Correlação ({correlation?.events.length || 0} eventos)
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToSession?.(eventData.sessionId)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Ver Sessão
          </Button>
        </div>

        <Separator />

        {/* Detailed Information */}
        <Tabs defaultValue="data" className="w-full">
          <TabsList>
            <TabsTrigger value="data">Dados do Evento</TabsTrigger>
            <TabsTrigger value="context">Contexto</TabsTrigger>
            <TabsTrigger value="metadata">Metadados</TabsTrigger>
            {eventData.traceId && (
              <TabsTrigger value="correlation">Correlação</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="data" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={eventData.data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="context" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contexto Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Network Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Informações de Rede</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP:</span>
                        <span className="font-mono">{eventData.context.ip}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referer:</span>
                        <span className="font-mono text-xs max-w-[200px] truncate">
                          {eventData.context.referer || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Informações do Dispositivo</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">OS:</span>
                        <span>{eventData.context.device.os}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Browser:</span>
                        <span>{eventData.context.device.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="capitalize">{eventData.context.device.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Agent */}
                <div className="mt-6">
                  <h4 className="font-medium mb-2">User Agent</h4>
                  <p className="text-xs font-mono bg-muted p-3 rounded break-all">
                    {eventData.context.userAgent}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Metadados</CardTitle>
              </CardHeader>
              <CardContent>
                {eventData.metadata ? (
                  <div className="space-y-4">
                    {eventData.metadata.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span>{formatDuration(eventData.metadata.duration)}</span>
                      </div>
                    )}
                    {eventData.metadata.provider && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provedor:</span>
                        <Badge variant="outline">{eventData.metadata.provider}</Badge>
                      </div>
                    )}
                    {eventData.metadata.endpoint && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endpoint:</span>
                        <span className="font-mono text-sm">{eventData.metadata.endpoint}</span>
                      </div>
                    )}
                    {eventData.metadata.statusCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status Code:</span>
                        <Badge
                          variant={eventData.metadata.statusCode >= 400 ? 'destructive' : 'outline'}
                        >
                          {eventData.metadata.statusCode}
                        </Badge>
                      </div>
                    )}
                    {eventData.metadata.errorCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Código do Erro:</span>
                        <Badge variant="destructive">{eventData.metadata.errorCode}</Badge>
                      </div>
                    )}
                    {eventData.metadata.correlationId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Correlation ID:</span>
                        <span className="font-mono text-sm">{eventData.metadata.correlationId}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum metadado disponível</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {eventData.traceId && (
            <TabsContent value="correlation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eventos Correlacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  {correlation ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold">{correlation.events.length}</p>
                          <p className="text-sm text-muted-foreground">Eventos</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{correlation.services.length}</p>
                          <p className="text-sm text-muted-foreground">Serviços</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{formatDuration(correlation.totalDuration)}</p>
                          <p className="text-sm text-muted-foreground">Duração Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-600">{correlation.errorCount}</p>
                          <p className="text-sm text-muted-foreground">Erros</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onNavigateToCorrelation?.(eventData.traceId!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Análise Completa de Correlação
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Carregando dados de correlação...</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}