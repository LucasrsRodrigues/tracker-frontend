import { useQuery } from '@tanstack/react-query';
import { performanceService } from '../../../services/performance.service';

export function useEndpointDetails(endpoint: string, timeRange: string = '24h') {
  return useQuery({
    queryKey: ['performance', 'endpoint-details', endpoint, timeRange],
    queryFn: () => performanceService.getEndpointDetails(endpoint, timeRange),
    enabled: !!endpoint,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSlowQueries(endpoint?: string, timeRange: string = '24h') {
  return useQuery({
    queryKey: ['performance', 'slow-queries', endpoint, timeRange],
    queryFn: () => performanceService.getSlowQueries(endpoint, timeRange),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePerformanceComparison(
  currentPeriod: { from: Date; to: Date },
  previousPeriod: { from: Date; to: Date }
) {
  return useQuery({
    queryKey: ['performance', 'comparison', currentPeriod, previousPeriod],
    queryFn: () => performanceService.getPerformanceComparison(currentPeriod, previousPeriod),
    enabled: !!currentPeriod.from && !!previousPeriod.from,
    staleTime: 10 * 60 * 1000,
  });
}