import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports.service';
import type { ReportSchedule } from '../types/reports.types';

export function useScheduledReports() {
  return useQuery({
    queryKey: ['reports', 'scheduled'],
    queryFn: () => reportsService.getScheduledReports(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportExecutions(reportId?: string) {
  return useQuery({
    queryKey: ['reports', 'executions', reportId],
    queryFn: () => reportsService.getReportExecutions(reportId),
    enabled: !!reportId,
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000, // Auto-refresh para status updates
  });
}

export function useReportSchedulerActions() {
  const queryClient = useQueryClient();

  const scheduleReport = useMutation({
    mutationFn: ({ reportId, schedule }: { reportId: string; schedule: ReportSchedule }) =>
      reportsService.scheduleReport(reportId, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const pauseSchedule = useMutation({
    mutationFn: (reportId: string) => reportsService.pauseReportSchedule(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const resumeSchedule = useMutation({
    mutationFn: (reportId: string) => reportsService.resumeReportSchedule(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const executeNow = useMutation({
    mutationFn: (reportId: string) => reportsService.executeReportNow(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'executions'] });
    },
  });

  const cancelExecution = useMutation({
    mutationFn: (executionId: string) => reportsService.cancelExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'executions'] });
    },
  });

  return {
    scheduleReport,
    pauseSchedule,
    resumeSchedule,
    executeNow,
    cancelExecution,
  };
}