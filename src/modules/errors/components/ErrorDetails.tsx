import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Users,
  TrendingUp,
  Globe,
  Code,
  AlertTriangle,
  CheckCircle,
  X,
  Copy
} from 'lucide-react';
import { StackTrace } from './StackTrace';
import { useErrorGroupDetails, useErrorAnalysis } from '../hooks/useErrorGrouping';
import { formatNumber, formatDistanceToNow, formatPercentage } from '@/utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ErrorGroup } from '../types/errors.types';

interface ErrorDetailsProps {
  group: ErrorGroup;
  onClose?: () => void;
  onStatusUpdate?: (groupId: string, status: string) => void;
}

export function ErrorDetails({ group, onClose, onStatusUpdate }: ErrorDetailsProps) {
  const { data: groupDetails, isLoading } = useErrorGroupDetails(group.id);
  const { data: analysis } = useErrorAnalysis(group.id);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="destructive">Novo</Badge>;
      case 'investigating': return <Badge className="bg-yellow-100 text-yellow-800">Investigando</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>;
      case 'ignored': return <Badge variant="outline">Ignorado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const errorData = groupDetails || group;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(errorData.severity)}>
                  {errorData.severity}
                </Badge>
                {getStatusBadge(errorData.status)}
                <Badge variant="outline">{errorData.type}</Badge>
              </div>
              <CardTitle className="text-xl">{errorData.title}</CardTitle>
              <p className="text-muted-foreground">{errorData.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(errorData.id)}>
                <Copy className="h-4 w-4 mr-1" />
                Copiar ID
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              size="sm"
              onClick={() => onStatusUpdate?.(errorData.id, 'investigating')}
              disabled={errorData.status === 'investigating'}
            >
              <Clock className="h-4 w-4 mr-1" />
              Investigar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate?.(errorData.id, 'resolved')}
              disabled={errorData.status === 'resolved'}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate?.(errorData.id, 'ignored')}
              disabled={errorData.status === 'ignored'}
            >
              <X className="h-4 w-4 mr-1" />
              Ignorar
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(errorData.count)}</p>
              <p className="text-sm text-muted-foreground">Ocorrências</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(errorData.userCount)}</p>
              <p className="text-sm text-muted-foreground">Usuários Afetados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatDistanceToNow(new Date(errorData.firstSeen))}
              </p>
              <p className="text-sm text-muted-foreground">Primeiro Visto</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {formatDistanceToNow(new Date(errorData.lastSeen))}
              </p>
              <p className="text-sm text-muted-foreground">Última Vez</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="stacktrace">Stack Trace</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Ocorrências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={groupDetails?.trendData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Affected Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>Plataformas Afetadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorData.platforms.map((platform) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="capitalize">{platform}</span>
                      </div>
                      <Badge variant="outline">
                        {formatNumber(Math.floor(Math.random() * 100))} erros
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top URLs */}
            <Card>
              <CardHeader>
                <CardTitle>URLs Mais Afetadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {errorData.topUrls.slice(0, 5).map((urlData, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-mono text-sm truncate max-w-[200px]">
                        {urlData.url}
                      </span>
                      <Badge variant="outline">
                        {formatNumber(urlData.count)} erros
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Versions */}
            <Card>
              <CardHeader>
                <CardTitle>Versões Afetadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {errorData.affectedVersions.map((version) => (
                    <Badge key={version} variant="outline">
                      v{version}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stacktrace" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Stack Trace
              </CardTitle>
            </CardHeader>
            <CardContent>
              {errorData.stack ? (
                <StackTrace stackTrace={errorData.stack} />
              ) : (
                <p className="text-muted-foreground">
                  Stack trace não disponível para este erro.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          {analysis ? (
            <div className="space-y-6">
              {/* Impact Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Análise de Impacto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xl font-bold">{formatNumber(analysis.impactAnalysis.affectedUsers)}</p>
                      <p className="text-sm text-muted-foreground">Usuários Afetados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{formatNumber(analysis.impactAnalysis.affectedSessions)}</p>
                      <p className="text-sm text-muted-foreground">Sessões Afetadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{formatPercentage(analysis.impactAnalysis.errorRate)}</p>
                      <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold capitalize">{analysis.impactAnalysis.frequencyPattern}</p>
                      <p className="text-sm text-muted-foreground">Padrão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recomendações
                    <Badge className={getSeverityColor(analysis.recommendations.priority)}>
                      {analysis.recommendations.priority}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.actions.map((action, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-800">
                      Impacto Estimado: {analysis.recommendations.estimatedImpact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Carregando análise detalhada...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errorData.recentEvents?.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          {event.userId ? `Usuário ${event.userId.slice(-8)}` : 'Usuário anônimo'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {event.context.platform}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {event.context.url}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}