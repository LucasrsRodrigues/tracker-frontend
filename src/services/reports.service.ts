import { apiClient } from './api-client'

export interface ReportConfig {
  id?: string
  name: string
  description?: string
  type: 'executive' | 'operational' | 'analytical' | 'compliance' | 'custom'
  dataSource: 'events' | 'analytics' | 'errors' | 'performance' | 'mixed'
  timeRange: {
    type: 'relative' | 'absolute'
    value?: 'last_24h' | 'last_7d' | 'last_30d' | 'last_quarter' | 'last_year'
    start?: Date
    end?: Date
  }
  filters: Array<{
    field: string
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'not_in'
    value: any
  }>
  groupBy: string[]
  metrics: Array<{
    field: string
    function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'p95' | 'p99'
    alias?: string
  }>
  visualizations: Array<{
    type: 'table' | 'line' | 'bar' | 'pie' | 'area' | 'heatmap' | 'funnel'
    title: string
    data: string // metric alias or calculated field
    options: Record<string, any>
  }>
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'
  layout?: {
    orientation: 'portrait' | 'landscape'
    pageSize: 'A4' | 'A3' | 'letter' | 'legal'
    margins: { top: number; right: number; bottom: number; left: number }
    header?: {
      title: string
      subtitle?: string
      logo?: string
    }
    footer?: {
      includePageNumbers: boolean
      includeTimestamp: boolean
      customText?: string
    }
  }
  scheduling?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    time: string // HH:mm
    dayOfWeek?: number // 0-6 for weekly
    dayOfMonth?: number // 1-31 for monthly
    timezone: string
    recipients: Array<{
      email: string
      name?: string
    }>
  }
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  tags: string[]
}

