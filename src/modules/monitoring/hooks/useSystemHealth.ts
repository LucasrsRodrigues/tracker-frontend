import { useQuery } from '@tanstack/react-query';
import { monitoringService } from '../../../services/monitoring.service';

export function useSystemHealth() {
  return useQuery({
    queryKey: ['monitoring', 'system-health'],
    queryFn: () => monitoringService.getSystemHealth(),
    refetchInterval: 30000, // 30 segundos
    staleTime: 15000,
  });
}

export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['monitoring', 'performance'],
    queryFn: () => monitoringService.getPerformanceMetrics(),
    refetchInterval: 60000, // 1 minuto
    staleTime: 30000,
  });
}

export function useProviderStatus() {
  return useQuery({
    queryKey: ['monitoring', 'providers'],
    queryFn: () => monitoringService.getProviderStatus(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
}