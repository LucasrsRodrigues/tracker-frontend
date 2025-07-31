import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Eye,
  MousePointer,
  AlertTriangle,
  Target,
  FileText,
  User
} from 'lucide-react';
import { useSessionTimeline } from '../hooks/useSessionData';
import { formatDuration } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SessionTimeline as SessionTimelineType } from '../types/journey.types';

interface SessionTimelineProps {
  sessionId: string;
  onUserSelect?: (userId: string) => void;
}

export function SessionTimeline({ sessionId, onUserSelect }: SessionTimelineProps) {
  const { data: sessionData, isLoading, error } = useSessionTimeline(sessionId);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pageview':
        return <Eye className="h-4 w-4" />;
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'form':
        return <FileText className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'conversion':
        return <Target className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'pageview':
        return 'text-blue-600';
      case 'click':
        return 'text-green-600';
      case 'form':
        return 'text-purple-600';
      case 'error':
        return 'text-red-600';
      case 'conversion':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'pageview':
        return <Badge variant="outline">Visualização</Badge>;
      case 'click':
        return <Badge variant="secondary">Clique</Badge>;
      case 'form':
        return <Badge variant="secondary">Formulário</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'conversion':
        return <Badge className="bg-green-100 text-green-800">Conversão</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline da Sessão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !sessionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar a timeline da sessão.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline da Sessão
          </CardTitle>
          {sessionData.outcome && (
            <Badge
              variant={
                sessionData.outcome === 'conversion' ? 'default' :
                  sessionData.outcome === 'abandonment' ? 'destructive' :
                    'secondary'
              }
            >
              {sessionData.outcome}
            </Badge>
          )}
        </div>

        {/* Session Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Usuário {sessionData.userId.slice(-8)}</span>
            {onUserSelect && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 text-blue-600"
                onClick={() => onUserSelect(sessionData.userId)}
              >
                Ver perfil
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(sessionData.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{sessionData.events.length} eventos</span>
          </div>
          <div className="capitalize">
            {sessionData.device}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {sessionData.events.map((event, index) => (
            <div key={event.id} className="relative">
              <div className="flex items-start gap-4">
                {/* Event Icon & Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background
                    ${getEventColor(event.type)} border-current
                  `}>
                    {getEventIcon(event.type)}
                  </div>

                  {/* Timeline Connector */}
                  {index < sessionData.events.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-2" />
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventBadge(event.type)}
                    <span className="font-medium">{event.action}</span>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Página:</span> {event.page}
                    </div>
                    <div className="flex items-center gap-4">
                      <span>
                        <span className="font-medium">Horário:</span> {' '}
                        {format(new Date(event.timestamp), 'HH:mm:ss', { locale: ptBR })}
                      </span>
                      {event.duration && (
                        <span>
                          <span className="font-medium">Duração:</span> {' '}
                          {formatDuration(event.duration)}
                        </span>
                      )}
                    </div>

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <div className="font-medium mb-1">Metadados:</div>
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Time */}
                <div className="text-right text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), 'HH:mm:ss')}
                  {index > 0 && (
                    <div className="mt-1">
                      +{formatDuration(
                        new Date(event.timestamp).getTime() -
                        new Date(sessionData.events[index - 1].timestamp).getTime()
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Session Summary */}
        <Separator className="my-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <p className="font-medium">{sessionData.events.length}</p>
            <p className="text-muted-foreground">Total Eventos</p>
          </div>
          <div>
            <p className="font-medium">{formatDuration(sessionData.duration)}</p>
            <p className="text-muted-foreground">Duração</p>
          </div>
          <div>
            <p className="font-medium">
              {sessionData.events.filter(e => e.type === 'pageview').length}
            </p>
            <p className="text-muted-foreground">Páginas Visitadas</p>
          </div>
          <div>
            <p className="font-medium capitalize">{sessionData.outcome}</p>
            <p className="text-muted-foreground">Resultado</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}