import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { errorsService } from '../../../services/errors.service';

export function useErrorGroupDetails(groupId: string) {
  return useQuery({
    queryKey: ['errors', 'group', groupId],
    queryFn: () => errorsService.getErrorGroupDetails(groupId),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useErrorAnalysis(groupId: string) {
  return useQuery({
    queryKey: ['errors', 'analysis', groupId],
    queryFn: () => errorsService.getErrorAnalysis(groupId),
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useErrorGroupActions() {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ groupId, status }: { groupId: string; status: string }) =>
      errorsService.updateErrorGroupStatus(groupId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] });
    },
  });

  const mergeGroups = useMutation({
    mutationFn: ({ sourceGroupId, targetGroupId }: { sourceGroupId: string; targetGroupId: string }) =>
      errorsService.mergeErrorGroups(sourceGroupId, targetGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] });
    },
  });

  const addTags = useMutation({
    mutationFn: ({ groupId, tags }: { groupId: string; tags: string[] }) =>
      errorsService.addErrorGroupTags(groupId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] });
    },
  });

  return {
    updateStatus,
    mergeGroups,
    addTags,
  };
}