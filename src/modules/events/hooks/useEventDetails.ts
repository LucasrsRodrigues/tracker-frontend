import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/services/events.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'details', eventId],
    queryFn: () => eventsService.getEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEventCorrelation(eventId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'correlation', eventId],
    queryFn: () => eventsService.getEventCorrelation(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useEventsBySession(sessionId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'session', sessionId],
    queryFn: () => eventsService.getEventsBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 60000, // 1 minute
  })
}

export function useEventsByUser(userId: string, filters?: any) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'user', userId, filters],
    queryFn: () => eventsService.getEventsByUser(userId, filters),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  })
}

export function useEventsByTrace(traceId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'trace', traceId],
    queryFn: () => eventsService.getEventsByTrace(traceId),
    enabled: !!traceId,
    staleTime: 60000, // 1 minute
  })
}

export function useSessionTimeline(sessionId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'timeline', 'session', sessionId],
    queryFn: () => eventsService.getSessionTimeline(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUserJourney(userId: string, options?: {
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, 'journey', 'user', userId, options],
    queryFn: () => eventsService.getUserJourney(userId, options),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}