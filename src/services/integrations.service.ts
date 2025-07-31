import { apiClient } from './api-client'

export interface Integration {
  id: string
  name: string
  type: 'payment' | 'consultation' | 'notification' | 'webhook' | 'api' | 'custom'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'maintenance' | 'testing'
  config: {
    baseUrl?: string
    apiKey?: string
    credentials?: Record<string, any>
    timeout?: number
    retries?: number
    rateLimit?: {
      requests: number
      window: number // seconds
    }
    [key: string]: any
  }
  metadata: {
    version?: string
    environment: 'production' | 'staging' | 'development'
    description?: string
    documentation?: string
    contact?: {
      email?: string
      team?: string
      slack?: string
    }
    sla?: {
      uptime: number
      responseTime: number
    }
  }
  monitoring: {
    enabled: boolean
    healthCheck: {
      url?: string
      interval: number // seconds
      timeout: number
      expectedStatus?: number
    }
    alerts: {
      enabled: boolean
      rules: string[] // alert rule IDs
    }
  }
  metrics: IntegrationMetrics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastUsed?: Date
  tags: string[]
}

export interface IntegrationMetrics {
  uptime: {
    current: number
    last24h: number
    last7d: number
    last30d: number
  }
  performance: {
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    throughput: number // requests per second
  }
  reliability: {
    successRate: number
    errorRate: number
    totalRequests: number
    totalErrors: number
  }
  usage: {
    requestsToday: number
    requestsThisWeek: number
    requestsThisMonth: number
    topEndpoints: Array<{
      endpoint: string
      count: number
      avgResponseTime: number
    }>
  }
  costs?: {
    currentMonth: number
    lastMonth: number
    currency: string
    breakdown?: Array<{
      item: string
      cost: number
      unit: string
    }>
  }
}

export interface IntegrationTest {
  id: string
  integrationId: string
  type: 'health_check' | 'endpoint_test' | 'full_test' | 'load_test'
  status: 'running' | 'passed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  duration?: number
  results: {
    overall: 'pass' | 'fail' | 'warning'
    tests: Array<{
      name: string
      status: 'pass' | 'fail' | 'skip'
      duration: number
      details?: string
      error?: string
    }>
    metrics?: {
      responseTime: number
      successRate: number
      throughput?: number
    }
  }
  logs: Array<{
    timestamp: Date
    level: 'info' | 'warning' | 'error'
    message: string
    data?: Record<string, any>
  }>
}

export interface IntegrationEvent {
  id: string
  integrationId: string
  type: 'request' | 'response' | 'error' | 'timeout' | 'rate_limit'
  timestamp: Date
  endpoint?: string
  method?: string
  statusCode?: number
  responseTime?: number
  requestSize?: number
  responseSize?: number
  error?: {
    message: string
    code?: string
    stack?: string
  }
  metadata?: Record<string, any>
  traceId?: string
  userId?: string
  sessionId?: string
}

export interface WebhookConfig {
  id: string
  integrationId: string
  name: string
  url: string
  events: string[]
  headers?: Record<string, string>
  secret?: string
  enabled: boolean
  retryConfig: {
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    initialDelay: number
  }
  filters?: Array<{
    field: string
    operator: 'equals' | 'contains' | 'in'
    value: any
  }>
  createdAt: Date
  lastDelivery?: Date
  deliveryStats: {
    total: number
    successful: number
    failed: number
    successRate: number
  }
}

class IntegrationsService {
  private baseUrl = '/integrations'

  /**
   * Get all integrations
   */
  async getIntegrations(filters: {
    type?: string
    status?: string
    provider?: string
    tags?: string[]
  } = {}): Promise<Integration[]> {
    return apiClient.get(this.baseUrl, {
      ...filters,
      tags: filters.tags?.join(',')
    })
  }

  /**
   * Get specific integration by ID
   */
  async getIntegrationById(id: string): Promise<Integration> {
    return apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Create new integration
   */
  async createIntegration(integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'metrics'>): Promise<Integration> {
    return apiClient.post(this.baseUrl, integration)
  }

  /**
   * Update integration
   */
  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    return apiClient.put(`${this.baseUrl}/${id}`, updates)
  }

