import { useQuery } from '@tanstack/react-query';
import { integrationsService } from '../../../services/integrations.service';

export function useSlaReport(providerId: string, period: string = 'monthly') {
  return useQuery({
    queryKey: ['integrations', 'sla', providerId, period],
    queryFn: () => integrationsService.getSlaReport(providerId, period),
    enabled: !!providerId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useSlaCompliance(timeRange: string = '30d') {
  return useQuery({
    queryKey: ['integrations', 'sla', 'compliance', timeRange],
    queryFn: () => integrationsService.getSlaCompliance(timeRange),
    staleTime: 5 * 60 * 1000,
  });
}