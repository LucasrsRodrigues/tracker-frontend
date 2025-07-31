import { useMutation, useQueryClient } from '@tanstack/react-query'
import { errorsService } from '@/services/errors.service'
import { QUERY_KEYS } from '@/lib/constants'
import { toast } from 'sonner'

export function useErrorGroupActions() {
  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: ({
      groupId,
      status,
      options
    }: {
      groupId: string
      status: 'new' | 'investigating' | 'resolved' | 'ignored'
      options?: { assignee?: string; note?: string; resolution?: string }
    }) => errorsService.updateErrorStatus(groupId, status, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success(`Error group ${variables.status} successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to update error status: ${error.message}`)
    }
  })

  const assignError = useMutation({
    mutationFn: ({
      groupId,
      assigneeId,
      note
    }: {
      groupId: string
      assigneeId: string
      note?: string
    }) => errorsService.assignError(groupId, assigneeId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success('Error assigned successfully')
    },
    onError: (error) => {
      toast.error(`Failed to assign error: ${error.message}`)
    }
  })

  const addTags = useMutation({
    mutationFn: ({
      groupId,
      tags
    }: {
      groupId: string
      tags: string[]
    }) => errorsService.addTags(groupId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success('Tags added successfully')
    },
    onError: (error) => {
      toast.error(`Failed to add tags: ${error.message}`)
    }
  })

  const removeTags = useMutation({
    mutationFn: ({
      groupId,
      tags
    }: {
      groupId: string
      tags: string[]
    }) => errorsService.removeTags(groupId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success('Tags removed successfully')
    },
    onError: (error) => {
      toast.error(`Failed to remove tags: ${error.message}`)
    }
  })

  const mergeErrors = useMutation({
    mutationFn: ({
      primaryGroupId,
      secondaryGroupIds
    }: {
      primaryGroupId: string
      secondaryGroupIds: string[]
    }) => errorsService.mergeErrors(primaryGroupId, secondaryGroupIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success('Error groups merged successfully')
    },
    onError: (error) => {
      toast.error(`Failed to merge error groups: ${error.message}`)
    }
  })

  const splitError = useMutation({
    mutationFn: ({
      groupId,
      criteria
    }: {
      groupId: string
      criteria: {
        field: string
        operator: 'equals' | 'contains' | 'regex'
        value: string
      }
    }) => errorsService.splitError(groupId, criteria),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success('Error group split successfully')
    },
    onError: (error) => {
      toast.error(`Failed to split error group: ${error.message}`)
    }
  })

  const deleteErrorGroup = useMutation({
    mutationFn: (groupId: string) => errorsService.deleteErrorGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success('Error group deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete error group: ${error.message}`)
    }
  })

  return {
    updateStatus,
    assignError,
    addTags,
    removeTags,
    mergeErrors,
    splitError,
    deleteErrorGroup
  }
}

export function useErrorGroupDetails(groupId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'group', 'details', groupId],
    queryFn: () => errorsService.getErrorById(groupId),
    enabled: !!groupId,
    staleTime: 30000,
  })
}

export function useErrorAnalysis(groupId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ERRORS, 'analysis', groupId],
    queryFn: async () => {
      // Combine multiple data sources for comprehensive analysis
      const [group, similar, trends] = await Promise.all([
        errorsService.getErrorById(groupId),
        errorsService.getSimilarErrors(groupId, 5),
        errorsService.getErrorTrends({
          timeRange: 'last_7d',
          interval: 'hour'
        })
      ])

      return {
        group,
        similar: similar.similar,
        trends: trends.byTime,
        analysis: {
          frequency: group.count,
          userImpact: group.userCount,
          trend: group.trend,
          severity: group.severity,
          isRegression: group.firstSeen > new Date(Date.now() - 24 * 60 * 60 * 1000),
          affectedSessions: group.sessionCount
        }
      }
    },
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useBulkErrorActions() {
  const queryClient = useQueryClient()

  const bulkUpdateStatus = useMutation({
    mutationFn: ({
      groupIds,
      status,
      options
    }: {
      groupIds: string[]
      status: 'new' | 'investigating' | 'resolved' | 'ignored'
      options?: { assignee?: string; note?: string }
    }) => {
      return Promise.all(
        groupIds.map(groupId =>
          errorsService.updateErrorStatus(groupId, status, options)
        )
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success(`${variables.groupIds.length} error groups updated to ${variables.status}`)
    },
    onError: (error) => {
      toast.error(`Failed to update error groups: ${error.message}`)
    }
  })

  const bulkAddTags = useMutation({
    mutationFn: ({
      groupIds,
      tags
    }: {
      groupIds: string[]
      tags: string[]
    }) => {
      return Promise.all(
        groupIds.map(groupId => errorsService.addTags(groupId, tags))
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success(`Tags added to ${variables.groupIds.length} error groups`)
    },
    onError: (error) => {
      toast.error(`Failed to add tags: ${error.message}`)
    }
  })

  const bulkDelete = useMutation({
    mutationFn: (groupIds: string[]) => {
      return Promise.all(
        groupIds.map(groupId => errorsService.deleteErrorGroup(groupId))
      )
    },
    onSuccess: (_, groupIds) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.ERRORS] })
      toast.success(`${groupIds.length} error groups deleted`)
    },
    onError: (error) => {
      toast.error(`Failed to delete error groups: ${error.message}`)
    }
  })

  return {
    bulkUpdateStatus,
    bulkAddTags,
    bulkDelete
  }
}