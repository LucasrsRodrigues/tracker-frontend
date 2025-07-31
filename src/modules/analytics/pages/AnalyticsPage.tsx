import { useState } from 'react';
import { MetricsFilter } from '../components/MetricsFilter';
import { ConversionFunnel } from '../components/ConversionFunnel';
import { RetentionAnalysis } from '../components/RetentionAnalysis';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { ExportData } from '../components/ExportData';
import type { AnalyticsFilters } from '../types/analytics.types';

export function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Metrics</h1>
        <p className="text-muted-foreground">
          Análise detalhada de métricas e comportamento dos usuários
        </p>
      </div>

      {/* Filters */}
      <MetricsFilter onFiltersChange={setFilters} />

      {/* Analytics Content */}
      {filters && (
        <div className="grid gap-6">
          {/* Time Series Chart - Full width */}
          <TimeSeriesChart filters={filters} />

          {/* Two column grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <ConversionFunnel filters={filters} />
            <CategoryBreakdown filters={filters} />
          </div>

          {/* Two column grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <RetentionAnalysis filters={filters} />
            </div>
            <ExportData filters={filters} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!filters && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Configure os filtros acima para visualizar as análises
          </p>
        </div>
      )}
    </div>
  );
}