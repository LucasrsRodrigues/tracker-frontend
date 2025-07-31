import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { usePerformanceOverview } from '../hooks/usePerformanceMetrics';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ResponseTimeChart() {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const { data: performanceData, isLoading } = usePerformanceOverview(timeRange);

  const timeRangeOptions = [
    { value: '1h', label: '1 hora' },
    { value: '6h', label: '6 horas' },
    { value: '24h', label: '24 horas' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
  ];

  const getTimeFormat = (timeRange: string) => {
    switch (timeRange) {
      case '1h':
      case '6h':
        return 'HH:mm';
      case '24h':
        return 'HH:mm';
      case '7d':
        return 'dd/MM';
      case '30d':
        return 'dd/MM';
      default:
        return 'HH:mm';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">
            {format(new Date(label), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}ms
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tempo de Resposta
        </CardTitle>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="grid grid-cols-5">
              {timeRangeOptions.map(option => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{performanceData?.summary.averageResponseTime || 0}ms</p>
            <p className="text-sm text-muted-foreground">Média</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{performanceData?.summary.p95ResponseTime || 0}ms</p>
            <p className="text-sm text-muted-foreground">P95</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{performanceData?.summary.p99ResponseTime || 0}ms</p>
            <p className="text-sm text-muted-foreground">P99</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {performanceData?.summary.trend === 'improving' ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <p className="text-2xl font-bold">
                {performanceData?.summary.trendPercentage || 0}%
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Tendência</p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Linha
          </Button>
          <Button
            variant={chartType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('area')}
          >
            Área
          </Button>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={performanceData?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => format(new Date(value), getTimeFormat(timeRange))}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <DataComponent
                type="monotone"
                dataKey="averageResponseTime"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={chartType === 'area' ? '#3b82f6' : undefined}
                fillOpacity={chartType === 'area' ? 0.3 : undefined}
                name="Tempo Médio"
              />
              <DataComponent
                type="monotone"
                dataKey="p95ResponseTime"
                stroke="#10b981"
                strokeWidth={2}
                fill={chartType === 'area' ? '#10b981' : undefined}
                fillOpacity={chartType === 'area' ? 0.2 : undefined}
                name="P95"
                strokeDasharray="5 5"
              />
              <DataComponent
                type="monotone"
                dataKey="p99ResponseTime"
                stroke="#f59e0b"
                strokeWidth={2}
                fill={chartType === 'area' ? '#f59e0b' : undefined}
                fillOpacity={chartType === 'area' ? 0.1 : undefined}
                name="P99"
                strokeDasharray="3 3"
              />
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}