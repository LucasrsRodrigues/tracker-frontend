import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Clock,
  Users,
  TrendingDown,
  Target,
  MousePointer,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useJourneyData } from '../hooks/useJourneyData';
import { formatDuration, formatNumber, formatPercentage } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { JourneyFilters, UserJourney } from '../types/journey.types';

interface JourneyVisualizationProps {
  filters: JourneyFilters;
  selectedJourney?: UserJourney;
  onJourneySelect?: (journey: UserJourney) => void;
}

export function JourneyVisualization({
  filters,
  selectedJourney,
  onJourneySelect
}: JourneyVisualizationProps) {
  const { data: journeyData, isLoading, error } = useJourneyData(filters);

  const getStepIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'pageview':
      case 'page_view':
        return <Eye className="h-4 w-4" />;
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'conversion':
        return <Target className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'conversion':
        return <Badge className="bg-green-100 text-green-800">Converteu</Badge>;
      case 'abandonment':
        return <Badge variant="destructive">Abandonou</Badge>;
      case 'ongoing':
        return <Badge variant="secondary">Em andamento</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualização de Jornadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !journeyData?.journeys?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualização de Jornadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhuma jornada encontrada para os filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  const journey = selectedJourney || journeyData.journeys[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Journey List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Jornadas ({journeyData.journeys.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
          {journeyData.journeys.slice(0, 20).map((j) => (
            <div
              key={j.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${journey.id === j.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              onClick={() => onJourneySelect?.(j)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Usuário {j.userId.slice(-8)}
                </span>
                {getOutcomeBadge(j.outcome)}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(j.duration)}</span>
                  <span>•</span>
                  <span>{j.steps.length} etapas</span>
                </div>
                <div>
                  {format(new Date(j.startTime), 'dd/MM HH:mm', { locale: ptBR })}
                </div>
                <div className="capitalize">
                  {j.device} • {j.source}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Journey Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Jornada do Usuário {journey.userId.slice(-8)}
            </CardTitle>
            {getOutcomeBadge(journey.outcome)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(journey.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-4 w-4" />
              <span>{journey.steps.length} etapas</span>
            </div>
            <div>
              {format(new Date(journey.startTime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
            {journey.conversionValue && (
              <div className="font-medium text-green-600">
                R$ {journey.conversionValue.toFixed(2)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {journey.steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-4">
                  {/* Step Number & Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                      ${step.isConversion
                        ? 'bg-green-500 text-white'
                        : step.isDropOff
                          ? 'bg-red-500 text-white'
                          : 'bg-primary text-primary-foreground'
                      }
                    `}>
                      {step.isConversion ? (
                        <Target className="h-4 w-4" />
                      ) : step.isDropOff ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < journey.steps.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getStepIcon(step.action)}
                      <span className="font-medium">{step.action}</span>
                      {step.isConversion && (
                        <Badge className="bg-green-100 text-green-800">Conversão</Badge>
                      )}
                      {step.isDropOff && (
                        <Badge variant="destructive">Drop-off</Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Página:</span> {step.page}
                      </div>
                      <div className="flex items-center gap-4">
                        <span>
                          <span className="font-medium">Tempo:</span> {' '}
                          {format(new Date(step.timestamp), 'HH:mm:ss', { locale: ptBR })}
                        </span>
                        <span>
                          <span className="font-medium">Duração:</span> {' '}
                          {formatDuration(step.duration)}
                        </span>
                      </div>

                      {step.metadata && Object.keys(step.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          {Object.entries(step.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Duration */}
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {formatDuration(step.duration)}
                    </div>
                    {index < journey.steps.length - 1 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        +{formatDuration(
                          new Date(journey.steps[index + 1].timestamp).getTime() -
                          new Date(step.timestamp).getTime()
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Journey Summary */}
          <Separator className="my-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">{journey.steps.length}</p>
              <p className="text-sm text-muted-foreground">Total de Etapas</p>
            </div>
            <div>
              <p className="text-xl font-bold">{formatDuration(journey.duration)}</p>
              <p className="text-sm text-muted-foreground">Duração Total</p>
            </div>
            <div>
              <p className="text-xl font-bold capitalize">{journey.device}</p>
              <p className="text-sm text-muted-foreground">Dispositivo</p>
            </div>
            <div>
              <p className="text-xl font-bold capitalize">{journey.source}</p>
              <p className="text-sm text-muted-foreground">Origem</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