  /**
   * Delete integration
   */
  async deleteIntegration(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Test integration connection
   */
  async testIntegration(id: string, testType: 'health_check' | 'endpoint_test' | 'full_test' = 'health_check'): Promise<IntegrationTest> {
    return apiClient.post(`${this.baseUrl}/${id}/test`, { type: testType })
  }

  /**
   * Get integration test results
   */
  async getTestResults(id: string, testId: string): Promise<IntegrationTest> {
    return apiClient.get(`${this.baseUrl}/${id}/tests/${testId}`)
  }

  /**
   * Get integration test history
   */
  async getTestHistory(id: string, options: {
    limit?: number
    type?: string
    status?: string
  } = {}): Promise<IntegrationTest[]> {
    return apiClient.get(`${this.baseUrl}/${id}/tests`, options)
  }

  /**
   * Enable/disable integration
   */
  async toggleIntegration(id: string, enabled: boolean): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/${id}/toggle`, { enabled })
  }

  /**
   * Get integration metrics
   */
  async getIntegrationMetrics(id: string, options: {
    startDate?: Date
    endDate?: Date
    interval?: 'hour' | 'day' | 'week'
  } = {}): Promise<{
    current: IntegrationMetrics
    timeSeries: Array<{
      timestamp: Date
      metrics: IntegrationMetrics
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/${id}/metrics`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get integration events/logs
   */
  async getIntegrationEvents(id: string, options: {
    startDate?: Date
    endDate?: Date
    type?: string
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<{
    events: IntegrationEvent[]
    totalCount: number
    page: number
    limit: number
  }> {
    return apiClient.get(`${this.baseUrl}/${id}/events`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get all webhook configurations
   */
  async getWebhooks(integrationId?: string): Promise<WebhookConfig[]> {
    const endpoint = integrationId
      ? `${this.baseUrl}/${integrationId}/webhooks`
      : `${this.baseUrl}/webhooks`
    return apiClient.get(endpoint)
  }

  /**
   * Create webhook configuration
   */
  async createWebhook(webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'deliveryStats'>): Promise<WebhookConfig> {
    return apiClient.post(`${this.baseUrl}/${webhook.integrationId}/webhooks`, webhook)
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(integrationId: string, webhookId: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> {
    return apiClient.put(`${this.baseUrl}/${integrationId}/webhooks/${webhookId}`, updates)
  }

  /**
   * Delete webhook configuration
   */
  async deleteWebhook(integrationId: string, webhookId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${integrationId}/webhooks/${webhookId}`)
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(integrationId: string, webhookId: string, payload?: Record<string, any>): Promise<{
    success: boolean
    statusCode?: number
    responseTime: number
    error?: string
    response?: string
  }> {
    return apiClient.post(`${this.baseUrl}/${integrationId}/webhooks/${webhookId}/test`, { payload })
  }

  /**
   * Get webhook delivery history
   */
  async getWebhookDeliveries(integrationId: string, webhookId: string, options: {
    startDate?: Date
    endDate?: Date
    status?: 'success' | 'failed' | 'pending'
    limit?: number
  } = {}): Promise<Array<{
    id: string
    timestamp: Date
    status: 'success' | 'failed' | 'pending'
    statusCode?: number
    responseTime?: number
    attempts: number
    payload: Record<string, any>
    response?: string
    error?: string
    nextRetry?: Date
  }>> {
    return apiClient.get(`${this.baseUrl}/${integrationId}/webhooks/${webhookId}/deliveries`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get available integration templates
   */
  async getIntegrationTemplates(): Promise<Array<{
    id: string
    name: string
    provider: string
    type: string
    description: string
    category: string
    template: Partial<Integration>
    configSchema: Record<string, any>
    documentation?: string
  }>> {
    return apiClient.get(`${this.baseUrl}/templates`)
  }

  /**
   * Create integration from template
   */
  async createFromTemplate(templateId: string, config: Record<string, any>): Promise<Integration> {
    return apiClient.post(`${this.baseUrl}/templates/${templateId}/create`, { config })
  }

  /**
   * Get integration providers and their capabilities
   */
  async getProviders(): Promise<Array<{
    id: string
    name: string
    type: string[]
    capabilities: string[]
    documentation?: string
    status: 'available' | 'deprecated' | 'beta'
    configSchema?: Record<string, any>
  }>> {
    return apiClient.get(`${this.baseUrl}/providers`)
  }

  /**
   * Validate integration configuration
   */
  async validateConfig(config: Partial<Integration>): Promise<{
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
  }> {
    return apiClient.post(`${this.baseUrl}/validate`, config)
  }

  /**
   * Get integration health summary
   */
  async getHealthSummary(): Promise<{
    totalIntegrations: number
    activeIntegrations: number
    healthyIntegrations: number
    criticalIssues: number
    avgUptime: number
    avgResponseTime: number
    totalRequests24h: number
    errorRate24h: number
    byProvider: Array<{
      provider: string
      count: number
      healthy: number
      avgUptime: number
    }>
    recentIssues: Array<{
      integrationId: string
      name: string
      issue: string
      timestamp: Date
      severity: 'low' | 'medium' | 'high' | 'critical'
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/health`)
  }

  /**
   * Export integration data
   */
  async exportIntegrations(
    format: 'csv' | 'json' | 'xlsx',
    options: {
      includeMetrics?: boolean
      includeConfig?: boolean
      includeEvents?: boolean
    } = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...options
    })
  }

  /**
   * Bulk operations on integrations
   */
  async bulkUpdate(operation: {
    type: 'enable' | 'disable' | 'test' | 'update_tags'
    integrationIds: string[]
    data?: Record<string, any>
  }): Promise<{
    success: number
    failed: number
    errors?: Array<{ integrationId: string; error: string }>
  }> {
    return apiClient.post(`${this.baseUrl}/bulk`, operation)
  }
}

export const integrationsService = new IntegrationsService()