import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCategoryBreakdown } from '../hooks/useAnalyticsData';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import type { AnalyticsFilters } from '../types/analytics.types';

interface CategoryBreakdownProps {
  filters: AnalyticsFilters;
}

export function CategoryBreakdown({ filters }: CategoryBreakdownProps) {
  const { data: categoryData, isLoading, error } = useCategoryBreakdown(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !categoryData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível carregar os dados de categoria.</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">
            Valor: {formatNumber(data.value)}
          </p>
          <p className="text-sm">
            Percentual: {formatPercentage(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ category, percentage }) => `${category}: ${formatPercentage(percentage)}`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {categoryData.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm capitalize">{item.category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatNumber(item.value)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(item.percentage)}
                  {item.change && (
                    <span className={item.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {' '}({item.change > 0 ? '+' : ''}{item.change}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}