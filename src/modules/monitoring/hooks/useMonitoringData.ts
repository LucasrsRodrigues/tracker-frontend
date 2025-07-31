import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringService } from '@/services/monitoring.service';
import type {
  ProviderStatus,
  SlaMetrics,
  SystemHealth,
  PerformanceMetrics,
  LiveEvent
} from '../types/monitoring.types';

// Hook para status dos provedores
export function useProvidersStatus() {
  return useQuery({
    queryKey: ['monitoring', 'providers', 'status'],
    queryFn: () => monitoringService.getProvidersStatus(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

// Hook para status específico de um provedor
export function useProviderStatus(providerId: string) {
  return useQuery({
    queryKey: ['monitoring', 'provider', providerId],
    queryFn: () => monitoringService.getProviderStatus(providerId),
    refetchInterval: 15000, // Atualiza a cada 15 segundos
    enabled: !!providerId,
  });
}

// Hook para indicadores SLA
export function useSlaIndicators() {
  return useQuery({
    queryKey: ['monitoring', 'sla', 'indicators'],
    queryFn: () => monitoringService.getSLAIndicators(),
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}

// Hook para SLA de um provedor específico
export function useProviderSla(providerId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  return useQuery({
    queryKey: ['monitoring', 'sla', providerId, period],
    queryFn: () => monitoringService.getSLAIndicator(providerId, period),
    refetchInterval: 300000, // Atualiza a cada 5 minutos
    enabled: !!providerId,
  });
}

// Hook para saúde do sistema
export function useSystemHealth() {
  return useQuery({
    queryKey: ['monitoring', 'system', 'health'],
    queryFn: () => monitoringService.getSystemHealth(),
    refetchInterval: 30000,
  });
}

// Hook para métricas de performance
export function usePerformanceMetrics(options: {
  startDate?: Date;
  endDate?: Date;
  interval?: '5m' | '15m' | '1h' | '24h';
} = {}) {
  return useQuery({
    queryKey: ['monitoring', 'performance', options],
    queryFn: () => monitoringService.getPerformanceMetrics(options),
    refetchInterval: options.interval === '5m' ? 30000 : 60000,
  });
}

// Hook para eventos em tempo real
export function useRealTimeEvents(options: {
  limit?: number;
  types?: string[];
  severity?: string[];
  since?: Date;
} = {}) {
  return useQuery({
    queryKey: ['monitoring', 'events', 'realtime', options],
    queryFn: () => monitoringService.getRealTimeEvents(options),
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
}

// Hook para testar conexão com provedor
export function useTestProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) => monitoringService.testProvider(providerId),
    onSuccess: (_, providerId) => {
      // Invalida o cache do provedor para atualizar os dados
      queryClient.invalidateQueries({
        queryKey: ['monitoring', 'provider', providerId]
      });
      queryClient.invalidateQueries({
        queryKey: ['monitoring', 'providers', 'status']
      });
    },
  });
}

// Hook para obter alertas ativos
export function useActiveAlerts() {
  return useQuery({
    queryKey: ['monitoring', 'alerts', 'active'],
    queryFn: () => monitoringService.getSystemAlerts({ status: 'active' }),
    refetchInterval: 15000,
  });
}

// Hook para métricas em tempo real
export function useRealtimeMetrics() {
  return useQuery({
    queryKey: ['monitoring', 'metrics', 'realtime'],
    queryFn: () => monitoringService.getCurrentPerformance(),
    refetchInterval: 5000,
  });
}