import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Timer,
  Target,
  Route,
  BarChart3
} from 'lucide-react'
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters'
import { cn } from '@/lib/utils'

interface PathStep {
  step: string
  exitRate: number
}

interface UserPath {
  path: string[]
  userCount: number
  percentage: number
  avgDuration: number
  conversionRate: number
  exitPoints: PathStep[]
}

interface PathAnalysisProps {
  totalUsers: number
  period: { start: Date; end: Date }
  paths: UserPath[]
  topPaths: {
    mostCommon: string[]
    mostSuccessful: string[]
    mostProblematic: string[]
  }
  className?: string
}

export function PathAnalysis({
  totalUsers,
  period,
  paths,
  topPaths,
  className
}: PathAnalysisProps) {
  const [selectedView, setSelectedView] = useState<'paths' | 'sankey' | 'matrix'>('paths')
  const [sortBy, setSortBy] = useState<'userCount' | 'conversionRate' | 'duration'>('userCount')
  const [maxPaths, setMaxPaths] = useState(10)

  const sortedPaths = [...paths]
    .sort((a, b) => {
      switch (sortBy) {
        case 'userCount':
          return b.userCount - a.userCount
        case 'conversionRate':
          return b.conversionRate - a.conversionRate
        case 'duration':
          return a.avgDuration - b.avgDuration
        default:
          return 0
      }
    })
    .slice(0, maxPaths)

  const getPathTypeColor = (path: string[]) => {
    const pathStr = path.join(' → ')
    if (topPaths.mostSuccessful.includes(pathStr)) {
      return 'border-green-200 bg-green-50'
    }
    if (topPaths.mostProblematic.includes(pathStr)) {
      return 'border-red-200 bg-red-50'
    }
    if (topPaths.mostCommon.includes(pathStr)) {
      return 'border-blue-200 bg-blue-50'
    }
    return 'border-gray-200 bg-white'
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const PathVisualization = ({ path }: { path: UserPath }) => (
    <div className={cn(
      'border rounded-lg p-4 transition-all hover:shadow-md',
      getPathTypeColor(path.path)
    )}>
      {/* Path Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {formatNumber(path.userCount)} usuários
          </Badge>
          <Badge
            variant="secondary"
            className={cn('text-xs', getConversionColor(path.conversionRate))}
          >
            {formatPercentage(path.conversionRate)} conversão
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          {formatPercentage(path.percentage)} do total
        </div>
      </div>

      {/* Path Flow */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto">
        {path.path.map((step, index) => (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            <div className="px-3 py-1 bg-white border rounded-md text-sm font-medium">
              {step}
            </div>
            {index < path.path.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Path Metrics */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Duração Média</div>
          <div className="font-medium">{formatDuration(path.avgDuration)}</div>
        </div>

        <div>
          <div className="text-muted-foreground">Etapas</div>
          <div className="font-medium">{path.path.length}</div>
        </div>

        <div>
          <div className="text-muted-foreground">Taxa de Saída</div>
          <div className="font-medium">
            {formatPercentage(100 - path.conversionRate)}
          </div>
        </div>
      </div>

      {/* Exit Points */}
      {path.exitPoints.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Principais pontos de saída:
          </div>
          <div className="flex flex-wrap gap-1">
            {path.exitPoints.slice(0, 3).map((exit, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {exit.step} ({formatPercentage(exit.exitRate)})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Route className="h-5 w-5" />
              Análise de Caminhos
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {formatNumber(totalUsers)} usuários • {period.start.toLocaleDateString()} - {period.end.toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="userCount">Por Volume</SelectItem>
                <SelectItem value="conversionRate">Por Conversão</SelectItem>
                <SelectItem value="duration">Por Duração</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maxPaths.toString()} onValueChange={(value) => setMaxPaths(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paths">Caminhos</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="paths" className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-green-200 bg-green-50"></div>
                <span className="text-xs">Mais Sucessos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-blue-200 bg-blue-50"></div>
                <span className="text-xs">Mais Comuns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-red-200 bg-red-50"></div>
                <span className="text-xs">Mais Problemáticos</span>
              </div>
            </div>

            {/* Paths List */}
            <div className="space-y-3">
              {sortedPaths.map((path, index) => (
                <PathVisualization key={index} path={path} />
              ))}
            </div>

            {paths.length > maxPaths && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setMaxPaths(prev => Math.min(prev + 10, paths.length))}
                >
                  Mostrar Mais ({paths.length - maxPaths} restantes)
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Top Paths Categories */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Mais Comuns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topPaths.mostCommon.slice(0, 3).map((path, index) => {
                    const pathData = paths.find(p => p.path.join(' → ') === path)
                    return (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{path}</div>
                        {pathData && (
                          <div className="text-muted-foreground">
                            {formatNumber(pathData.userCount)} usuários
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Mais Sucessos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topPaths.mostSuccessful.slice(0, 3).map((path, index) => {
                    const pathData = paths.find(p => p.path.join(' → ') === path)
                    return (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{path}</div>
                        {pathData && (
                          <div className="text-green-600">
                            {formatPercentage(pathData.conversionRate)} conversão
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Mais Problemáticos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topPaths.mostProblematic.slice(0, 3).map((path, index) => {
                    const pathData = paths.find(p => p.path.join(' → ') === path)
                    return (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{path}</div>
                        {pathData && (
                          <div className="text-red-600">
                            {formatPercentage(100 - pathData.conversionRate)} abandono
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Path Length Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Análise por Tamanho do Caminho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[2, 3, 4, 5, 6].map(length => {
                    const pathsOfLength = paths.filter(p => p.path.length === length)
                    const totalUsers = pathsOfLength.reduce((sum, p) => sum + p.userCount, 0)
                    const avgConversion = pathsOfLength.length > 0
                      ? pathsOfLength.reduce((sum, p) => sum + p.conversionRate, 0) / pathsOfLength.length
                      : 0

                    return (
                      <div key={length} className="flex items-center justify-between">
                        <div className="text-sm">
                          {length} etapas ({pathsOfLength.length} caminhos)
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(totalUsers)} usuários
                          </div>
                          <div className="text-sm font-medium">
                            {formatPercentage(avgConversion)} conversão média
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{paths.length}</div>
                  <div className="text-sm text-muted-foreground">Caminhos Únicos</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {paths.length > 0 ? (paths.reduce((sum, p) => sum + p.path.length, 0) / paths.length).toFixed(1) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Etapas Médias</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(paths.length > 0 ? paths.reduce((sum, p) => sum + p.conversionRate, 0) / paths.length : 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Conversão Média</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {formatDuration(paths.length > 0 ? paths.reduce((sum, p) => sum + p.avgDuration, 0) / paths.length : 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Duração Média</div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Distribuição de Usuários por Caminho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedPaths.slice(0, 10).map((path, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-xs">
                          {path.path.join(' → ')}
                        </span>
                        <span>{formatNumber(path.userCount)} ({formatPercentage(path.percentage)})</span>
                      </div>
                      <Progress value={path.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}