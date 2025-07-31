import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../../services/events.service';

export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ['events', 'details', eventId],
    queryFn: () => eventsService.getEventDetails(eventId),
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useEventCorrelation(traceId: string) {
  return useQuery({
    queryKey: ['events', 'correlation', traceId],
    queryFn: () => eventsService.getEventCorrelation(traceId),
    enabled: !!traceId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSessionEvents(sessionId: string) {
  return useQuery({
    queryKey: ['events', 'session', sessionId],
    queryFn: () => eventsService.getSessionEvents(sessionId),
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000,
  });
}