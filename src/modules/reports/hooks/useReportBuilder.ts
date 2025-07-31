import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportsService, type ReportConfig } from '@/services/reports.service'
import { QUERY_KEYS } from '@/lib/constants'
import { toast } from 'sonner'

interface ReportBuilderState {
  config: Partial<ReportConfig>
  isValid: boolean
  validationErrors: string[]
  isPreviewMode: boolean
  previewData?: any
}

const initialConfig: Partial<ReportConfig> = {
  name: '',
  description: '',
  type: 'custom',
  dataSource: 'events',
  timeRange: {
    type: 'relative',
    value: 'last_7d'
  },
  filters: [],
  groupBy: [],
  metrics: [],
  visualizations: [],
  format: 'pdf',
  tags: []
}

export function useReportBuilder(initialState?: Partial<ReportConfig>) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<ReportBuilderState>({
    config: { ...initialConfig, ...initialState },
    isValid: false,
    validationErrors: [],
    isPreviewMode: false
  })

  // Validation query
  const validation = useQuery({
    queryKey: ['report-validation', state.config],
    queryFn: () => reportsService.validateReport(state.config),
    enabled: Object.keys(state.config).length > 1, // Basic check
    staleTime: 5000, // 5 seconds
  })

  // Preview query
  const preview = useQuery({
    queryKey: ['report-preview', state.config],
    queryFn: () => reportsService.previewReport(state.config, { limit: 100 }),
    enabled: state.isPreviewMode && validation.data?.valid,
    staleTime: 30000, // 30 seconds
  })

  // Templates query
  const templates = useQuery({
    queryKey: [...QUERY_KEYS.REPORTS, 'templates'],
    queryFn: () => reportsService.getReportTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const updateConfiguration = useCallback((updates: Partial<ReportConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }))
  }, [])

  const setReportConfig = useCallback((config: Partial<ReportConfig>) => {
    setState(prev => ({
      ...prev,
      config
    }))
  }, [])

  const addMetric = useCallback((metric: ReportConfig['metrics'][0]) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        metrics: [...(prev.config.metrics || []), metric]
      }
    }))
  }, [])

  const removeMetric = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        metrics: prev.config.metrics?.filter((_, i) => i !== index) || []
      }
    }))
  }, [])

  const updateMetric = useCallback((index: number, metric: Partial<ReportConfig['metrics'][0]>) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        metrics: prev.config.metrics?.map((m, i) =>
          i === index ? { ...m, ...metric } : m
        ) || []
      }
    }))
  }, [])

  const addVisualization = useCallback((visualization: ReportConfig['visualizations'][0]) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        visualizations: [...(prev.config.visualizations || []), visualization]
      }
    }))
  }, [])

  const removeVisualization = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        visualizations: prev.config.visualizations?.filter((_, i) => i !== index) || []
      }
    }))
  }, [])

  const updateVisualization = useCallback((index: number, visualization: Partial<ReportConfig['visualizations'][0]>) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        visualizations: prev.config.visualizations?.map((v, i) =>
          i === index ? { ...v, ...visualization } : v
        ) || []
      }
    }))
  }, [])

  const addFilter = useCallback((filter: ReportConfig['filters'][0]) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        filters: [...(prev.config.filters || []), filter]
      }
    }))
  }, [])

  const removeFilter = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        filters: prev.config.filters?.filter((_, i) => i !== index) || []
      }
    }))
  }, [])

  const togglePreviewMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode
    }))
  }, [])

  const loadTemplate = useCallback((templateId: string, variables?: Record<string, any>) => {
    const template = templates.data?.find(t => t.id === templateId)
    if (template) {
      let config = { ...template.template }

      // Apply variables if provided
      if (variables && template.variables) {
        template.variables.forEach(variable => {
          const value = variables[variable.name]
          if (value !== undefined) {
            // Apply variable substitution logic here
            config = applyVariableToConfig(config, variable.name, value)
          }
        })
      }

      setReportConfig(config)
    }
  }, [templates.data, setReportConfig])

  // Mutations
  const saveReport = useMutation({
    mutationFn: () => reportsService.createReport(state.config as Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.REPORTS] })
      toast.success('Report configuration saved successfully')
    },
    onError: (error) => {
      toast.error(`Failed to save report: ${error.message}`)
    }
  })

  const generateReport = useMutation({
    mutationFn: (async: boolean = false) =>
      reportsService.generateReport(state.config.id!, { async }),
    onSuccess: (result) => {
      if ('jobId' in result) {
        toast.success('Report generation started. You will be notified when complete.')
      } else {
        toast.success('Report generated successfully')
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate report: ${error.message}`)
    }
  })

  const scheduleReport = useMutation({
    mutationFn: (schedule: ReportConfig['scheduling']) =>
      reportsService.scheduleReport(state.config.id!, schedule),
    onSuccess: () => {
      toast.success('Report scheduled successfully')
    },
    onError: (error) => {
      toast.error(`Failed to schedule report: ${error.message}`)
    }
  })

  const duplicateReport = useMutation({
    mutationFn: (newName: string) =>
      reportsService.duplicateReport(state.config.id!, newName),
    onSuccess: (newConfig) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.REPORTS] })
      setReportConfig(newConfig)
      toast.success('Report duplicated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to duplicate report: ${error.message}`)
    }
  })

  const previewReport = useCallback(() => {
    if (!state.isPreviewMode) {
      togglePreviewMode()
    }
    preview.refetch()
  }, [state.isPreviewMode, togglePreviewMode, preview])

  const validateConfiguration = useCallback(() => {
    return validation.refetch()
  }, [validation])

  const resetConfiguration = useCallback(() => {
    setReportConfig(initialConfig)
  }, [setReportConfig])

  const exportConfiguration = useCallback(() => {
    const dataStr = JSON.stringify(state.config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${state.config.name || 'report'}-config.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [state.config])

  const importConfiguration = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        setReportConfig(config)
        toast.success('Configuration imported successfully')
      } catch (error) {
        toast.error('Failed to import configuration: Invalid JSON')
      }
    }
    reader.readAsText(file)
  }, [setReportConfig])

  return {
    // State
    reportConfig: state.config,
    isValid: validation.data?.valid || false,
    validationErrors: validation.data?.errors || [],
    isPreviewMode: state.isPreviewMode,
    previewData: preview.data,

    // Data
    templates: templates.data || [],

    // Loading states
    isValidating: validation.isFetching,
    isPreviewing: preview.isFetching,
    isLoadingTemplates: templates.isLoading,
    isSaving: saveReport.isPending,
    isGenerating: generateReport.isPending,

    // Actions
    setReportConfig,
    updateConfiguration,
    addMetric,
    removeMetric,
    updateMetric,
    addVisualization,
    removeVisualization,
    updateVisualization,
    addFilter,
    removeFilter,
    togglePreviewMode,
    loadTemplate,

    // Mutations
    saveReport: saveReport.mutate,
    generateReport: generateReport.mutate,
    scheduleReport: scheduleReport.mutate,
    duplicateReport: duplicateReport.mutate,

    // Utilities
    previewReport,
    validateConfiguration,
    resetConfiguration,
    exportConfiguration,
    importConfiguration
  }
}

// Helper function to apply variables to config
function applyVariableToConfig(config: any, variableName: string, value: any): any {
  const configStr = JSON.stringify(config)
  const replacedStr = configStr.replace(
    new RegExp(`{{${variableName}}}`, 'g'),
    typeof value === 'string' ? value : JSON.stringify(value)
  )
  return JSON.parse(replacedStr)
}

// Hook for managing report templates
export function useReportTemplates() {
  const queryClient = useQueryClient()

  const createTemplate = useMutation({
    mutationFn: (template: any) => reportsService.createReportTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.REPORTS, 'templates'] })
      toast.success('Template created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`)
    }
  })

  const updateTemplate = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      reportsService.updateReportTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.REPORTS, 'templates'] })
      toast.success('Template updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`)
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => reportsService.deleteReportTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.REPORTS, 'templates'] })
      toast.success('Template deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`)
    }
  })

  return {
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending
  }
}