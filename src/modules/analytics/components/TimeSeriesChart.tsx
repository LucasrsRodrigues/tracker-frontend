import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AnalyticsFilters } from '../types/analytics.types';

interface TimeSeriesChartProps {
  filters: AnalyticsFilters;
}

export function TimeSeriesChart({ filters }: TimeSeriesChartProps) {
  const { data: analyticsData, isLoading, error } = useAnalyticsData(filters);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData?.trend?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível carregar os dados de tendência.</p>
        </CardContent>
      </Card>
    );
  }

  const formatXAxisTick = (tickItem: any) => {
    return format(new Date(tickItem), 'dd/MM', { locale: ptBR });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">
            {format(new Date(label), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tendência Temporal</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Linha
          </Button>
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Área
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={analyticsData.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisTick}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <DataComponent
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={chartType === 'area' ? '#3b82f6' : undefined}
                fillOpacity={chartType === 'area' ? 0.3 : undefined}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
