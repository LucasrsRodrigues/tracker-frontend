import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsService } from '../../../services/integrations.service';
import type { Provider } from '../types/integrations.types';

export function useProviders() {
  return useQuery({
    queryKey: ['integrations', 'providers'],
    queryFn: () => integrationsService.getProviders(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ['integrations', 'providers', providerId],
    queryFn: () => integrationsService.getProvider(providerId),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProviderMetrics(providerId: string, timeRange: string = '24h') {
  return useQuery({
    queryKey: ['integrations', 'metrics', providerId, timeRange],
    queryFn: () => integrationsService.getProviderMetrics(providerId, timeRange),
    enabled: !!providerId,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Atualiza a cada minuto
  });
}

export function useProviderActions() {
  const queryClient = useQueryClient();

  const updateProvider = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Provider> }) =>
      integrationsService.updateProvider(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'providers'] });
    },
  });

  const testConnection = useMutation({
    mutationFn: (providerId: string) => integrationsService.testProviderConnection(providerId),
  });

  const syncConfiguration = useMutation({
    mutationFn: (providerId: string) => integrationsService.syncProviderConfiguration(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'providers'] });
    },
  });

  return {
    updateProvider,
    testConnection,
    syncConfiguration,
  };
}