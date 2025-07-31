import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { alertsService } from '../../../services/alerts.service';

export function useAlertHistory(filters?: any, pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: ['alerts', 'history', filters, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      alertsService.getAlertHistory(filters, pageParam, pageSize),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    staleTime: 60 * 1000, // 1 minuto
  });
}

export function useAlertStats(timeRange: string = '24h') {
  return useQuery({
    queryKey: ['alerts', 'stats', timeRange],
    queryFn: () => alertsService.getAlertStats(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
  });
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => alertsService.getActiveAlerts(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000,
  });
}