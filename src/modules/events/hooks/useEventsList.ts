import { useInfiniteQuery } from '@tanstack/react-query'
import { eventsService, EventFilters } from '@/services/events.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useEventsList(filters: EventFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'list', filters],
    queryFn: ({ pageParam = 1 }) =>
      eventsService.getEvents({
        ...filters,
        page: pageParam,
        limit: filters.limit || 50
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEventsSearch(query: string, filters: EventFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'search', query, filters],
    queryFn: ({ pageParam = 1 }) =>
      eventsService.searchEvents({
        text: query,
        filters: {
          ...filters,
          page: pageParam,
          limit: filters.limit || 50
        }
      }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / (filters.limit || 50))
      const currentPage = filters.page || 1
      if (currentPage < totalPages) {
        return currentPage + 1
      }
      return undefined
    },
    enabled: query.length > 0,
    staleTime: 10000, // 10 seconds for search
  })
}

export function useEventsStats(filters: EventFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'stats', filters],
    queryFn: () => eventsService.getEventStats(filters),
    staleTime: 60000, // 1 minute
  })
}