export interface Report {
  id: string
  config: ReportConfig
  status: 'generating' | 'completed' | 'failed' | 'cancelled'
  progress: number
  generatedAt?: Date
  completedAt?: Date
  fileSize?: number
  downloadUrl?: string
  error?: string
  metadata: {
    totalRecords: number
    executionTime: number
    dataFreshness: Date
  }
  delivery?: {
    scheduled: boolean
    deliveredAt?: Date
    recipients: string[]
    deliveryStatus: 'pending' | 'sent' | 'failed'
    deliveryError?: string
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'technical' | 'compliance' | 'executive'
  type: ReportConfig['type']
  template: Partial<ReportConfig>
  preview?: string
  variables?: Array<{
    name: string
    type: 'string' | 'number' | 'date' | 'select' | 'multiselect'
    label: string
    description?: string
    required: boolean
    defaultValue?: any
    options?: Array<{ value: any; label: string }>
    validation?: {
      min?: number
      max?: number
      pattern?: string
    }
  }>
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

export interface ReportInsights {
  reportId: string
  insights: Array<{
    type: 'trend' | 'anomaly' | 'comparison' | 'recommendation'
    title: string
    description: string
    confidence: number
    impact: 'low' | 'medium' | 'high'
    data: Record<string, any>
    suggestions?: string[]
  }>
  summary: {
    keyFindings: string[]
    trends: Array<{
      metric: string
      direction: 'up' | 'down' | 'stable'
      magnitude: number
      significance: 'low' | 'medium' | 'high'
    }>
    comparisons: Array<{
      metric: string
      current: number
      previous: number
      change: number
      changePercent: number
    }>
  }
  generatedAt: Date
}

export interface ReportAudit {
  id: string
  reportId: string
  action: 'created' | 'updated' | 'generated' | 'downloaded' | 'shared' | 'deleted'
  userId: string
  userEmail: string
  timestamp: Date
  details: Record<string, any>
  ipAddress: string
  userAgent: string
}

class ReportsService {
  private baseUrl = '/reports'

  /**
   * Get all reports
   */
  async getReports(options: {
    type?: string
    status?: string
    tags?: string[]
    createdBy?: string
    page?: number
    limit?: number
    sortBy?: 'createdAt' | 'updatedAt' | 'name'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{
    reports: Report[]
    totalCount: number
    page: number
    limit: number
  }> {
    return apiClient.get(this.baseUrl, {
      ...options,
      tags: options.tags?.join(',')
    })
  }

  /**
   * Get specific report
   */
  async getReport(id: string): Promise<Report> {
    return apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Create new report configuration
   */
  async createReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ReportConfig> {
    return apiClient.post(`${this.baseUrl}/configs`, config)
  }

  /**
   * Update report configuration
   */
  async updateReport(id: string, updates: Partial<ReportConfig>): Promise<ReportConfig> {
    return apiClient.put(`${this.baseUrl}/configs/${id}`, updates)
  }

  /**
   * Delete report configuration
   */
  async deleteReport(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/configs/${id}`)
  }

  /**
   * Generate report
   */
  async generateReport(configId: string, options: {
    async?: boolean
    customTimeRange?: {
      start: Date
      end: Date
    }
    customFilters?: Record<string, any>
  } = {}): Promise<Report | { jobId: string }> {
    return apiClient.post(`${this.baseUrl}/generate`, {
      configId,
      ...options,
      customTimeRange: options.customTimeRange ? {
        start: options.customTimeRange.start.toISOString(),
        end: options.customTimeRange.end.toISOString()
      } : undefined
    })
  }

  /**
   * Generate report from template
   */
  async generateFromTemplate(templateId: string, variables: Record<string, any>, options: {
    async?: boolean
  } = {}): Promise<Report | { jobId: string }> {
    return apiClient.post(`${this.baseUrl}/templates/${templateId}/generate`, {
      variables,
      ...options
    })
  }

  /**
   * Get report generation status
   */
  async getReportStatus(reportId: string): Promise<{
    status: Report['status']
    progress: number
    estimatedCompletion?: Date
    error?: string
  }> {
    return apiClient.get(`${this.baseUrl}/${reportId}/status`)
  }

  /**
   * Download report file
   */
  async downloadReport(reportId: string): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/${reportId}/download`)
  }

  /**
   * Cancel report generation
   */
  async cancelReport(reportId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${reportId}/cancel`)
  }

  /**
   * Schedule report
   */
  async scheduleReport(configId: string, schedule: ReportConfig['scheduling']): Promise<{
    scheduleId: string
    nextRun: Date
  }> {
    return apiClient.post(`${this.baseUrl}/configs/${configId}/schedule`, { schedule })
  }

  /**
   * Update report schedule
   */
  async updateSchedule(configId: string, scheduleId: string, schedule: ReportConfig['scheduling']): Promise<void> {
    return apiClient.put(`${this.baseUrl}/configs/${configId}/schedules/${scheduleId}`, { schedule })
  }

  /**
   * Delete report schedule
   */
  async deleteSchedule(configId: string, scheduleId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/configs/${configId}/schedules/${scheduleId}`)
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<Array<{
    id: string
    configId: string
    reportName: string
    schedule: ReportConfig['scheduling']
    nextRun: Date
    lastRun?: Date
    status: 'active' | 'paused' | 'error'
    successCount: number
    failureCount: number
  }>> {
    return apiClient.get(`${this.baseUrl}/schedules`)
  }

  /**
   * Get report templates
   */
  async getReportTemplates(options: {
    category?: string
    type?: string
    tags?: string[]
    isPublic?: boolean
  } = {}): Promise<ReportTemplate[]> {
    return apiClient.get(`${this.baseUrl}/templates`, {
      ...options,
      tags: options.tags?.join(',')
    })
  }

  /**
   * Get specific report template
   */
  async getReportTemplate(id: string): Promise<ReportTemplate> {
    return apiClient.get(`${this.baseUrl}/templates/${id}`)
  }

  /**
   * Create report template
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'createdBy' | 'usageCount'>): Promise<ReportTemplate> {
    return apiClient.post(`${this.baseUrl}/templates`, template)
  }

  /**
   * Update report template
   */
  async updateReportTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return apiClient.put(`${this.baseUrl}/templates/${id}`, updates)
  }

  /**
   * Delete report template
   */
  async deleteReportTemplate(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/templates/${id}`)
  }

  /**
   * Preview report data
   */
  async previewReport(config: Partial<ReportConfig>, options: {
    limit?: number
    page?: number
  } = {}): Promise<{
    data: Record<string, any>[]
    totalRecords: number
    schema: Array<{
      field: string
      type: string
      description?: string
    }>
    executionTime: number
  }> {
    return apiClient.post(`${this.baseUrl}/preview`, {
      config,
      ...options
    })
  }

  /**
   * Validate report configuration
   */
  async validateReport(config: Partial<ReportConfig>): Promise<{
    valid: boolean
    errors?: Array<{
      field: string
      message: string
      code: string
    }>
    warnings?: Array<{
      field: string
      message: string
    }>
    estimatedSize?: number
    estimatedTime?: number
  }> {
    return apiClient.post(`${this.baseUrl}/validate`, config)
  }

  /**
   * Get report insights
   */
  async getReportInsights(reportId: string): Promise<ReportInsights> {
    return apiClient.get(`${this.baseUrl}/${reportId}/insights`)
  }

  /**
   * Share report
   */
  async shareReport(reportId: string, options: {
    emails: string[]
    message?: string
    expiresAt?: Date
    downloadLimit?: number
  }): Promise<{
    shareId: string
    shareUrl: string
    expiresAt: Date
  }> {
    return apiClient.post(`${this.baseUrl}/${reportId}/share`, {
      ...options,
      expiresAt: options.expiresAt?.toISOString()
    })
  }

  /**
   * Get shared report info
   */
  async getSharedReport(shareId: string): Promise<{
    report: Report
    shareInfo: {
      expiresAt: Date
      downloadCount: number
      downloadLimit?: number
      isExpired: boolean
    }
  }> {
    return apiClient.get(`${this.baseUrl}/shared/${shareId}`)
  }

  /**
   * Download shared report
   */
  async downloadSharedReport(shareId: string): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/shared/${shareId}/download`)
  }

  /**
   * Get report history
   */
  async getReportHistory(configId: string, options: {
    page?: number
    limit?: number
    status?: string
  } = {}): Promise<{
    reports: Report[]
    totalCount: number
    page: number
    limit: number
  }> {
    return apiClient.get(`${this.baseUrl}/configs/${configId}/history`, options)
  }

  /**
   * Get report audit trail
   */
  async getReportAudit(reportId: string): Promise<ReportAudit[]> {
    return apiClient.get(`${this.baseUrl}/${reportId}/audit`)
  }

  /**
   * Get report analytics
   */
  async getReportAnalytics(options: {
    startDate?: Date
    endDate?: Date
    configId?: string
  } = {}): Promise<{
    totalReports: number
    totalDownloads: number
    avgGenerationTime: number
    popularTemplates: Array<{
      templateId: string
      name: string
      usageCount: number
    }>
    userActivity: Array<{
      userId: string
      userEmail: string
      reportCount: number
      downloadCount: number
    }>
    trends: {
      reportsOverTime: Array<{
        date: Date
        count: number
      }>
      popularFormats: Array<{
        format: string
        count: number
        percentage: number
      }>
    }
  }> {
    return apiClient.get(`${this.baseUrl}/analytics`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Duplicate report configuration
   */
  async duplicateReport(configId: string, newName: string): Promise<ReportConfig> {
    return apiClient.post(`${this.baseUrl}/configs/${configId}/duplicate`, { name: newName })
  }

  /**
   * Export report configurations
   */
  async exportConfigs(
    format: 'json' | 'yaml',
    configIds?: string[]
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/configs/export`, {
      format,
      configIds: configIds?.join(',')
    })
  }

  /**
   * Import report configurations
   */
  async importConfigs(file: File): Promise<{
    imported: number
    failed: number
    errors?: Array<{
      config: string
      error: string
    }>
  }> {
    return apiClient.upload(`${this.baseUrl}/configs/import`, file)
  }
}

export const reportsService = new ReportsService()