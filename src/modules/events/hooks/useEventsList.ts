import { useInfiniteQuery } from '@tanstack/react-query';
import { eventsService } from '../../../services/events.service';
import type { EventFilters } from '../types/events.types';

export function useEventsList(filters: EventFilters, pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: ['events', 'list', filters, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      eventsService.getEvents(filters, pageParam, pageSize),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useEventsAggregations(filters: EventFilters) {
  return useQuery({
    queryKey: ['events', 'aggregations', filters],
    queryFn: () => eventsService.getEventsAggregations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}