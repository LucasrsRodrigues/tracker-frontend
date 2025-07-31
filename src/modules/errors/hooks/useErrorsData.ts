import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { errorsService } from '../../../services/errors.service';
import type { ErrorFilters } from '../types/errors.types';

export function useErrorGroups(filters: ErrorFilters, pageSize: number = 25) {
  return useInfiniteQuery({
    queryKey: ['errors', 'groups', filters, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      errorsService.getErrorGroups(filters, pageParam, pageSize),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useErrorTrends(filters: ErrorFilters, timeRange: 'hour' | 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['errors', 'trends', filters, timeRange],
    queryFn: () => errorsService.getErrorTrends(filters, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useErrorDashboard(filters: ErrorFilters) {
  return useQuery({
    queryKey: ['errors', 'dashboard', filters],
    queryFn: () => errorsService.getErrorDashboard(filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}