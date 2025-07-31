import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber, formatDuration } from '@/utils/formatters';
import type { AlertStats as AlertStatsType } from '../types/alerts.types';

// Mock data - replace with real data from your service
const mockStats: AlertStatsType = {
  totalRules: 24,
  activeRules: 18,
  firingAlerts: 3,
  acknowledgedAlerts: 5,
  suppressedAlerts: 2,
  resolvedToday: 12,
  avgResolutionTime: 1800, // 30 minutes in seconds
  topFiringRules: [
    { ruleId: '1', ruleName: 'High Error Rate API', count: 8 },
    { ruleId: '2', ruleName: 'Database Connection Issues', count: 5 },
    { ruleId: '3', ruleName: 'Memory Usage Spike', count: 4 },
  ],
  alertsByHour: [
    { hour: 0, count: 2 },
    { hour: 1, count: 1 },
    { hour: 2, count: 0 },
    { hour: 3, count: 1 },
    { hour: 4, count: 0 },
    { hour: 5, count: 0 },
    { hour: 6, count: 3 },
    { hour: 7, count: 5 },
    { hour: 8, count: 4 },
    { hour: 9, count: 6 },
    { hour: 10, count: 8 },
    { hour: 11, count: 7 },
    { hour: 12, count: 5 },
    { hour: 13, count: 4 },
    { hour: 14, count: 6 },
    { hour: 15, count: 9 },
    { hour: 16, count: 7 },
    { hour: 17, count: 5 },
    { hour: 18, count: 3 },
    { hour: 19, count: 2 },
    { hour: 20, count: 1 },
    { hour: 21, count: 2 },
    { hour: 22, count: 1 },
    { hour: 23, count: 1 },
  ]
};

export function AlertStats() {
  const stats = mockStats; // Replace with actual hook/service call

  const getStatusColor = (status: string, count: number) => {
    if (count === 0) return 'text-muted-foreground';

    switch (status) {
      case 'firing': return 'text-red-600';
      case 'acknowledged': return 'text-blue-600';
      case 'suppressed': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const totalActiveAlerts = stats.firingAlerts + stats.acknowledgedAlerts + stats.suppressedAlerts;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Rules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regras de Alerta</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalRules)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{formatNumber(stats.activeRules)} ativas</span>
            <Badge variant="outline" className="text-xs">
              {Math.round((stats.activeRules / stats.totalRules) * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalActiveAlerts)}</div>
          <div className="flex items-center space-x-3 text-xs">
            <span className={getStatusColor('firing', stats.firingAlerts)}>
              {stats.firingAlerts} disparando
            </span>
            <span className={getStatusColor('acknowledged', stats.acknowledgedAlerts)}>
              {stats.acknowledgedAlerts} reconhecidos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Resolved Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.resolvedToday)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span>+15% vs ontem</span>
          </div>
        </CardContent>
      </Card>

      {/* Avg Resolution Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio Resolução</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(stats.avgResolutionTime)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
            <span>-8% vs ontem</span>
          </div>
        </CardContent>
      </Card>

      {/* Alerts by Hour Chart */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Alertas por Hora (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.alertsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}h`}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label) => `${label}:00`}
                  formatter={(value: number) => [formatNumber(value), 'Alertas']}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Firing Rules */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Regras Mais Acionadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topFiringRules.map((rule, index) => (
              <div key={rule.ruleId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {rule.ruleName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {formatNumber(rule.count)}
                  </Badge>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((rule.count / Math.max(...stats.topFiringRules.map(r => r.count))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}