import { useQuery } from '@tanstack/react-query';
import { userJourneyService } from '../../../services/user-journey.service';
import type { JourneyFilters } from '../types/journey.types';

export function usePathAnalysis(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['user-journey', 'path-analysis', filters],
    queryFn: () => userJourneyService.getPathAnalysis(filters),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCommonPaths(filters: JourneyFilters, limit: number = 10) {
  return useQuery({
    queryKey: ['user-journey', 'common-paths', filters, limit],
    queryFn: () => userJourneyService.getCommonPaths(filters, limit),
    staleTime: 15 * 60 * 1000,
  });
}