import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercentage } from '@/utils/formatters'

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'custom'
  icon?: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
  isLoading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  description,
  trend,
  trendValue,
  isLoading = false,
  className,
  size = 'md',
  color = 'default'
}: MetricCardProps) {

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'number':
        return formatNumber(val)
      case 'percentage':
        return formatPercentage(val)
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val)
      case 'duration':
        return `${val}ms`
      default:
        return val.toString()
    }
  }

  const calculateTrend = (): { direction: 'up' | 'down' | 'neutral'; percentage: number } => {
    if (trend) {
      return {
        direction: trend,
        percentage: trendValue || 0
      }
    }

    if (typeof value === 'number' && previousValue !== undefined) {
      const change = ((value - previousValue) / previousValue) * 100
      return {
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        percentage: Math.abs(change)
      }
    }

    return { direction: 'neutral', percentage: 0 }
  }

  const trendInfo = calculateTrend()

  const getTrendIcon = () => {
    switch (trendInfo.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trendInfo.direction) {
      case 'up':
        return 'text-green-600 bg-green-50'
      case 'down':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getCardColor = () => {
    switch (color) {
      case 'primary':
        return 'border-primary/20 bg-primary/5'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'danger':
        return 'border-red-200 bg-red-50'
      default:
        return ''
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          icon: 'h-4 w-4',
          title: 'text-xs',
          value: 'text-lg',
          description: 'text-xs'
        }
      case 'lg':
        return {
          card: 'p-6',
          icon: 'h-6 w-6',
          title: 'text-base',
          value: 'text-3xl',
          description: 'text-sm'
        }
      default:
        return {
          card: 'p-4',
          icon: 'h-5 w-5',
          title: 'text-sm',
          value: 'text-2xl',
          description: 'text-sm'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (isLoading) {
    return (
      <Card className={cn('relative', getCardColor(), className)}>
        <CardContent className={sizeClasses.card}>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            {Icon && <Skeleton className={cn('rounded', sizeClasses.icon)} />}
          </div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('relative', getCardColor(), className)}>
      <CardContent className={sizeClasses.card}>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className={cn('font-medium text-muted-foreground', sizeClasses.title)}>
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn(
              'rounded-full p-2 bg-background/50',
              color === 'primary' && 'bg-primary/10 text-primary',
              color === 'success' && 'bg-green-100 text-green-600',
              color === 'warning' && 'bg-yellow-100 text-yellow-600',
              color === 'danger' && 'bg-red-100 text-red-600'
            )}>
              <Icon className={sizeClasses.icon} />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <div className={cn('font-bold text-foreground', sizeClasses.value)}>
            {formatValue(value)}
          </div>

          {(trendInfo.percentage > 0 || trend) && (
            <Badge
              variant="secondary"
              className={cn('flex items-center gap-1 text-xs px-2 py-0.5', getTrendColor())}
            >
              {getTrendIcon()}
              {formatPercentage(trendInfo.percentage, 1)}
            </Badge>
          )}
        </div>

        {description && (
          <p className={cn('text-muted-foreground mt-1', sizeClasses.description)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}