import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '../../../services/alerts.service';
import type { NotificationChannel } from '../types/alerts.types';

export function useNotificationChannels() {
  return useQuery({
    queryKey: ['alerts', 'channels'],
    queryFn: () => alertsService.getNotificationChannels(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotificationChannelActions() {
  const queryClient = useQueryClient();

  const createChannel = useMutation({
    mutationFn: (channel: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>) =>
      alertsService.createNotificationChannel(channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'channels'] });
    },
  });

  const updateChannel = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NotificationChannel> }) =>
      alertsService.updateNotificationChannel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'channels'] });
    },
  });

  const deleteChannel = useMutation({
    mutationFn: (id: string) => alertsService.deleteNotificationChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'channels'] });
    },
  });

  const testChannel = useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      alertsService.testNotificationChannel(id, message),
  });

  return {
    createChannel,
    updateChannel,
    deleteChannel,
    testChannel,
  };
}