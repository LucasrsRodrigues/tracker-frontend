import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports.service';
import type { Report, ReportConfiguration, MetricConfiguration, VisualizationConfiguration } from '../types/reports.types';

export function useReportBuilder(initialReport?: Report) {
  const [reportConfig, setReportConfig] = useState<Partial<Report>>({
    name: initialReport?.name || '',
    description: initialReport?.description || '',
    type: initialReport?.type || null,
    configuration: initialReport?.configuration || {
      dateRange: {
        type: 'relative',
        relative: { unit: 'days', amount: 30 }
      },
      dataFilters: [],
      metrics: [],
      visualizations: [],
      formatting: {
        theme: 'default',
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          monospace: 'Monaco'
        },
        pageSettings: {
          orientation: 'portrait',
          size: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        }
      }
    },
    recipients: initialReport?.recipients || [],
    tags: initialReport?.tags || [],
    status: initialReport?.status || 'draft',
  });

  const queryClient = useQueryClient();

  const saveReport = useMutation({
    mutationFn: (report: Partial<Report>) =>
      initialReport
        ? reportsService.updateReport(initialReport.id, report)
        : reportsService.createReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const previewReport = useMutation({
    mutationFn: (config: ReportConfiguration) =>
      reportsService.previewReport(config),
  });

  const updateConfiguration = useCallback((updates: Partial<ReportConfiguration>) => {
    setReportConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        ...updates,
      },
    }));
  }, []);

  const addMetric = useCallback((metric: MetricConfiguration) => {
    setReportConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        metrics: [...(prev.configuration?.metrics || []), metric],
      },
    }));
  }, []);

  const removeMetric = useCallback((metricId: string) => {
    setReportConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        metrics: prev.configuration?.metrics?.filter(m => m.id !== metricId) || [],
      },
    }));
  }, []);

  const addVisualization = useCallback((visualization: VisualizationConfiguration) => {
    setReportConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        visualizations: [...(prev.configuration?.visualizations || []), visualization],
      },
    }));
  }, []);

  const removeVisualization = useCallback((visualizationId: string) => {
    setReportConfig(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration!,
        visualizations: prev.configuration?.visualizations?.filter(v => v.id !== visualizationId) || [],
      },
    }));
  }, []);

  const validateConfiguration = useCallback(() => {
    const errors: string[] = [];

    if (!reportConfig.name?.trim()) {
      errors.push('Nome do relatório é obrigatório');
    }

    if (!reportConfig.configuration?.metrics?.length) {
      errors.push('Pelo menos uma métrica deve ser configurada');
    }

    if (!reportConfig.recipients?.length) {
      errors.push('Pelo menos um destinatário deve ser configurado');
    }

    return errors;
  }, [reportConfig]);

  return {
    reportConfig,
    setReportConfig,
    updateConfiguration,
    addMetric,
    removeMetric,
    addVisualization,
    removeVisualization,
    validateConfiguration,
    saveReport,
    previewReport,
  };
}