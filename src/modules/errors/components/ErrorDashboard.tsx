import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Bug,
  Activity,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useErrorDashboard } from '../hooks/useErrorsData';
import { useErrorTrends } from '../hooks/useErrorTrends';
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ErrorFilters } from '../types/errors.types';

interface ErrorDashboardProps {
  filters: ErrorFilters;
  onGroupSelect?: (groupId: string) => void;
}

export function ErrorDashboard({ filters, onGroupSelect }: ErrorDashboardProps) {
  const { data: dashboardData, isLoading: dashboardLoading } = useErrorDashboard(filters);
  const { chartData, metrics, timeRange, setTimeRange, isLoading: trendsLoading } = useErrorTrends(filters);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-800">Alto</Badge>;
      case 'medium': return <Badge variant="secondary">Médio</Badge>;
      case 'low': return <Badge variant="outline">Baixo</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (dashboardLoading || trendsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
            <Bug className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalErrors || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-red-600" />
              <span>+12% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Afetados</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalUsers || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span>-5% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <Target className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.errorRate || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Meta: {'<'}2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(metrics?.criticalErrors || 0)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Tempo médio: {formatDuration(metrics?.avgResolutionTime || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Error Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tendência de Erros</CardTitle>
            <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hour">Hora</TabsTrigger>
                <TabsTrigger value="day">Dia</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => format(new Date(value), 'dd/MM HH:mm', { locale: ptBR })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm')}
                    formatter={(value, name) => [
                      value,
                      name === 'errors' ? 'Erros' :
                        name === 'users' ? 'Usuários' :
                          'Novos Grupos'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="errors"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#f97316"
                    strokeWidth={2}
                    name="users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Error Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Grupos de Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.topErrors?.slice(0, 5).map((group, index) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onGroupSelect?.(group.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${getSeverityColor(group.severity)}`}>
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate max-w-[200px]">
                          {group.title}
                        </span>
                        {getSeverityBadge(group.severity)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {group.type} • {formatNumber(group.count)} ocorrências
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(group.userCount)} usuários</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(group.lastSeen), { addSuffix: true, locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.bySeverity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Platform */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.byPlatform || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}