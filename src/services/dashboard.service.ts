import { APP_CONFIG } from '@/lib/constants'
import type {
  DashboardMetrics,
  CriticalAlert,
  TimeSeriesData,
  ProviderStatus,
  RealtimeStats
} from '@/modules/dashboard/types/dashboard.types'

export interface DashboardApiResponse<T = any> {
  data: T
  success: boolean
  timestamp: string
}

export interface TimeRangeOptions {
  start?: Date
  end?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d' | 'custom'
}

class DashboardService {
  private baseUrl = `${APP_CONFIG.api.baseUrl}/dashboard`
  private timeout = APP_CONFIG.api.timeout

  /**
   * Get authentication headers
   */
  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('tracking-auth-token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  /**
   * Generic API request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: DashboardApiResponse<T> = await response.json()
      return result.data
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      console.error('Dashboard API Error:', error)
      throw error
    }
  }

  /**
   * Get dashboard overview metrics
   */
  async getMetrics(options: TimeRangeOptions = {}): Promise<DashboardMetrics> {
    const params = new URLSearchParams()

    if (options.timeRange) {
      params.append('timeRange', options.timeRange)
    }

    if (options.start) {
      params.append('startDate', options.start.toISOString())
    }

    if (options.end) {
      params.append('endDate', options.end.toISOString())
    }

    const queryString = params.toString()
    const endpoint = `/metrics${queryString ? `?${queryString}` : ''}`

    return this.request<DashboardMetrics>(endpoint)
  }

  /**
   * Get real-time statistics
   */
  async getRealtimeStats(): Promise<RealtimeStats> {
    return this.request<RealtimeStats>('/realtime')
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesData(
    metric: 'events' | 'users' | 'errors' | 'response_time',
    options: TimeRangeOptions & { interval?: '1m' | '5m' | '1h' | '1d' } = {}
  ): Promise<TimeSeriesData[]> {
    const params = new URLSearchParams()

    params.append('metric', metric)

    if (options.interval) {
      params.append('interval', options.interval)
    }

    if (options.timeRange) {
      params.append('timeRange', options.timeRange)
    }

    if (options.start) {
      params.append('startDate', options.start.toISOString())
    }

    if (options.end) {
      params.append('endDate', options.end.toISOString())
    }

    return this.request<TimeSeriesData[]>(`/timeseries?${params.toString()}`)
  }

  /**
   * Get critical alerts
   */
  async getCriticalAlerts(limit: number = 10): Promise<CriticalAlert[]> {
    return this.request<CriticalAlert[]>(`/alerts/critical?limit=${limit}`)
  }

  /**
   * Get provider status information
   */
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    return this.request<ProviderStatus[]>('/providers/status')
  }

  /**
   * Get system health overview
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'error'
    services: Array<{
      name: string
      status: 'healthy' | 'warning' | 'error'
      uptime: number
      lastCheck: string
    }>
    metrics: {
      cpu: number
      memory: number
      disk: number
      connections: number
    }
  }> {
    return this.request('/health')
  }

  /**
   * Get quick actions data
   */
  async getQuickActions(): Promise<Array<{
    id: string
    title: string
    description: string
    icon: string
    path: string
    color: string
    count?: number
  }>> {
    return this.request('/quick-actions')
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.request(`/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    })
  }

  /**
   * Get dashboard widgets configuration
   */
  async getWidgetsConfig(): Promise<Array<{
    id: string
    title: string
    type: 'metric' | 'chart' | 'table' | 'status'
    position: { x: number; y: number; w: number; h: number }
    config: Record<string, any>
    enabled: boolean
  }>> {
    return this.request('/widgets')
  }

  /**
   * Update dashboard widgets configuration
   */
  async updateWidgetsConfig(
    widgets: Array<{
      id: string
      position: { x: number; y: number; w: number; h: number }
      enabled: boolean
    }>
  ): Promise<void> {
    await this.request('/widgets', {
      method: 'PUT',
      body: JSON.stringify({ widgets })
    })
  }

  /**
   * Export dashboard data
   */
  async exportData(
    format: 'csv' | 'excel' | 'json',
    options: TimeRangeOptions & {
      includeMetrics?: boolean
      includeEvents?: boolean
      includeAlerts?: boolean
    } = {}
  ): Promise<Blob> {
    const params = new URLSearchParams()

    params.append('format', format)

    if (options.timeRange) {
      params.append('timeRange', options.timeRange)
    }

    if (options.start) {
      params.append('startDate', options.start.toISOString())
    }

    if (options.end) {
      params.append('endDate', options.end.toISOString())
    }

    if (options.includeMetrics) {
      params.append('includeMetrics', 'true')
    }

    if (options.includeEvents) {
      params.append('includeEvents', 'true')
    }

    if (options.includeAlerts) {
      params.append('includeAlerts', 'true')
    }

    const response = await fetch(`${this.baseUrl}/export?${params.toString()}`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }

  /**
   * Get dashboard summary for specific time range
   */
  async getSummary(options: TimeRangeOptions = {}): Promise<{
    period: string
    metrics: {
      events: { total: number; growth: number }
      users: { total: number; growth: number }
      sessions: { total: number; growth: number }
      errors: { total: number; growth: number }
    }
    topActions: Array<{ action: string; count: number }>
    topPages: Array<{ page: string; count: number }>
    deviceBreakdown: Array<{ device: string; percentage: number }>
  }> {
    const params = new URLSearchParams()

    if (options.timeRange) {
      params.append('timeRange', options.timeRange)
    }

    if (options.start) {
      params.append('startDate', options.start.toISOString())
    }

    if (options.end) {
      params.append('endDate', options.end.toISOString())
    }

    const queryString = params.toString()
    const endpoint = `/summary${queryString ? `?${queryString}` : ''}`

    return this.request(endpoint)
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()

// Export types for use in components
export type {
  DashboardMetrics,
  CriticalAlert,
  TimeSeriesData,
  ProviderStatus,
  RealtimeStats
} from '@/modules/dashboard/types/dashboard.types'