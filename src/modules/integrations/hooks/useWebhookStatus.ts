import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsService } from '../../../services/integrations.service';

export function useWebhookDeliveries(providerId?: string, status?: string) {
  return useQuery({
    queryKey: ['integrations', 'webhooks', 'deliveries', providerId, status],
    queryFn: () => integrationsService.getWebhookDeliveries({ providerId, status }),
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 30 * 1000, // Atualiza a cada 30 segundos
  });
}

export function useWebhookStats(providerId?: string, timeRange: string = '24h') {
  return useQuery({
    queryKey: ['integrations', 'webhooks', 'stats', providerId, timeRange],
    queryFn: () => integrationsService.getWebhookStats(providerId, timeRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWebhookActions() {
  const queryClient = useQueryClient();

  const retryDelivery = useMutation({
    mutationFn: (deliveryId: string) => integrationsService.retryWebhookDelivery(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'webhooks'] });
    },
  });

  const testWebhook = useMutation({
    mutationFn: ({ webhookId, payload }: { webhookId: string; payload?: any }) =>
      integrationsService.testWebhook(webhookId, payload),
  });

  return {
    retryDelivery,
    testWebhook,
  };
}