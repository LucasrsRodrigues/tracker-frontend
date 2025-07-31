import { apiClient } from './api-client'

export interface AlertRule {
  id: string
  name: string
  description?: string
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  conditions: AlertCondition[]
  channels: AlertChannel[]
  schedule?: AlertSchedule
  tags: string[]
  metadata?: {
    owner?: string
    team?: string
    runbook?: string
    [key: string]: any
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastTriggered?: Date
  triggerCount: number
}

export interface AlertCondition {
  id: string
  metric: string
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'contains' | 'not_contains'
  threshold: number | string
  timeWindow: number // minutes
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count' | 'p95' | 'p99'
  filters?: Record<string, any>
}

export interface AlertChannel {
  id: string
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'teams' | 'pagerduty'
  name: string
  config: Record<string, any>
  enabled: boolean
}

export interface AlertSchedule {
  timezone: string
  muteDays?: string[] // ['monday', 'sunday']
  muteHours?: { start: string; end: string } // { start: '22:00', end: '08:00' }
  suppressionRules?: Array<{
    duration: number // minutes
    maxAlerts: number
  }>
}

export interface AlertInstance {
  id: string
  ruleId: string
  ruleName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'firing' | 'resolved' | 'suppressed' | 'muted'
  message: string
  description?: string
  triggeredAt: Date
  resolvedAt?: Date
  duration?: number
  conditions: Array<{
    condition: AlertCondition
    currentValue: number | string
    threshold: number | string
    breached: boolean
  }>
  context: {
    metric: string
    value: number | string
    timestamp: Date
    filters?: Record<string, any>
    metadata?: Record<string, any>
  }
  notifications: Array<{
    channelId: string
    channelType: string
    status: 'pending' | 'sent' | 'failed'
    sentAt?: Date
    error?: string
  }>
  assignee?: {
    id: string
    name: string
    email: string
  }
  tags: string[]
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  acknowledgeNote?: string
}

export interface AlertFilters {
  startDate?: Date
  endDate?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
  status?: ('firing' | 'resolved' | 'suppressed' | 'muted')[]
  severity?: ('low' | 'medium' | 'high' | 'critical')[]
  ruleIds?: string[]
  tags?: string[]
  acknowledged?: boolean
  assignee?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'triggeredAt' | 'severity' | 'duration' | 'ruleName'
  sortOrder?: 'asc' | 'desc'
}

export interface AlertAnalytics {
  period: { start: Date; end: Date }
  summary: {
    totalAlerts: number
    firingAlerts: number
    resolvedAlerts: number
    avgResolutionTime: number
    mttr: number // mean time to resolution
    falsePositiveRate: number
  }
  trends: {
    alertsOverTime: Array<{
      timestamp: Date
      count: number
      severity: Record<string, number>
    }>
    topRules: Array<{
      ruleId: string
      ruleName: string
      triggerCount: number
      falsePositives: number
    }>
    channelPerformance: Array<{
      channelType: string
      sentCount: number
      failureRate: number
      avgDeliveryTime: number
    }>
  }
  insights: Array<{
    type: 'noisy_rule' | 'flapping_alert' | 'slow_resolution' | 'high_false_positive'
    title: string
    description: string
    affectedRules: string[]
    recommendations: string[]
  }>
}

class AlertsService {
  private baseUrl = '/alerts'

  /**
   * Get all alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {
    return apiClient.get(`${this.baseUrl}/rules`)
  }

  /**
   * Get specific alert rule
   */
  async getAlertRule(ruleId: string): Promise<AlertRule> {
    return apiClient.get(`${this.baseUrl}/rules/${ruleId}`)
  }

  /**
   * Create new alert rule
   */
  async createAlert(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'triggerCount'>): Promise<AlertRule> {
    return apiClient.post(`${this.baseUrl}/rules`, rule)
  }

  /**
   * Update alert rule
   */
  async updateAlert(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    return apiClient.put(`${this.baseUrl}/rules/${ruleId}`, updates)
  }

  /**
   * Delete alert rule
   */
  async deleteAlert(ruleId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/rules/${ruleId}`)
  }

  /**
   * Enable/disable alert rule
   */
  async toggleAlertRule(ruleId: string, enabled: boolean): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/rules/${ruleId}/toggle`, { enabled })
  }

  /**
   * Test alert rule
   */
  async testAlertRule(rule: Partial<AlertRule>): Promise<{
    wouldTrigger: boolean
    currentValue: number | string
    conditions: Array<{
      condition: AlertCondition
      currentValue: number | string
      breached: boolean
    }>
    estimatedFrequency: string
  }> {
    return apiClient.post(`${this.baseUrl}/rules/test`, rule)
  }

  /**
   * Get alert instances (actual alerts)
   */
  async getAlerts(filters: AlertFilters = {}): Promise<{
    alerts: AlertInstance[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
  }> {
    return apiClient.get(this.baseUrl, {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      status: filters.status?.join(','),
      severity: filters.severity?.join(','),
      ruleIds: filters.ruleIds?.join(','),
      tags: filters.tags?.join(',')
    })
  }

  /**
   * Get specific alert instance
   */
  async getAlert(alertId: string): Promise<AlertInstance> {
    return apiClient.get(`${this.baseUrl}/${alertId}`)
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, note?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${alertId}/acknowledge`, { note })
  }

  /**
   * Resolve alert manually
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${alertId}/resolve`, { resolution })
  }

