import { apiClient } from './api-client'

export interface SystemHealthStatus {
  status: 'healthy' | 'warning' | 'error' | 'critical'
  uptime: number
  version: string
  environment: string
  timestamp: Date
  services: Array<{
    name: string
    status: 'healthy' | 'warning' | 'error' | 'offline'
    uptime: number
    responseTime: number
    lastCheck: Date
    details?: Record<string, any>
  }>
  metrics: {
    cpu: number
    memory: number
    disk: number
    connections: number
    requestsPerSecond: number
    errorRate: number
  }
  dependencies: Array<{
    name: string
    status: 'healthy' | 'warning' | 'error'
    latency: number
    lastCheck: Date
  }>
}

export interface ProviderStatus {
  id: string
  name: string
  type: 'payment' | 'consultation' | 'notification' | 'other'
  status: 'healthy' | 'warning' | 'error' | 'maintenance' | 'offline'
  uptime: number
  slaCompliance: number
  metrics: {
    latency: {
      current: number
      avg24h: number
      p95: number
      p99: number
    }
    throughput: {
      requestsPerSecond: number
      requestsPerMinute: number
    }
    errors: {
      rate: number
      count24h: number
      recentErrors: Array<{
        timestamp: Date
        error: string
        endpoint?: string
      }>
    }
  }
  endpoints: Array<{
    url: string
    method: string
    status: 'healthy' | 'warning' | 'error'
    responseTime: number
    lastCheck: Date
    successRate: number
  }>
  lastCheck: Date
  nextCheck: Date
}

export interface RealTimeEvent {
  id: string
  timestamp: Date
  type: 'event' | 'error' | 'warning' | 'info'
  source: string
  category: string
  message: string
  data?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved?: boolean
}

export interface PerformanceMetrics {
  timestamp: Date
  system: {
    cpu: number
    memory: number
    disk: number
    network: {
      inbound: number
      outbound: number
    }
  }
  application: {
    responseTime: {
      avg: number
      p50: number
      p95: number
      p99: number
    }
    throughput: number
    errorRate: number
    activeConnections: number
  }
  database: {
    connections: number
    queryTime: number
    slowQueries: number
  }
  cache: {
    hitRate: number
    memory: number
    operations: number
  }
}

export interface SLAIndicator {
  name: string
  current: number
  target: number
  status: 'meeting' | 'at_risk' | 'breached'
  period: 'monthly' | 'weekly' | 'daily'
  trend: 'improving' | 'stable' | 'degrading'
  history: Array<{
    period: string
    value: number
    target: number
  }>
}

class MonitoringService {
  private baseUrl = '/monitoring'

  /**
   * Get overall system health
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    return apiClient.get(`${this.baseUrl}/health`)
  }

  /**
   * Get all providers status
   */
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    return apiClient.get(`${this.baseUrl}/providers`)
  }

  /**
   * Get specific provider status
   */
  async getProviderStatus(providerId: string): Promise<ProviderStatus> {
    return apiClient.get(`${this.baseUrl}/providers/${providerId}`)
  }

  /**
   * Test provider connection
   */
  async testProvider(providerId: string): Promise<{
    success: boolean
    responseTime: number
    timestamp: Date
    details?: Record<string, any>
    error?: string
  }> {
    return apiClient.post(`${this.baseUrl}/providers/${providerId}/test`)
  }

  /**
   * Get real-time events stream
   */
  async getRealTimeEvents(options: {
    limit?: number
    types?: string[]
    severity?: string[]
    since?: Date
  } = {}): Promise<RealTimeEvent[]> {
    return apiClient.get(`${this.baseUrl}/events/realtime`, {
      ...options,
      since: options.since?.toISOString()
    })
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(options: {
    startDate?: Date
    endDate?: Date
    interval?: 'minute' | 'hour' | 'day'
  } = {}): Promise<PerformanceMetrics[]> {
    return apiClient.get(`${this.baseUrl}/performance`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get current performance snapshot
   */
  async getCurrentPerformance(): Promise<PerformanceMetrics> {
    return apiClient.get(`${this.baseUrl}/performance/current`)
  }

  /**
   * Get SLA indicators
   */
  async getSLAIndicators(): Promise<SLAIndicator[]> {
    return apiClient.get(`${this.baseUrl}/sla`)
  }

  /**
   * Get specific SLA indicator
   */
  async getSLAIndicator(name: string, period: string = 'monthly'): Promise<SLAIndicator> {
    return apiClient.get(`${this.baseUrl}/sla/${name}`, { period })
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts(options: {
    status?: 'active' | 'resolved' | 'all'
    severity?: string[]
    limit?: number
  } = {}): Promise<Array<{
    id: string
    title: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'active' | 'acknowledged' | 'resolved'
    createdAt: Date
    updatedAt: Date
    source: string
    category: string
    data?: Record<string, any>
  }>> {
    return apiClient.get(`${this.baseUrl}/alerts`, options)
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, note?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/alerts/${alertId}/acknowledge`, { note })
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/alerts/${alertId}/resolve`, { resolution })
  }

  /**
   * Get monitoring dashboard configuration
   */
  async getDashboardConfig(): Promise<{
    widgets: Array<{
      id: string
      type: 'metric' | 'chart' | 'status' | 'alert'
      title: string
      config: Record<string, any>
      position: { x: number; y: number; w: number; h: number }
      refreshInterval: number
    }>
    layout: string
    autoRefresh: boolean
    refreshInterval: number
  }> {
    return apiClient.get(`${this.baseUrl}/dashboard/config`)
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(config: {
    widgets: Array<{
      id: string
      type: string
      title: string
      config: Record<string, any>
      position: { x: number; y: number; w: number; h: number }
    }>
  }): Promise<void> {
    return apiClient.put(`${this.baseUrl}/dashboard/config`, config)
  }

  /**
   * Get incident history
   */
  async getIncidentHistory(options: {
    startDate?: Date
    endDate?: Date
    severity?: string[]
    resolved?: boolean
    limit?: number
  } = {}): Promise<Array<{
    id: string
    title: string
    description: string
    severity: string
    status: 'open' | 'investigating' | 'resolved'
    createdAt: Date
    resolvedAt?: Date
    duration?: number
    impact: string[]
    timeline: Array<{
      timestamp: Date
      action: string
      author: string
      note?: string
    }>
  }>> {
    return apiClient.get(`${this.baseUrl}/incidents`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Create incident
   */
  async createIncident(incident: {
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    impact: string[]
    assignee?: string
  }): Promise<{ id: string }> {
    return apiClient.post(`${this.baseUrl}/incidents`, incident)
  }

  /**
   * Update incident
   */
  async updateIncident(id: string, update: {
    status?: 'open' | 'investigating' | 'resolved'
    note?: string
    assignee?: string
  }): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/incidents/${id}`, update)
  }

  /**
   * Get monitoring statistics
   */
  async getMonitoringStats(period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    period: string
    uptime: number
    totalEvents: number
    totalAlerts: number
    resolvedAlerts: number
    avgResponseTime: number
    errorRate: number
    providersHealth: {
      healthy: number
      warning: number
      error: number
      offline: number
    }
    slaCompliance: number
  }> {
    return apiClient.get(`${this.baseUrl}/stats`, { period })
  }
}

export const monitoringService = new MonitoringService()