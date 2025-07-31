import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import { errorsService, type ErrorFilters, type ErrorDashboardData } from '@/services/errors.service'

export function useErrorGroups(filters: ErrorFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'groups', filters],
    queryFn: ({ pageParam = 1 }) =>
      errorsService.getErrors({
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
  })
}

export function useErrorDashboard(filters: ErrorFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'dashboard', filters],
    queryFn: () => errorsService.getErrorDashboard(filters),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes for dashboard auto-refresh
  })
}

export function useErrorGroup(groupId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'group', groupId],
    queryFn: () => errorsService.getErrorById(groupId),
    enabled: !!groupId,
    staleTime: 60000, // 1 minute
  })
}

export function useErrorOccurrences(groupId: string, options?: {
  page?: number
  limit?: number
  startDate?: Date
  endDate?: Date
}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'occurrences', groupId, options],
    queryFn: ({ pageParam = 1 }) =>
      errorsService.getErrorOccurrences(groupId, {
        ...options,
        page: pageParam
      }),
    getNextPageParam: (lastPage: { page: number; totalCount: number; limit: number }) => {
      const totalPages = Math.ceil(lastPage.totalCount / (lastPage.limit || 50))
      if (lastPage.page < totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    enabled: !!groupId,
    staleTime: 30000,
  })
}

export function useErrorTrends(filters?: {
  startDate?: Date
  endDate?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
  interval?: 'minute' | 'hour' | 'day'
  providers?: string[]
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'trends', filters],
    queryFn: () => errorsService.getErrorTrends(filters),
    staleTime: 60000, // 1 minute
  })
}

export function useErrorStats(filters: ErrorFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'stats', filters],
    queryFn: () => errorsService.getErrorStats(filters),
    staleTime: 60000, // 1 minute
  })
}

export function useErrorInsights(options?: {
  startDate?: Date
  endDate?: Date
  providers?: string[]
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'insights', options],
    queryFn: () => errorsService.getErrorInsights(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useErrorSearch(query: string, filters: ErrorFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'search', query, filters],
    queryFn: () => errorsService.searchErrors({
      text: query,
      filters,
      fuzzy: true
    }),
    enabled: query.length > 0,
    staleTime: 10000, // 10 seconds
  })
}

export function useSimilarErrors(groupId: string, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'similar', groupId, limit],
    queryFn: () => errorsService.getSimilarErrors(groupId, limit),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSamplingRules() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'sampling-rules'],
    queryFn: () => errorsService.getSamplingRules(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}