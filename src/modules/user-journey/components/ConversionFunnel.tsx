import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, Users, Target } from 'lucide-react';
import { useConversionPaths } from '../hooks/useJourneyData';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import type { JourneyFilters, FunnelStep } from '../types/journey.types';

interface ConversionFunnelProps {
  filters: JourneyFilters;
}

export function ConversionFunnel({ filters }: ConversionFunnelProps) {
  const { data: funnelData, isLoading, error } = useConversionPaths(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !funnelData?.steps?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados do funil.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxUsers = Math.max(...funnelData.steps.map(step => step.users));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Funil de Conversão
        </CardTitle>
        <Badge variant="outline">
          {funnelData.steps.length} etapas
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {funnelData.steps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === funnelData.steps.length - 1;
          const previousStep = index > 0 ? funnelData.steps[index - 1] : null;
          const stepConversionRate = previousStep
            ? (step.users / previousStep.users) * 100
            : 100;

          return (
            <div key={step.name} className="space-y-3">
              {/* Step Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isLast ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground'}
                  `}>
                    {isLast ? <Target className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.page}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatNumber(step.users)} usuários</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage(step.conversionRate)} conversão
                  </p>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usuários nesta etapa</span>
                  <span>{formatPercentage((step.users / maxUsers) * 100)}</span>
                </div>
                <Progress
                  value={(step.users / maxUsers) * 100}
                  className="h-4"
                />
              </div>

              {/* Drop-off Analysis */}
              {!isFirst && (
                <div className="ml-11 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stepConversionRate >= 70 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {formatPercentage(stepConversionRate)} passaram da etapa anterior
                      </span>
                    </div>
                    {step.avgTimeToNext && (
                      <span className="text-sm text-muted-foreground">
                        Tempo médio: {Math.round(step.avgTimeToNext / 1000)}s
                      </span>
                    )}
                  </div>

                  {step.dropOffCount > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-sm text-red-800">
                        <TrendingDown className="h-4 w-4" />
                        <span>
                          {formatNumber(step.dropOffCount)} usuários abandonaram
                          ({formatPercentage((step.dropOffCount / (previousStep?.users || 1)) * 100)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Separator */}
              {!isLast && (
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
            </div>
          );
        })}

        {/* Funnel Summary */}
        <div className="pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {formatNumber(funnelData.steps[0]?.users || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Usuários Iniciais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(funnelData.steps[funnelData.steps.length - 1]?.users || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Conversões</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(funnelData.steps[funnelData.steps.length - 1]?.conversionRate || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Taxa Final</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
