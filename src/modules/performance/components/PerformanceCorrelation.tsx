import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown, Activity,
  Users,
  ShoppingCart,
  DollarSign,
  Clock, Target, RefreshCw, PanelRightInactive
} from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter, ComposedChart,
  Area
} from 'recharts';
import { formatDuration, formatPercentage } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para correlação de performance
interface CorrelationMetric {
  name: string;
  category: 'performance' | 'business' | 'user' | 'system';
  value: number;
  trend: 'up' | 'down' | 'stable';
  correlation: number; // -1 to 1
  significance: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  icon: any;
}

interface CorrelationData {
  timestamp: Date;
  responseTime: number;
  conversions: number;
  revenue: number;
  activeUsers: number;
  bounceRate: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  sessionDuration: number;
}

interface BusinessImpact {
  metric: string;
  impactOnRevenue: number;
  impactOnConversions: number;
  impactOnUserSatisfaction: number;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceThreshold {
  metric: string;
  current: number;
  threshold: number;
  optimal: number;
  status: 'good' | 'warning' | 'critical';
  businessImpact: string;
}

// Mock data
const mockCorrelationData: CorrelationData[] = Array.from({ length: 48 }, (_, i) => {
  const baseResponseTime = 200 + Math.sin(i / 8) * 100 + Math.random() * 50;
  const inverseFactor = Math.max(0.1, 1 - (baseResponseTime - 200) / 300);

  return {
    timestamp: new Date(Date.now() - (47 - i) * 1800000), // 30min intervals
    responseTime: baseResponseTime,
    conversions: Math.floor(85 * inverseFactor + Math.random() * 20),
    revenue: Math.floor(12000 * inverseFactor + Math.random() * 3000),
    activeUsers: Math.floor(450 + Math.random() * 100),
    bounceRate: Math.min(100, 25 + (baseResponseTime - 200) / 10 + Math.random() * 15),
    errorRate: Math.max(0, (baseResponseTime - 200) / 50 + Math.random() * 2),
    cpuUsage: Math.min(100, 45 + (baseResponseTime - 200) / 8 + Math.random() * 20),
    memoryUsage: Math.min(100, 60 + Math.random() * 25),
    sessionDuration: Math.max(30, 180 * inverseFactor + Math.random() * 60)
  };
});

const mockCorrelationMetrics: CorrelationMetric[] = [
  {
    name: 'Taxa de Conversão',
    category: 'business',
    value: 3.4,
    trend: 'down',
    correlation: -0.87,
    significance: 'critical',
    impact: 'Cada 100ms de latência reduz conversões em ~2.3%',
    icon: ShoppingCart
  },
  {
    name: 'Receita por Sessão',
    category: 'business',
    value: 24.50,
    trend: 'down',
    correlation: -0.82,
    significance: 'high',
    impact: 'Performance ruim resulta em -$3.20 por sessão',
    icon: DollarSign
  },
  {
    name: 'Taxa de Abandono',
    category: 'user',
    value: 52.3,
    trend: 'up',
    correlation: 0.79,
    significance: 'high',
    impact: 'Cada segundo adicional aumenta abandono em 7%',
    icon: TrendingUp
  },
  {
    name: 'Duração da Sessão',
    category: 'user',
    value: 156,
    trend: 'down',
    correlation: -0.74,
    significance: 'medium',
    impact: 'Usuários ficam 34% menos tempo em páginas lentas',
    icon: Clock
  },
  {
    name: 'NPS Score',
    category: 'user',
    value: 67,
    trend: 'down',
    correlation: -0.71,
    significance: 'medium',
    impact: 'Performance impacta diretamente satisfação',
    icon: Users
  },
  {
    name: 'Uso de CPU',
    category: 'system',
    value: 68.2,
    trend: 'up',
    correlation: 0.65,
    significance: 'medium',
    impact: 'Alto uso correlaciona com lentidão',
    icon: Activity
  }
];

const mockBusinessImpacts: BusinessImpact[] = [
  {
    metric: 'Response Time',
    impactOnRevenue: -15.2,
    impactOnConversions: -18.7,
    impactOnUserSatisfaction: -23.4,
    recommendations: [
      'Implementar cache Redis para queries frequentes',
      'Otimizar algoritmos de busca de produtos',
      'Considerar CDN para assets estáticos'
    ],
    severity: 'critical'
  },
  {
    metric: 'Error Rate',
    impactOnRevenue: -8.9,
    impactOnConversions: -12.3,
    impactOnUserSatisfaction: -16.8,
    recommendations: [
      'Melhorar tratamento de erros no checkout',
      'Implementar retry automático para APIs externas',
      'Adicionar monitoramento proativo'
    ],
    severity: 'high'
  }
];

const mockThresholds: PerformanceThreshold[] = [
  {
    metric: 'Response Time',
    current: 285,
    threshold: 200,
    optimal: 150,
    status: 'critical',
    businessImpact: 'Perda estimada de $1.2K/dia'
  },
  {
    metric: 'Error Rate',
    current: 2.3,
    threshold: 1.0,
    optimal: 0.5,
    status: 'warning',
    businessImpact: 'Impacto moderado na satisfação'
  },
  {
    metric: 'Conversion Rate',
    current: 3.4,
    threshold: 4.0,
    optimal: 5.5,
    status: 'critical',
    businessImpact: 'Conversões 38% abaixo do ideal'
  }
];

export function PerformanceCorrelation() {
  const [correlationData] = useState<CorrelationData[]>(mockCorrelationData);
  const [correlationMetrics] = useState<CorrelationMetric[]>(mockCorrelationMetrics);
  const [businessImpacts] = useState<BusinessImpact[]>(mockBusinessImpacts);
  const [thresholds] = useState<PerformanceThreshold[]>(mockThresholds);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'Muito Forte';
    if (abs >= 0.6) return 'Forte';
    if (abs >= 0.4) return 'Moderada';
    if (abs >= 0.2) return 'Fraca';
    return 'Muito Fraca';
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return correlation > 0 ? 'text-red-600' : 'text-green-600';
    if (abs >= 0.6) return correlation > 0 ? 'text-orange-600' : 'text-blue-600';
    if (abs >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-600" />;
      default: return <PanelRightInactive className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'Bom';
      case 'warning': return 'Atenção';
      case 'critical': return 'Crítico';
      default: return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredMetrics = correlationMetrics.filter(metric =>
    selectedCategory === 'all' || metric.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Correlação de Performance</h2>
          <p className="text-muted-foreground">
            Análise do impacto da performance em métricas de negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="business">Negócio</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Performance Thresholds */}
      <div className="grid gap-4 md:grid-cols-3">
        {thresholds.map((threshold, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{threshold.metric}</span>
                <Badge className={getStatusColor(threshold.status)}>
                  {getStatusLabel(threshold.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Atual</span>
                  <span className="font-medium">
                    {threshold.metric === 'Response Time'
                      ? formatDuration(threshold.current)
                      : threshold.metric === 'Error Rate'
                        ? formatPercentage(threshold.current)
                        : formatPercentage(threshold.current)
                    }
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: {
                    threshold.metric === 'Response Time'
                      ? formatDuration(threshold.threshold)
                      : threshold.metric === 'Error Rate'
                        ? formatPercentage(threshold.threshold)
                        : formatPercentage(threshold.threshold)
                  }
                </div>
                <div className="text-xs text-red-600 mt-2">
                  {threshold.businessImpact}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="correlations" className="w-full">
        <TabsList>
          <TabsTrigger value="correlations">Correlações</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="impact">Impacto de Negócio</TabsTrigger>
          <TabsTrigger value="scatter">Análise Scatter</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-sm">{metric.name}</span>
                      </div>
                      {getTrendIcon(metric.trend)}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold">
                          {metric.category === 'business' && metric.name.includes('Receita')
                            ? `$${metric.value}`
                            : metric.name.includes('Taxa') || metric.name.includes('NPS')
                              ? `${metric.value}${metric.name.includes('Taxa') ? '%' : ''}`
                              : metric.name.includes('Duração')
                                ? `${metric.value}s`
                                : `${metric.value}%`
                          }
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {metric.category}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Correlação</span>
                          <span className={`text-xs font-medium ${getCorrelationColor(metric.correlation)}`}>
                            {metric.correlation > 0 ? '+' : ''}{metric.correlation.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Força</span>
                          <Badge variant="outline" className="text-xs">
                            {getCorrelationStrength(metric.correlation)}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {metric.impact}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Métricas de Negócio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm', { locale: ptBR })}
                      formatter={(value: number, name: string) => {
                        const formatters: Record<string, (v: number) => string> = {
                          responseTime: (v) => `${v.toFixed(0)}ms`,
                          conversions: (v) => `${v.toFixed(1)}%`,
                          revenue: (v) => `$${v.toFixed(0)}`,
                          bounceRate: (v) => `${v.toFixed(1)}%`,
                          sessionDuration: (v) => `${v.toFixed(0)}s`
                        };
                        return [formatters[name]?.(value) || value.toString(), name];
                      }}
                    />

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="responseTime"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Response Time"
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Conversions"
                      dot={false}
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bounceRate"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Bounce Rate"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="mt-6">
          <div className="space-y-6">
            {businessImpacts.map((impact, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{impact.metric}</CardTitle>
                    <Badge className={getSeverityColor(impact.severity)}>
                      {impact.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {impact.impactOnRevenue > 0 ? '+' : ''}{impact.impactOnRevenue.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Impacto na Receita</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {impact.impactOnConversions > 0 ? '+' : ''}{impact.impactOnConversions.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Impacto nas Conversões</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {impact.impactOnUserSatisfaction > 0 ? '+' : ''}{impact.impactOnUserSatisfaction.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Satisfação do Usuario</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recomendações</h4>
                    <ul className="space-y-2">
                      {impact.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scatter" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time vs Conversões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={correlationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="responseTime"
                        name="Response Time"
                        unit="ms"
                      />
                      <YAxis
                        dataKey="conversions"
                        name="Conversions"
                        unit="%"
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name === 'responseTime' ? `${value.toFixed(0)}ms` : `${value.toFixed(1)}%`,
                          name === 'responseTime' ? 'Response Time' : 'Conversions'
                        ]}
                      />
                      <Scatter
                        dataKey="conversions"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center">
                  <Badge variant="outline">Correlação: -0.87 (Muito Forte)</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time vs Taxa de Abandono</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={correlationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="responseTime"
                        name="Response Time"
                        unit="ms"
                      />
                      <YAxis
                        dataKey="bounceRate"
                        name="Bounce Rate"
                        unit="%"
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          name === 'responseTime' ? `${value.toFixed(0)}ms` : `${value.toFixed(1)}%`,
                          name === 'responseTime' ? 'Response Time' : 'Bounce Rate'
                        ]}
                      />
                      <Scatter
                        dataKey="bounceRate"
                        fill="#ef4444"
                        fillOpacity={0.6}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center">
                  <Badge variant="outline">Correlação: +0.79 (Forte)</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}