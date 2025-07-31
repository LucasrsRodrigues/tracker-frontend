import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Route,
  DollarSign,
  Clock
} from 'lucide-react';
import { usePathAnalysis } from '../hooks/usePathAnalysis';
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters';
import type { JourneyFilters, Path } from '../types/journey.types';

interface PathAnalysisProps {
  filters: JourneyFilters;
}

export function PathAnalysis({ filters }: PathAnalysisProps) {
  const { data: pathData, isLoading, error } = usePathAnalysis(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Caminhos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !pathData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Caminhos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível carregar a análise de caminhos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const PathList = ({ paths, title, icon }: { paths: Path[], title: string, icon: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
        <Badge variant="outline">{paths.length}</Badge>
      </div>

      <div className="space-y-3">
        {paths.slice(0, 10).map((path) => (
          <div key={path.id} className="p-4 border rounded-lg space-y-3">
            {/* Path Steps */}
            <div className="flex items-center gap-2 flex-wrap">
              {path.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {step}
                  </Badge>
                  {index < path.steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {/* Path Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-600" />
                <span>{formatNumber(path.count)} usuários</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>{formatPercentage(path.conversionRate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>{formatDuration(path.avgDuration)}</span>
              </div>
              {path.revenue && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span>R$ {path.revenue.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Análise de Caminhos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <p className="text-xl font-bold">{formatNumber(pathData.pathStats.totalPaths)}</p>
            <p className="text-sm text-muted-foreground">Caminhos Únicos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{pathData.pathStats.avgPathLength.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Etapas Médias</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{formatPercentage(pathData.pathStats.conversionRate)}</p>
            <p className="text-sm text-muted-foreground">Taxa Conversão</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">{pathData.pathStats.mostCommonEntry}</p>
            <p className="text-sm text-muted-foreground">Entrada Comum</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">{pathData.pathStats.mostCommonExit}</p>
            <p className="text-sm text-muted-foreground">Saída Comum</p>
          </div>
        </div>

        {/* Path Analysis Tabs */}
        <Tabs defaultValue="common" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="common">Caminhos Comuns</TabsTrigger>
            <TabsTrigger value="conversion">Conversão</TabsTrigger>
            <TabsTrigger value="dropoff">Drop-off</TabsTrigger>
          </TabsList>

          <TabsContent value="common" className="mt-6">
            <PathList
              paths={pathData.commonPaths}
              title="Caminhos Mais Percorridos"
              icon={<Route className="h-4 w-4 text-blue-600" />}
            />
          </TabsContent>

          <TabsContent value="conversion" className="mt-6">
            <PathList
              paths={pathData.conversionPaths}
              title="Caminhos de Maior Conversão"
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            />
          </TabsContent>

          <TabsContent value="dropoff" className="mt-6">
            <PathList
              paths={pathData.dropOffPaths}
              title="Caminhos com Maior Drop-off"
              icon={<TrendingDown className="h-4 w-4 text-red-600" />}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}