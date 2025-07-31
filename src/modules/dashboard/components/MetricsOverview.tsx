import { KpiCard } from './KpiCard';
import { Users, Activity, AlertTriangle, Clock, TrendingUp, Zap } from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { formatNumber, formatDuration, formatPercentage } from '@/utils/formatters';

export function MetricsOverview() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCard
            key={i}
            title="Erro ao carregar"
            value="--"
            variant="error"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        title="Eventos Totais"
        value={formatNumber(metrics?.totalEvents || 0)}
        icon={<Activity className="h-4 w-4 text-blue-600" />}
        loading={isLoading}
      />

      <KpiCard
        title="Usuários Únicos"
        value={formatNumber(metrics?.uniqueUsers || 0)}
        icon={<Users className="h-4 w-4 text-green-600" />}
        loading={isLoading}
      />

      <KpiCard
        title="Sessões Ativas"
        value={formatNumber(metrics?.activeSessions || 0)}
        icon={<Zap className="h-4 w-4 text-yellow-600" />}
        loading={isLoading}
      />

      <KpiCard
        title="Taxa de Erro"
        value={formatPercentage(metrics?.errorRate || 0)}
        icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
        variant={metrics?.errorRate && metrics.errorRate > 5 ? 'error' : 'default'}
        loading={isLoading}
      />

      <KpiCard
        title="Tempo Resposta"
        value={formatDuration(metrics?.avgResponseTime || 0)}
        icon={<Clock className="h-4 w-4 text-purple-600" />}
        variant={metrics?.avgResponseTime && metrics.avgResponseTime > 1000 ? 'warning' : 'default'}
        loading={isLoading}
      />

      <KpiCard
        title="Taxa Conversão"
        value={formatPercentage(metrics?.conversionRate || 0)}
        icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
        loading={isLoading}
      />
    </div>
  );
}