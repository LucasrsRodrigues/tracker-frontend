import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useConversionFunnel } from '../hooks/useAnalyticsData';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { AnalyticsFilters } from '../types/analytics.types';

interface ConversionFunnelProps {
  filters: AnalyticsFilters;
}

export function ConversionFunnel({ filters }: ConversionFunnelProps) {
  const { data: funnelData, isLoading, error } = useConversionFunnel(filters);

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
              <div className="h-6 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !funnelData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível carregar os dados do funil.</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...funnelData.map(step => step.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {funnelData.map((step, index) => {
          const isFirst = index === 0;
          const previousStep = index > 0 ? funnelData[index - 1] : null;
          const stepConversionRate = previousStep
            ? (step.total / previousStep.total) * 100
            : 100;

          return (
            <div key={step.step} className="space-y-3">
              {/* Step Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.step}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(step.total)} usuários
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPercentage(step.conversionRate)}</p>
                  {!isFirst && (
                    <div className="flex items-center gap-1 text-sm">
                      {stepConversionRate >= 50 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={stepConversionRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(stepConversionRate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress
                  value={(step.total / maxValue) * 100}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatNumber(step.converted)} convertidos</span>
                  <span>{formatNumber(step.dropOff)} abandonaram ({formatPercentage(step.dropOffRate)})</span>
                </div>
              </div>

              {/* Drop-off visualization */}
              {step.dropOff > 0 && (
                <div className="ml-11 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <TrendingDown className="h-4 w-4" />
                    <span>
                      {formatNumber(step.dropOff)} usuários abandonaram nesta etapa
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(funnelData[funnelData.length - 1]?.conversionRate || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Conversão Final</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatNumber(funnelData[0]?.total || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Usuários Iniciais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(funnelData[funnelData.length - 1]?.converted || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Conversões</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
