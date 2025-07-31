import { useQuery } from '@tanstack/react-query';
import { performanceService } from '../../../services/performance.service';
import type { PerformanceMetrics } from '../types/performance.types';

export function usePerformanceOverview(timeRange: string = '24h') {
  return useQuery({
    queryKey: ['performance', 'overview', timeRange],
    queryFn: () => performanceService.getPerformanceOverview(timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
  });
}

export function useEndpointPerformance(timeRange: string = '24h', limit: number = 50) {
  return useQuery({
    queryKey: ['performance', 'endpoints', timeRange, limit],
    queryFn: () => performanceService.getEndpointPerformance(timeRange, limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceUtilization(timeRange: string = '1h') {
  return useQuery({
    queryKey: ['performance', 'resources', timeRange],
    queryFn: () => performanceService.getResourceUtilization(timeRange),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000,
  });
}

export function usePerformanceAlerts() {
  return useQuery({
    queryKey: ['performance', 'alerts'],
    queryFn: () => performanceService.getPerformanceAlerts(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}