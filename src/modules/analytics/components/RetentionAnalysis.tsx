import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRetentionAnalysis } from '../hooks/useAnalyticsData';
import { formatPercentage } from '@/utils/formatters';
import type { AnalyticsFilters } from '../types/analytics.types';

interface RetentionAnalysisProps {
  filters: AnalyticsFilters;
}

export function RetentionAnalysis({ filters }: RetentionAnalysisProps) {
  const { data: retentionData, isLoading, error } = useRetentionAnalysis(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Retenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !retentionData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Retenção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível carregar os dados de retenção.</p>
        </CardContent>
      </Card>
    );
  }

  const getRetentionColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    if (rate >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRetentionVariant = (rate: number) => {
    if (rate >= 70) return 'default';
    if (rate >= 50) return 'secondary';
    if (rate >= 30) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Retenção por Coorte</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {retentionData.map((cohort) => (
            <div key={cohort.cohort} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{cohort.cohort}</h4>
                  <p className="text-sm text-muted-foreground">
                    {cohort.users} usuários • Período {cohort.period}
                  </p>
                </div>
                <Badge variant={getRetentionVariant(cohort.retentionRate)}>
                  {formatPercentage(cohort.retentionRate)}
                </Badge>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getRetentionColor(cohort.retentionRate)}`}
                  style={{ width: `${cohort.retentionRate}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{cohort.retainedUsers} usuários retidos</span>
                <span>{cohort.users - cohort.retainedUsers} usuários perdidos</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">
                {formatPercentage(
                  retentionData.reduce((acc, curr) => acc + curr.retentionRate, 0) / retentionData.length
                )}
              </p>
              <p className="text-sm text-muted-foreground">Retenção Média</p>
            </div>
            <div>
              <p className="text-xl font-bold">
                {retentionData.reduce((acc, curr) => acc + curr.retainedUsers, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Retidos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}