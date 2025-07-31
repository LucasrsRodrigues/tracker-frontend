import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  RefreshCw,
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { formatPercentage, formatDuration, formatNumber } from '@/utils/formatters';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces baseadas na estrutura do projeto
interface SlaMetrics {
  provider: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  breaches: SlaBreach[];
  trend: 'improving' | 'stable' | 'degrading';
  history: Array<{
    period: string;
    value: number;
    target: number;
  }>;
  category: 'availability' | 'performance' | 'error_rate';
  description: string;
}

interface SlaBreach {
  timestamp: Date;
  duration: number;
  impact: 'minor' | 'major' | 'critical';
  reason: string;
  resolved: boolean;
  affectedUsers?: number;
}

interface SlaOverview {
  totalSlas: number;
  meetingSlas: number;
  atRiskSlas: number;
  breachedSlas: number;
  overallCompliance: number;
  monthlyTrend: number;
  criticalBreaches: number;
  avgResolutionTime: number;
}

// Mock data
const mockSlaMetrics: SlaMetrics[] = [
  {
    provider: 'API Gateway',
    target: 99.9,
    current: 99.95,
    period: 'monthly',
    category: 'availability',
    description: 'Disponibilidade do Gateway de API',
    trend: 'improving',
    breaches: [
      {
        timestamp: new Date(Date.now() - 86400000 * 2),
        duration: 300,
        impact: 'minor',
        reason: 'Manutenção programada',
        resolved: true,
        affectedUsers: 25
      }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      period: format(subDays(new Date(), 29 - i), 'dd/MM'),
      value: 99.8 + Math.random() * 0.4,
      target: 99.9
    }))
  },
  {
    provider: 'Database',
    target: 99.5,
    current: 99.2,
    period: 'monthly',
    category: 'availability',
    description: 'Disponibilidade do banco de dados principal',
    trend: 'degrading',
    breaches: [
      {
        timestamp: new Date(Date.now() - 86400000),
        duration: 1800,
        impact: 'major',
        reason: 'Falha de hardware',
        resolved: true,
        affectedUsers: 150
      },
      {
        timestamp: new Date(Date.now() - 86400000 * 5),
        duration: 600,
        impact: 'minor',
        reason: 'Timeout de queries',
        resolved: true,
        affectedUsers: 45
      }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      period: format(subDays(new Date(), 29 - i), 'dd/MM'),
      value: 99.0 + Math.random() * 0.8,
      target: 99.5
    }))
  },
  {
    provider: 'CDN',
    target: 99.99,
    current: 99.98,
    period: 'monthly',
    category: 'performance',
    description: 'Performance da rede de distribuição',
    trend: 'stable',
    breaches: [],
    history: Array.from({ length: 30 }, (_, i) => ({
      period: format(subDays(new Date(), 29 - i), 'dd/MM'),
      value: 99.9 + Math.random() * 0.1,
      target: 99.99
    }))
  },
  {
    provider: 'Payment Service',
    target: 99.95,
    current: 98.8,
    period: 'monthly',
    category: 'availability',
    description: 'Serviço de processamento de pagamentos',
    trend: 'degrading',
    breaches: [
      {
        timestamp: new Date(Date.now() - 86400000 * 3),
        duration: 3600,
        impact: 'critical',
        reason: 'Sobrecarga do sistema',
        resolved: false,
        affectedUsers: 500
      }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      period: format(subDays(new Date(), 29 - i), 'dd/MM'),
      value: 98.5 + Math.random() * 1.5,
      target: 99.95
    }))
  }
];

const mockOverview: SlaOverview = {
  totalSlas: 4,
  meetingSlas: 2,
  atRiskSlas: 1,
  breachedSlas: 1,
  overallCompliance: 99.2,
  monthlyTrend: -0.3,
  criticalBreaches: 1,
  avgResolutionTime: 1350
};

const COLORS = {
  meeting: '#10b981',
  at_risk: '#f59e0b',
  breached: '#ef4444',
  stable: '#6b7280'
};

