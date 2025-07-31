import { useQuery } from '@tanstack/react-query'
import { userJourneyService } from '@/services/user-journey.service'
import { eventsService } from '@/services/events.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useSessionTimeline(sessionId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'session', 'timeline', sessionId],
    queryFn: () => eventsService.getSessionTimeline(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUserJourneys(options: {
  userIds?: string[]
  segment?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  includeAnonymous?: boolean
} = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'journeys', options],
    queryFn: () => userJourneyService.getJourneys(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUserJourney(userId: string, options?: {
  startDate?: Date
  endDate?: Date
  includeSessions?: boolean
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'user', userId, options],
    queryFn: () => userJourneyService.getJourneyByUser(userId, options),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFunnels() {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'funnels'],
    queryFn: () => userJourneyService.getFunnels(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useFunnel(funnelId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'funnel', funnelId],
    queryFn: () => userJourneyService.getFunnel(funnelId),
    enabled: !!funnelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFunnelAnalysis(funnelId: string, options?: {
  startDate?: Date
  endDate?: Date
  segments?: string[]
  compareWith?: string
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'funnel', 'analysis', funnelId, options],
    queryFn: () => userJourneyService.getFunnelAnalysis(funnelId, options),
    enabled: !!funnelId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useConversionRates(options?: {
  startDate?: Date
  endDate?: Date
  groupBy?: 'day' | 'week' | 'month'
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'conversion-rates', options],
    queryFn: () => userJourneyService.getConversionRates(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePathAnalysis(options?: {
  startDate?: Date
  endDate?: Date
  maxPathLength?: number
  minUserCount?: number
  includeAnonymous?: boolean
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'paths', options],
    queryFn: () => userJourneyService.getPathAnalysis(options),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCohortAnalysis(options?: {
  cohortType?: 'acquisition' | 'behavioral'
  metric?: 'retention' | 'revenue' | 'events'
  startDate?: Date
  endDate?: Date
  cohortSize?: 'day' | 'week' | 'month'
  periods?: number
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'cohorts', options],
    queryFn: () => userJourneyService.getCohortAnalysis(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useUserSegments() {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'segments'],
    queryFn: () => userJourneyService.getUserSegments(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useAttributionAnalysis(options?: {
  model?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay'
  startDate?: Date
  endDate?: Date
  conversionEvent?: string
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'attribution', options],
    queryFn: () => userJourneyService.getAttributionAnalysis(options),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useJourneyInsights(options?: {
  funnelId?: string
  period?: 'week' | 'month' | 'quarter'
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'insights', options],
    queryFn: () => userJourneyService.getInsights(options),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Real-time session tracking
export function useActiveSession(sessionId: string, interval: number = 30000) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'session', 'active', sessionId],
    queryFn: () => eventsService.getEventsBySession(sessionId),
    enabled: !!sessionId,
    refetchInterval: interval,
    staleTime: 0, // Always consider stale for real-time tracking
  })
}

// Session comparison
export function useSessionComparison(sessionIds: string[]) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER_JOURNEY, 'session', 'comparison', sessionIds],
    queryFn: async () => {
      const sessions = await Promise.all(
        sessionIds.map(id => eventsService.getSessionTimeline(id))
      )

      return {
        sessions,
        comparison: {
          durations: sessions.map(s => s.duration || 0),
          eventCounts: sessions.map(s => s.events.length),
          conversions: sessions.map(s => s.summary.conversions),
          errors: sessions.map(s => s.summary.errors)
        }
      }
    },
    enabled: sessionIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}