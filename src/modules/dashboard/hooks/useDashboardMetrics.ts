import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../../services/dashboard.service';
import type { DashboardMetrics } from '../types/dashboard.types';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardService.getMetrics(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 15000, // Considera dados válidos por 15 segundos
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardService.getCriticalAlerts(),
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });
}