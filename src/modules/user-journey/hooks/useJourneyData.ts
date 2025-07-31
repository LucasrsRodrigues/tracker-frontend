import { useQuery } from '@tanstack/react-query';
import { userJourneyService } from '../../../services/user-journey.service';
import type { JourneyFilters } from '../types/journey.types';

export function useJourneyData(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['user-journey', 'data', filters],
    queryFn: () => userJourneyService.getJourneyData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useConversionPaths(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['user-journey', 'conversion-paths', filters],
    queryFn: () => userJourneyService.getConversionPaths(filters),
    staleTime: 10 * 60 * 1000,
  });
}

export function useDropOffAnalysis(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['user-journey', 'dropoff', filters],
    queryFn: () => userJourneyService.getDropOffAnalysis(filters),
    staleTime: 10 * 60 * 1000,
  });
}

export function useHeatmapData(filters: JourneyFilters) {
  return useQuery({
    queryKey: ['user-journey', 'heatmap', filters],
    queryFn: () => userJourneyService.getHeatmapData(filters),
    staleTime: 15 * 60 * 1000,
  });
}
