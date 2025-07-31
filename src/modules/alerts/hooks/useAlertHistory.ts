import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsService, AlertFilters } from '@/services/alerts.service'
import { QUERY_KEYS } from '@/lib/constants'
import { toast } from 'sonner'

export function useAlertHistory(filters: AlertFilters & { search?: string } = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'history', filters],
    queryFn: ({ pageParam = 1 }) =>
      alertsService.getAlerts({
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

export function useAlertRules() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'rules'],
    queryFn: () => alertsService.getAlertRules(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAlertRule(ruleId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'rules', ruleId],
    queryFn: () => alertsService.getAlertRule(ruleId),
    enabled: !!ruleId,
    staleTime: 60000, // 1 minute
  })
}

export function useAlertChannels() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'channels'],
    queryFn: () => alertsService.getAlertChannels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAlertMetrics() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'metrics'],
    queryFn: () => alertsService.getAlertMetrics(),
    staleTime: 60000, // 1 minute
  })
}

export function useAlertAnalytics(options?: {
  startDate?: Date
  endDate?: Date
  ruleIds?: string[]
  includeInsights?: boolean
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'analytics', options],
    queryFn: () => alertsService.getAlertAnalytics(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAlertTemplates() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'templates'],
    queryFn: () => alertsService.getAlertTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useScheduledReports() {
  return useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, 'scheduled'],
    queryFn: () => alertsService.getScheduledReports(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAlertActions() {
  const queryClient = useQueryClient()

  const acknowledgeAlert = useMutation({
    mutationFn: ({ alertId, note }: { alertId: string; note?: string }) =>
      alertsService.acknowledgeAlert(alertId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS] })
      toast.success('Alert acknowledged')
    },
    onError: (error) => {
      toast.error(`Failed to acknowledge alert: ${error.message}`)
    }
  })

  const resolveAlert = useMutation({
    mutationFn: ({ alertId, resolution }: { alertId: string; resolution?: string }) =>
      alertsService.resolveAlert(alertId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS] })
      toast.success('Alert resolved')
    },
    onError: (error) => {
      toast.error(`Failed to resolve alert: ${error.message}`)
    }
  })

  const assignAlert = useMutation({
    mutationFn: ({ alertId, assigneeId }: { alertId: string; assigneeId: string }) =>
      alertsService.assignAlert(alertId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS] })
      toast.success('Alert assigned')
    },
    onError: (error) => {
      toast.error(`Failed to assign alert: ${error.message}`)
    }
  })

  const addAlertTags = useMutation({
    mutationFn: ({ alertId, tags }: { alertId: string; tags: string[] }) =>
      alertsService.addAlertTags(alertId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS] })
      toast.success('Tags added to alert')
    },
    onError: (error) => {
      toast.error(`Failed to add tags: ${error.message}`)
    }
  })

  const bulkUpdateAlerts = useMutation({
    mutationFn: (operation: {
      type: 'acknowledge' | 'resolve' | 'assign' | 'add_tags'
      alertIds: string[]
      data?: Record<string, any>
    }) => alertsService.bulkUpdateAlerts(operation),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS] })
      toast.success(`${result.success} alerts updated successfully`)
      if (result.failed > 0) {
        toast.warning(`${result.failed} alerts failed to update`)
      }
    },
    onError: (error) => {
      toast.error(`Failed to update alerts: ${error.message}`)
    }
  })

  return {
    acknowledgeAlert,
    resolveAlert,
    assignAlert,
    addAlertTags,
    bulkUpdateAlerts
  }
}

export function useAlertRuleActions() {
  const queryClient = useQueryClient()

  const createAlert = useMutation({
    mutationFn: (rule: any) => alertsService.createAlert(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS, 'rules'] })
      toast.success('Alert rule created')
    },
    onError: (error) => {
      toast.error(`Failed to create alert rule: ${error.message}`)
    }
  })

  const updateAlert = useMutation({
    mutationFn: ({ ruleId, updates }: { ruleId: string; updates: any }) =>
      alertsService.updateAlert(ruleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS] })
      toast.success('Alert rule updated')
    },
    onError: (error) => {
      toast.error(`Failed to update alert rule: ${error.message}`)
    }
  })

  const deleteAlert = useMutation({
    mutationFn: (ruleId: string) => alertsService.deleteAlert(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS, 'rules'] })
      toast.success('Alert rule deleted')
    },
    onError: (error) => {
      toast.error(`Failed to delete alert rule: ${error.message}`)
    }
  })

  const toggleAlertRule = useMutation({
    mutationFn: ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) =>
      alertsService.toggleAlertRule(ruleId, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS, 'rules'] })
      toast.success(`Alert rule ${variables.enabled ? 'enabled' : 'disabled'}`)
    },
    onError: (error) => {
      toast.error(`Failed to toggle alert rule: ${error.message}`)
    }
  })

  const testAlertRule = useMutation({
    mutationFn: (rule: any) => alertsService.testAlertRule(rule),
    onSuccess: (result) => {
      if (result.wouldTrigger) {
        toast.success('Alert rule would trigger with current conditions')
      } else {
        toast.info('Alert rule would not trigger with current conditions')
      }
    },
    onError: (error) => {
      toast.error(`Failed to test alert rule: ${error.message}`)
    }
  })

  const muteAlertRule = useMutation({
    mutationFn: ({ ruleId, options }: {
      ruleId: string;
      options: { duration: number; reason?: string }
    }) => alertsService.muteAlertRule(ruleId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS, 'rules'] })
      toast.success('Alert rule muted')
    },
    onError: (error) => {
      toast.error(`Failed to mute alert rule: ${error.message}`)
    }
  })

  const unmuteAlertRule = useMutation({
    mutationFn: (ruleId: string) => alertsService.unmuteAlertRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ALERTS, 'rules'] })
      toast.success('Alert rule unmuted')
    },
    onError: (error) => {
      toast.error(`Failed to unmute alert rule: ${error.message}`)
    }
  })

  return {
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlertRule,
    testAlertRule,
    muteAlertRule,
    unmuteAlertRule
  }
}