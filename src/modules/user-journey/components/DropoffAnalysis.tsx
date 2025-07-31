import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingDown,
  AlertTriangle,
  Users,
  Clock,
  MousePointer
} from 'lucide-react';
import { useDropOffAnalysis } from '../hooks/useJourneyData';
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters';
import type { JourneyFilters } from '../types/journey.types';

interface DropoffAnalysisProps {
  filters: JourneyFilters;
}

export function DropoffAnalysis({ filters }: DropoffAnalysisProps) {
  const { data: dropOffData, isLoading, error } = useDropOffAnalysis(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Drop-off</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !dropOffData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Drop-off</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar a análise de drop-off.
          </p>
        </CardContent>
      </Card>
    );
  }

  const criticalDropOffs = dropOffData.dropOffPoints?.filter(point => point.dropOffRate > 30) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Análise de Drop-off
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Alerts */}
        {criticalDropOffs.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{criticalDropOffs.length} pontos críticos</strong> com taxa de abandono superior a 30%
            </AlertDescription>
          </Alert>
        )}

        {/* Drop-off Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">
              {formatPercentage(dropOffData.overallDropOffRate)}
            </p>
            <p className="text-sm text-muted-foreground">Taxa Geral de Drop-off</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatNumber(dropOffData.totalDropOffs)}
            </p>
            <p className="text-sm text-muted-foreground">Total de Abandonos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {dropOffData.avgTimeToDropOff ? formatDuration(dropOffData.avgTimeToDropOff) : '--'}
            </p>
            <p className="text-sm text-muted-foreground">Tempo Médio até Abandono</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {dropOffData.mostCommonDropOffStep || '--'}
            </p>
            <p className="text-sm text-muted-foreground">Etapa Mais Crítica</p>
          </div>
        </div>

        {/* Drop-off Points Detail */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Pontos de Drop-off por Etapa
          </h3>

          {dropOffData.dropOffPoints?.map((point, index) => (
            <div key={point.step} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${point.dropOffRate > 30
                      ? 'bg-red-500 text-white'
                      : point.dropOffRate > 15
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500 text-white'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{point.step}</p>
                    <p className="text-sm text-muted-foreground">
                      {point.page}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      point.dropOffRate > 30
                        ? 'destructive'
                        : point.dropOffRate > 15
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {formatPercentage(point.dropOffRate)}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa de abandono</span>
                  <span>{formatNumber(point.dropOffCount)} usuários</span>
                </div>
                <Progress
                  value={point.dropOffRate}
                  className={`h-3 ${point.dropOffRate > 30 ? '[&>div]:bg-red-500' :
                      point.dropOffRate > 15 ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-green-500'
                    }`}
                />
              </div>

              {/* Additional Metrics */}
              <div className="ml-11 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(point.totalUsers)} usuários totais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {point.avgTimeOnStep ? formatDuration(point.avgTimeOnStep) : '--'} tempo médio
                  </span>
                </div>
                {point.commonExitActions && (
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-3 w-3" />
                    <span>Saída: {point.commonExitActions.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {point.dropOffRate > 20 && point.recommendations && (
                <div className="ml-11 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Recomendações para melhorar:
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {point.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recovery Analysis */}
        {dropOffData.recoveryRate && (
          <div className="pt-6 border-t">
            <h3 className="font-medium mb-3">Análise de Recuperação</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">
                  {formatPercentage(dropOffData.recoveryRate)}
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Recuperação</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {dropOffData.avgRecoveryTime ? formatDuration(dropOffData.avgRecoveryTime) : '--'}
                </p>
                <p className="text-sm text-muted-foreground">Tempo Médio de Retorno</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}