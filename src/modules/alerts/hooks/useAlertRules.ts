import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '../../../services/alerts.service';
import type { AlertRule } from '../types/alerts.types';

export function useAlertRules() {
  return useQuery({
    queryKey: ['alerts', 'rules'],
    queryFn: () => alertsService.getAlertRules(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useAlertRule(ruleId: string) {
  return useQuery({
    queryKey: ['alerts', 'rules', ruleId],
    queryFn: () => alertsService.getAlertRule(ruleId),
    enabled: !!ruleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlertRuleActions() {
  const queryClient = useQueryClient();

  const createRule = useMutation({
    mutationFn: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>) =>
      alertsService.createAlertRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] });
    },
  });

  const updateRule = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AlertRule> }) =>
      alertsService.updateAlertRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] });
    },
  });

  const deleteRule = useMutation({
    mutationFn: (id: string) => alertsService.deleteAlertRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] });
    },
  });

  const toggleRule = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      alertsService.updateAlertRule(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', 'rules'] });
    },
  });

  const testRule = useMutation({
    mutationFn: (rule: AlertRule) => alertsService.testAlertRule(rule),
  });

  return {
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    testRule,
  };
}