export function SlaIndicators() {
  const [slaMetrics] = useState<SlaMetrics[]>(mockSlaMetrics);
  const [overview] = useState<SlaOverview>(mockOverview);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'degrading':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (current: number, target: number) => {
    if (current >= target) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (current >= target * 0.95) {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getComplianceStatus = (current: number, target: number) => {
    if (current >= target) return 'meeting';
    if (current >= target * 0.95) return 'at_risk';
    return 'breached';
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'meeting': return 'text-green-600 bg-green-50 border-green-200';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'breached': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplianceLabel = (status: string) => {
    switch (status) {
      case 'meeting': return 'Atendendo';
      case 'at_risk': return 'Em Risco';
      case 'breached': return 'Violado';
      default: return 'Desconhecido';
    }
  };

  const getBreachImpactColor = (impact: string) => {
    switch (impact) {
      case 'minor': return 'text-yellow-600 bg-yellow-50';
      case 'major': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getBreachImpactLabel = (impact: string) => {
    switch (impact) {
      case 'minor': return 'Menor';
      case 'major': return 'Maior';
      case 'critical': return 'Crítico';
      default: return impact;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'availability': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'error_rate': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredMetrics = slaMetrics.filter(metric =>
    selectedCategory === 'all' || metric.category === selectedCategory
  );

  const complianceDistribution = [
    { name: 'Atendendo', value: overview.meetingSlas, color: COLORS.meeting },
    { name: 'Em Risco', value: overview.atRiskSlas, color: COLORS.at_risk },
    { name: 'Violado', value: overview.breachedSlas, color: COLORS.breached }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SLA & Compliance</h2>
          <p className="text-muted-foreground">
            Monitoramento de acordos de nível de serviço e compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="availability">Disponibilidade</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="error_rate">Taxa de Erro</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total SLAs
                </p>
                <p className="text-2xl font-bold">
                  {overview.totalSlas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Atendendo
                </p>
                <p className="text-2xl font-bold">
                  {overview.meetingSlas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Em Risco
                </p>
                <p className="text-2xl font-bold">
                  {overview.atRiskSlas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Compliance Médio
                </p>
                <p className="text-2xl font-bold">
                  {formatPercentage(overview.overallCompliance)}
                </p>
                <div className="flex items-center text-xs">
                  {overview.monthlyTrend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  <span className={overview.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {overview.monthlyTrend > 0 ? '+' : ''}{overview.monthlyTrend}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compliance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complianceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {complianceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Breaches */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Violações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaMetrics
                .flatMap(sla => sla.breaches.map(breach => ({ ...breach, provider: sla.provider })))
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 5)
                .map((breach, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${breach.resolved ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      <div>
                        <div className="font-medium text-sm">{breach.provider}</div>
                        <div className="text-xs text-muted-foreground">{breach.reason}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${getBreachImpactColor(breach.impact)}`}>
                        {getBreachImpactLabel(breach.impact)}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDuration(breach.duration)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredMetrics.map((sla) => {
          const status = getComplianceStatus(sla.current, sla.target);

          return (
            <Card key={sla.provider}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(sla.category)}
                    <CardTitle className="text-lg">{sla.provider}</CardTitle>
                  </div>
                  {getStatusIcon(sla.current, sla.target)}
                </div>
                <p className="text-sm text-muted-foreground">{sla.description}</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                    <TabsTrigger value="breaches">Violações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status Atual</span>
                        <Badge className={getComplianceColor(status)}>
                          {getComplianceLabel(status)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compliance</span>
                          <span className="font-medium">{formatPercentage(sla.current)}</span>
                        </div>
                        <Progress
                          value={sla.current}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Meta: {formatPercentage(sla.target)}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(sla.trend)}
                            <span className={`${sla.current >= sla.target ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {sla.current >= sla.target ? '+' : ''}{formatPercentage(sla.current - sla.target)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sla.history}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis domain={[Math.min(...sla.history.map(h => h.value)) - 0.1, 100]} />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              `${value.toFixed(2)}%`,
                              name === 'value' ? 'Atual' : 'Meta'
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="value"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="target"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="breaches" className="mt-4">
                    <div className="space-y-3">
                      {sla.breaches.length > 0 ? (
                        sla.breaches.slice(0, 5).map((breach, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${breach.resolved ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                              <div>
                                <div className="text-sm font-medium">{breach.reason}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(breach.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`text-xs ${getBreachImpactColor(breach.impact)}`}>
                                {getBreachImpactLabel(breach.impact)}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDuration(breach.duration)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                          <p>Nenhuma violação registrada</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}