import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingDown,
  TrendingUp,
  Users,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatNumber, formatPercentage } from '@/utils/formatters'
import { cn } from '@/lib/utils'

interface FunnelStep {
  step: {
    id: string
    name: string
    category: string
    action: string
    order: number
    isConversion?: boolean
    isOptional?: boolean
  }
  users: number
  conversionRate: number
  dropoffRate: number
  avgTimeToNext?: number
  medianTimeToNext?: number
}

interface FunnelVisualizationProps {
  funnelName: string
  totalUsers: number
  overallConversionRate: number
  steps: FunnelStep[]
  bottlenecks?: Array<{
    stepIndex: number
    dropoffRate: number
    reasons?: string[]
  }>
  period: { start: Date; end: Date }
  onStepClick?: (step: FunnelStep, index: number) => void
  onEditFunnel?: () => void
  className?: string
}

export function FunnelVisualization({
  funnelName,
  totalUsers,
  overallConversionRate,
  steps,
  bottlenecks = [],
  period,
  onStepClick,
  onEditFunnel,
  className
}: FunnelVisualizationProps) {
  const getStepWidth = (users: number) => {
    const maxUsers = Math.max(...steps.map(s => s.users))
    return Math.max((users / maxUsers) * 100, 10) // Minimum 10% width
  }

  const getDropoffColor = (dropoffRate: number) => {
    if (dropoffRate < 10) return 'text-green-600'
    if (dropoffRate < 25) return 'text-yellow-600'
    if (dropoffRate < 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const isBottleneck = (stepIndex: number) => {
    return bottlenecks.some(b => b.stepIndex === stepIndex)
  }

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-'
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{funnelName}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {formatNumber(totalUsers)} usuários • {formatPercentage(overallConversionRate)} conversão geral
              </span>
              <span>
                {period.start.toLocaleDateString()} - {period.end.toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEditFunnel}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Exportar Dados
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Comparar Períodos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Funnel Steps */}
          <div className="space-y-4">
            {steps.map((stepData, index) => {
              const isLast = index === steps.length - 1
              const width = getStepWidth(stepData.users)
              const isBottleneckStep = isBottleneck(index)

              return (
                <div key={stepData.step.id} className="space-y-2">
                  {/* Step Container */}
                  <div
                    className={cn(
                      "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                      "rounded-lg border-2 p-4",
                      isBottleneckStep
                        ? "border-red-200 bg-red-50 hover:border-red-300"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                    style={{ width: `${width}%` }}
                    onClick={() => onStepClick?.(stepData, index)}
                  >
                    {/* Bottleneck Indicator */}
                    {isBottleneckStep && (
                      <div className="absolute -top-2 -right-2">
                        <Badge variant="destructive" className="text-xs">
                          Gargalo
                        </Badge>
                      </div>
                    )}

                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {index + 1}. {stepData.step.name}
                        </span>

                        {stepData.step.isConversion && (
                          <Badge variant="secondary" className="text-xs">
                            Conversão
                          </Badge>
                        )}

                        {stepData.step.isOptional && (
                          <Badge variant="outline" className="text-xs">
                            Opcional
                          </Badge>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {formatNumber(stepData.users)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          usuários
                        </div>
                      </div>
                    </div>

                    {/* Step Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Conversão</div>
                        <div className="font-medium flex items-center gap-1">
                          {formatPercentage(stepData.conversionRate)}
                          {stepData.conversionRate > 70 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : stepData.conversionRate < 30 ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Abandono</div>
                        <div className={cn(
                          "font-medium",
                          getDropoffColor(stepData.dropoffRate)
                        )}>
                          {formatPercentage(stepData.dropoffRate)}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Tempo Médio</div>
                        <div className="font-medium">
                          {formatTime(stepData.avgTimeToNext)}
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Tempo Mediano</div>
                        <div className="font-medium">
                          {formatTime(stepData.medianTimeToNext)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <Progress
                        value={stepData.conversionRate}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Dropoff Arrow */}
                  {!isLast && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowDown className="h-4 w-4" />
                        <span>
                          {formatNumber(stepData.users - (steps[index + 1]?.users || 0))} usuários abandonaram
                        </span>
                        <span className={cn(
                          "font-medium",
                          getDropoffColor(stepData.dropoffRate)
                        )}>
                          ({formatPercentage(stepData.dropoffRate)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottlenecks Summary */}
          {bottlenecks.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Principais Gargalos Identificados
              </h4>

              <div className="space-y-2">
                {bottlenecks.map((bottleneck, index) => {
                  const step = steps[bottleneck.stepIndex]
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {step?.step.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(bottleneck.dropoffRate)} de abandono
                        </div>
                        {bottleneck.reasons && bottleneck.reasons.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Possíveis causas: {bottleneck.reasons.join(', ')}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => step && onStepClick?.(step, bottleneck.stepIndex)}
                      >
                        Analisar
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
                <div className="text-sm text-muted-foreground">Usuários Iniciais</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatNumber(Math.round(totalUsers * overallConversionRate / 100))}
                </div>
                <div className="text-sm text-muted-foreground">Conversões</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(overallConversionRate)}
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {steps.length}
                </div>
                <div className="text-sm text-muted-foreground">Etapas do Funil</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}