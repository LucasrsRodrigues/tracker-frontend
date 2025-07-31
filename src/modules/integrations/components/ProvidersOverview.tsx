import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Globe,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings
} from 'lucide-react';
import { useProviders } from '../hooks/useProvidersData';
import { formatNumber, formatPercentage, formatDuration } from '@/utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Provider } from '../types/integrations.types';

interface ProvidersOverviewProps {
  onProviderSelect?: (provider: Provider) => void;
}

export function ProvidersOverview({ onProviderSelect }: ProvidersOverviewProps) {
  const { data: providers, isLoading, error } = useProviders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800">Operacional</Badge>;
      case 'degraded':
        return <Badge variant="secondary">Degradado</Badge>;
      case 'outage':
        return <Badge variant="destructive">Falha</Badge>;
      case 'maintenance':
        return <Badge className="bg-blue-100 text-blue-800">Manutenção</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'pix': return <Zap className="h-5 w-5 text-blue-600" />;
      case 'consultation': return <Globe className="h-5 w-5 text-purple-600" />;
      case 'authentication': return <CheckCircle className="h-5 w-5 text-orange-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

        {/* Providers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !providers) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Erro ao carregar provedores</p>
          <p className="text-muted-foreground">
            Não foi possível carregar as informações dos provedores
          </p>
        </CardContent>
      </Card>
    );
  }

  const operationalCount = providers.filter(p => p.status === 'operational').length;
  const degradedCount = providers.filter(p => p.status === 'degraded').length;
  const outageCount = providers.filter(p => p.status === 'outage').length;
  const maintenanceCount = providers.filter(p => p.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Provedores</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <div className="text-xs text-muted-foreground">
              Integrados na plataforma
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operacionais</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{operationalCount}</div>
            <div className="text-xs text-muted-foreground">
              {formatPercentage((operationalCount / providers.length) * 100)} do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Problemas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {degradedCount + outageCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {degradedCount} degradados, {outageCount} falhas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{maintenanceCount}</div>
            <div className="text-xs text-muted-foreground">
              Manutenção programada
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onProviderSelect?.(provider)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(provider.type)}
                <CardTitle className="text-lg">{provider.name}</CardTitle>
              </div>
              {getStatusIcon(provider.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(provider.status)}
              </div>

              {/* SLA Compliance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">SLA Compliance:</span>
                  <span className="font-medium">
                    {formatPercentage(provider.sla?.availability || 0)}
                  </span>
                </div>
                <Progress
                  value={provider.sla?.availability || 0}
                  className="h-2"
                />
              </div>

              {/* Endpoints */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Endpoints:</span>
                <span className="font-medium">
                  {provider.endpoints?.filter(e => e.isActive).length || 0} ativos
                </span>
              </div>

              {/* Rate Limits */}
              {provider.rateLimits?.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rate Limit:</span>
                  <span className="font-medium">
                    {provider.rateLimits[0].current}/{provider.rateLimits[0].limit}
                  </span>
                </div>
              )}

              {/* Last Update */}
              <div className="text-xs text-muted-foreground">
                Última atualização: {formatDistanceToNow(new Date(provider.updatedAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Test connection
                  }}
                >
                  Testar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open settings
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Provider */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Adicionar Novo Provedor</p>
          <p className="text-muted-foreground text-center mb-4">
            Configure uma nova integração com provedor externo
          </p>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            Adicionar Provedor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}