  /**
   * Assign alert to user
   */
  async assignAlert(alertId: string, assigneeId: string): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/${alertId}/assign`, { assigneeId })
  }

  /**
   * Add tags to alert
   */
  async addAlertTags(alertId: string, tags: string[]): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${alertId}/tags`, { tags })
  }

  /**
   * Get alert channels
   */
  async getAlertChannels(): Promise<AlertChannel[]> {
    return apiClient.get(`${this.baseUrl}/channels`)
  }

  /**
   * Create alert channel
   */
  async createAlertChannel(channel: Omit<AlertChannel, 'id'>): Promise<AlertChannel> {
    return apiClient.post(`${this.baseUrl}/channels`, channel)
  }

  /**
   * Update alert channel
   */
  async updateAlertChannel(channelId: string, updates: Partial<AlertChannel>): Promise<AlertChannel> {
    return apiClient.put(`${this.baseUrl}/channels/${channelId}`, updates)
  }

  /**
   * Delete alert channel
   */
  async deleteAlertChannel(channelId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/channels/${channelId}`)
  }

  /**
   * Test alert channel
   */
  async testAlertChannel(channelId: string, testMessage?: string): Promise<{
    success: boolean
    responseTime: number
    error?: string
  }> {
    return apiClient.post(`${this.baseUrl}/channels/${channelId}/test`, { testMessage })
  }

  /**
   * Get alert analytics
   */
  async getAlertAnalytics(options: {
    startDate?: Date
    endDate?: Date
    ruleIds?: string[]
    includeInsights?: boolean
  } = {}): Promise<AlertAnalytics> {
    return apiClient.get(`${this.baseUrl}/analytics`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString(),
      ruleIds: options.ruleIds?.join(',')
    })
  }

  /**
   * Get alert history for a rule
   */
  async getAlertHistory(ruleId: string, options: {
    startDate?: Date
    endDate?: Date
    limit?: number
  } = {}): Promise<{
    rule: AlertRule
    history: AlertInstance[]
    stats: {
      totalTriggers: number
      avgDuration: number
      falsePositiveRate: number
      lastTriggered?: Date
    }
  }> {
    return apiClient.get(`${this.baseUrl}/rules/${ruleId}/history`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Mute alerts for a rule
   */
  async muteAlertRule(ruleId: string, options: {
    duration: number // minutes
    reason?: string
  }): Promise<void> {
    return apiClient.post(`${this.baseUrl}/rules/${ruleId}/mute`, options)
  }

  /**
   * Unmute alerts for a rule
   */
  async unmuteAlertRule(ruleId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/rules/${ruleId}/unmute`)
  }

  /**
   * Get alert templates
   */
  async getAlertTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    category: 'system' | 'business' | 'custom'
    template: Partial<AlertRule>
    variables?: Array<{
      name: string
      type: 'string' | 'number' | 'select'
      required: boolean
      default?: any
      options?: any[]
    }>
  }>> {
    return apiClient.get(`${this.baseUrl}/templates`)
  }

  /**
   * Create alert from template
   */
  async createFromTemplate(templateId: string, variables: Record<string, any>): Promise<AlertRule> {
    return apiClient.post(`${this.baseUrl}/templates/${templateId}/create`, { variables })
  }

  /**
   * Bulk operations on alerts
   */
  async bulkUpdateAlerts(operation: {
    type: 'acknowledge' | 'resolve' | 'assign' | 'add_tags'
    alertIds: string[]
    data?: Record<string, any>
  }): Promise<{
    success: number
    failed: number
    errors?: Array<{ alertId: string; error: string }>
  }> {
    return apiClient.post(`${this.baseUrl}/bulk`, operation)
  }

  /**
   * Get alert metrics for dashboard
   */
  async getAlertMetrics(): Promise<{
    firingAlerts: number
    resolvedToday: number
    avgResolutionTime: number
    topRules: Array<{
      ruleId: string
      name: string
      triggerCount: number
    }>
    channelHealth: Array<{
      channelId: string
      name: string
      type: string
      successRate: number
      lastUsed?: Date
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/metrics`)
  }

  /**
   * Export alert data
   */
  async exportAlerts(
    format: 'csv' | 'json' | 'xlsx',
    filters: AlertFilters = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString()
    })
  }

  /**
   * Get alert configuration recommendations
   */
  async getAlertRecommendations(): Promise<Array<{
    type: 'optimization' | 'coverage' | 'noise_reduction'
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    impact: string
    recommendation: string
    suggestedRule?: Partial<AlertRule>
  }>> {
    return apiClient.get(`${this.baseUrl}/recommendations`)
  }

  /**
   * Get system health for alerting
   */
  async getAlertingHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    activeRules: number
    firingAlerts: number
    channelStatus: Array<{
      channelId: string
      name: string
      status: 'healthy' | 'error'
      lastTest?: Date
    }>
    evaluationLag: number // seconds
    lastEvaluation: Date
    queueSize: number
  }> {
    return apiClient.get(`${this.baseUrl}/health`)
  }
}

export const alertsService = new AlertsService()