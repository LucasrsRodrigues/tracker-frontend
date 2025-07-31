import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Play,
  Pause,
  Square,
  Filter,
  Eye,
  MousePointer,
  AlertTriangle,
  Server,
  Search
} from 'lucide-react';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const eventTypeIcons = {
  user: <Eye className="h-4 w-4" />,
  system: <Server className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />,
  integration: <MousePointer className="h-4 w-4" />,
};

const eventTypeColors = {
  user: 'text-blue-600',
  system: 'text-gray-600',
  error: 'text-red-600',
  integration: 'text-green-600',
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export function EventStream() {
  const [filters, setFilters] = useState({
    types: [] as string[],
    severity: [] as string[],
    providers: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState('');

  const {
    events,
    isConnected,
    isRecording,
    clearEvents,
    toggleRecording,
    pauseRecording,
    resumeRecording,
  } = useRealtimeEvents(filters);

  const filteredEvents = events.filter(event => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.action.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower) ||
        (event.userId && event.userId.toLowerCase().includes(searchLower)) ||
        (event.provider && event.provider.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type as keyof typeof prev], value]
        : prev[type as keyof typeof prev].filter(v => v !== value)
    }));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Stream de Eventos
              <Badge variant="outline">{filteredEvents.length}</Badge>
            </span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
            >
              {isRecording ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRecording ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button size="sm" variant="outline" onClick={clearEvents}>
              <Square className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipos</label>
              <div className="space-y-1">
                {['user', 'system', 'error', 'integration'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onCheckedChange={(checked) =>
                        handleFilterChange('types', type, checked as boolean)
                      }
                    />
                    <label htmlFor={`type-${type}`} className="text-sm capitalize">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Severidade</label>
              <div className="space-y-1">
                {['low', 'medium', 'high', 'critical'].map(severity => (
                  <div key={severity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`severity-${severity}`}
                      checked={filters.severity.includes(severity)}
                      onCheckedChange={(checked) =>
                        handleFilterChange('severity', severity, checked as boolean)
                      }
                    />
                    <label htmlFor={`severity-${severity}`} className="text-sm capitalize">
                      {severity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Providers */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Provedores</label>
              <div className="space-y-1">
                {['celcoin', 'pix_provider', 'payment_gateway'].map(provider => (
                  <div key={provider} className="flex items-center space-x-2">
                    <Checkbox
                      id={`provider-${provider}`}
                      checked={filters.providers.includes(provider)}
                      onCheckedChange={(checked) =>
                        handleFilterChange('providers', provider, checked as boolean)
                      }
                    />
                    <label htmlFor={`provider-${provider}`} className="text-sm">
                      {provider.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event List */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {events.length === 0
                  ? 'Nenhum evento capturado ainda...'
                  : 'Nenhum evento corresponde aos filtros'
                }
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 border-b hover:bg-muted/50 transition-colors"
                  >
                    {/* Icon & Type */}
                    <div className={`mt-1 ${eventTypeColors[event.type]}`}>
                      {eventTypeIcons[event.type]}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{event.action}</span>
                        <Badge
                          className={`text-xs ${severityColors[event.severity]}`}
                        >
                          {event.severity}
                        </Badge>
                        {event.provider && (
                          <Badge variant="outline" className="text-xs">
                            {event.provider}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span className="capitalize">{event.category}</span>
                        {event.userId && <span> • Usuário {event.userId.slice(-8)}</span>}
                        <span> • Sessão {event.sessionId.slice(-8)}</span>
                      </div>

                      {/* Event Data Preview */}
                      {Object.keys(event.data).length > 0 && (
                        <div className="text-xs bg-muted/50 p-2 rounded mt-1">
                          {Object.entries(event.data).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="max-w-[200px] truncate">{String(value)}</span>
                            </div>
                          ))}
                          {Object.keys(event.data).length > 3 && (
                            <div className="text-muted-foreground">
                              +{Object.keys(event.data).length - 3} mais...
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground text-right">
                      {format(new Date(event.timestamp), 'HH:mm:ss.SSS')}
                      <div className="mt-1">
                        {format(new Date(event.timestamp), 'dd/MM', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}