import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  variant = 'default',
}: KpiCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return <Minus className="h-4 w-4" />;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return 'text-muted-foreground';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getVariantStyles = () => {
    const styles = {
      default: 'border-border',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50',
    };
    return styles[variant];
  };

  if (loading) {
    return (
      <Card className={cn('transition-all duration-200', getVariantStyles())}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardTitle>
          {icon && <div className="h-4 w-4 bg-muted animate-pulse rounded" />}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn('flex items-center text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {Math.abs(change)}% {changeLabel || 'vs último período'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}