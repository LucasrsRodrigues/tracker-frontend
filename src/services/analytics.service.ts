import { apiClient } from './api-client'

export interface AnalyticsFilters {
  startDate?: Date
  endDate?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
  categories?: string[]
  actions?: string[]
  userId?: string
  sessionId?: string
  providers?: string[]
  deviceTypes?: string[]
  page?: number
  limit?: number
  groupBy?: string[]
  interval?: 'minute' | 'hour' | 'day' | 'week' | 'month'
}

export interface MetricResult {
  name: string
  value: number
  previousValue?: number
  trend?: 'up' | 'down' | 'neutral'
  change?: number
  changePercentage?: number
}

export interface TimeSeriesPoint {
  timestamp: Date
  value: number
  label?: string
  metadata?: Record<string, any>
}

export interface AnalyticsOverview {
  period: string
  totalEvents: number
  uniqueUsers: number
  totalSessions: number
  avgEventsPerUser: number
  avgEventsPerSession: number
  errorRate: number
  conversionRate: number
  topActions: Array<{ action: string; count: number; percentage: number }>
  topPages: Array<{ page: string; count: number; percentage: number }>
  deviceBreakdown: Array<{ device: string; count: number; percentage: number }>
  providerBreakdown: Array<{ provider: string; count: number; percentage: number }>
  generatedAt: string
}

export interface RealTimeData {
  timestamp: string
  recentEvents: number
  activeUsers: number
  currentErrors: number
  eventsPerMinute: number[]
  topPages: Array<{ page: string; count: number }>
}

export interface RetentionAnalysis {
  cohortDate: string
  periods: number[]
  cohorts: Array<{
    period: string
    totalUsers: number
    retainedUsers: number[]
    retentionRates: number[]
  }>
}

class AnalyticsService {
  private baseUrl = '/analytics'

  /**
   * Get analytics overview
   */
  async getOverview(filters: AnalyticsFilters = {}): Promise<AnalyticsOverview> {
    return apiClient.get(`${this.baseUrl}/overview`, filters)
  }

  /**
   * Get specific metrics
   */
  async getMetrics(filters: AnalyticsFilters = {}): Promise<MetricResult[]> {
    return apiClient.get(`${this.baseUrl}/metrics`, filters)
  }

  /**
   * Get time series data
   */
  async getTimeSeries(
    metric: string,
    filters: AnalyticsFilters = {}
  ): Promise<TimeSeriesPoint[]> {
    return apiClient.get(`${this.baseUrl}/timeseries`, {
      metric,
      ...filters
    })
  }

  /**
   * Get events with filtering
   */
  async getEvents(filters: AnalyticsFilters = {}): Promise<{
    events: any[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
  }> {
    return apiClient.get(`${this.baseUrl}/events`, filters)
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeData(): Promise<RealTimeData> {
    return apiClient.get(`${this.baseUrl}/real-time`)
  }

  /**
   * Get aggregated data
   */
  async getAggregation(filters: AnalyticsFilters = {}): Promise<{
    aggregations: Array<{
      key: string
      value: number
      breakdown?: Record<string, number>
    }>
    timeRange: { start: Date; end: Date }
  }> {
    return apiClient.get(`${this.baseUrl}/aggregation`, filters)
  }

  /**
   * Get user retention analysis
   */
  async getRetention(filters: {
    cohortDate?: Date
    periods?: number[]
    metric?: string
  } = {}): Promise<RetentionAnalysis> {
    const params = {
      cohortDate: filters.cohortDate?.toISOString(),
      periods: filters.periods?.join(','),
      metric: filters.metric
    }
    return apiClient.get(`${this.baseUrl}/retention`, params)
  }

  /**
   * Get cohort analysis
   */
  async getCohorts(filters: AnalyticsFilters = {}): Promise<{
    cohorts: Array<{
      cohort: string
      size: number
      periods: Array<{
        period: number
        users: number
        rate: number
      }>
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/cohorts`, filters)
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(steps: string[], filters: AnalyticsFilters = {}): Promise<{
    funnel: Array<{
      step: string
      users: number
      conversionRate: number
      dropoffRate: number
    }>
    totalUsers: number
    overallConversionRate: number
  }> {
    return apiClient.post(`${this.baseUrl}/funnel`, {
      steps,
      ...filters
    })
  }

  /**
   * Get user segments
   */
  async getUserSegments(filters: AnalyticsFilters = {}): Promise<{
    segments: Array<{
      name: string
      criteria: Record<string, any>
      userCount: number
      percentage: number
      avgEventsPerUser: number
      conversionRate: number
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/segments`, filters)
  }

  /**
   * Export analytics data
   */
  async exportData(
    format: 'csv' | 'excel' | 'json',
    filters: AnalyticsFilters = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...filters
    })
  }

  /**
   * Get custom dashboard data
   */
  async getDashboardData(dashboardId: string): Promise<{
    widgets: Array<{
      id: string
      type: string
      data: any
      config: Record<string, any>
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/dashboards/${dashboardId}`)
  }

  /**
   * Save custom dashboard configuration
   */
  async saveDashboard(config: {
    name: string
    description?: string
    widgets: Array<{
      type: string
      config: Record<string, any>
      position: { x: number; y: number; w: number; h: number }
    }>
  }): Promise<{ id: string }> {
    return apiClient.post(`${this.baseUrl}/dashboards`, config)
  }
}

export const analyticsService = new AnalyticsService()