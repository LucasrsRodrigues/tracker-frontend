import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../../services/analytics.service';
import type { AnalyticsFilters } from '../types/analytics.types';

export function useAnalyticsData(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'data', filters],
    queryFn: () => analyticsService.getAnalyticsData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useConversionFunnel(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'funnel', filters],
    queryFn: () => analyticsService.getConversionFunnel(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useRetentionAnalysis(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'retention', filters],
    queryFn: () => analyticsService.getRetentionAnalysis(filters),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

export function useCategoryBreakdown(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'categories', filters],
    queryFn: () => analyticsService.getCategoryBreakdown(filters),
    staleTime: 5 * 60 * 1000,
  });
}