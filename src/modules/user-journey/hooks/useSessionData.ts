import { useQuery } from '@tanstack/react-query';
import { userJourneyService } from '../../../services/user-journey.service';

export function useSessionTimeline(sessionId: string) {
  return useQuery({
    queryKey: ['user-journey', 'session', sessionId],
    queryFn: () => userJourneyService.getSessionTimeline(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useUserSessions(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['user-journey', 'user-sessions', userId, limit],
    queryFn: () => userJourneyService.getUserSessions(userId, limit),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}