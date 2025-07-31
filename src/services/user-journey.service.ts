import { apiClient } from './api-client'

export interface JourneyStep {
  id: string
  name: string
  category: string
  action: string
  order: number
  isConversion?: boolean
  isOptional?: boolean
}

export interface FunnelConfig {
  id: string
  name: string
  description?: string
  steps: JourneyStep[]
  timeWindow?: number // in minutes
  includeAnonymous?: boolean
}

export interface FunnelAnalysis {
  config: FunnelConfig
  analysis: {
    totalUsers: number
    period: { start: Date; end: Date }
    steps: Array<{
      step: JourneyStep
      users: number
      conversionRate: number
      dropoffRate: number
      avgTimeToNext?: number
      medianTimeToNext?: number
    }>
    overallConversionRate: number
    bottlenecks: Array<{
      stepIndex: number
      dropoffRate: number
      reasons?: string[]
    }>
  }
  segments?: Array<{
    name: string
    criteria: Record<string, any>
    conversionRate: number
    userCount: number
  }>
}

export interface UserJourney {
  userId: string
  sessions: Array<{
    sessionId: string
    startTime: Date
    endTime?: Date
    duration?: number
    events: Array<{
      id: string
      timestamp: Date
      category: string
      action: string
      label?: string
      data?: Record<string, any>
      stepIndex?: number
    }>
    conversions: number
    funnelProgress: Array<{
      funnelId: string
      completedSteps: number
      totalSteps: number
      status: 'in_progress' | 'completed' | 'abandoned'
    }>
  }>
  summary: {
    totalSessions: number
    totalEvents: number
    avgSessionDuration: number
    conversionRate: number
    lifetime: number // days since first event
    segments: string[]
    stage: 'new' | 'active' | 'returning' | 'churned'
  }
}

export interface PathAnalysis {
  totalUsers: number
  period: { start: Date; end: Date }
  paths: Array<{
    path: string[]
    userCount: number
    percentage: number
    avgDuration: number
    conversionRate: number
    exitPoints: Array<{
      step: string
      exitRate: number
    }>
  }>
  topPaths: {
    mostCommon: string[]
    mostSuccessful: string[]
    mostProblematic: string[]
  }
}

export interface CohortAnalysis {
  cohortType: 'acquisition' | 'behavioral'
  metric: 'retention' | 'revenue' | 'events'
  cohorts: Array<{
    cohort: string
    size: number
    periods: Array<{
      period: number
      value: number
      rate: number
    }>
  }>
  avgRetention: number[]
  insights: string[]
}

class UserJourneyService {
  private baseUrl = '/user-journey'

  /**
   * Get user journey by user ID
   */
  async getJourneyByUser(
    userId: string,
    options: {
      startDate?: Date
      endDate?: Date
      includeSessions?: boolean
    } = {}
  ): Promise<UserJourney> {
    return apiClient.get(`${this.baseUrl}/user/${userId}`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get multiple user journeys
   */
  async getJourneys(options: {
    userIds?: string[]
    segment?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    includeAnonymous?: boolean
  } = {}): Promise<{
    journeys: UserJourney[]
    totalCount: number
    summary: {
      avgSessionsPerUser: number
      avgEventsPerSession: number
      avgConversionRate: number
    }
  }> {
    return apiClient.get(this.baseUrl, {
      ...options,
      userIds: options.userIds?.join(','),
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get all funnel configurations
   */
  async getFunnels(): Promise<FunnelConfig[]> {
    return apiClient.get(`${this.baseUrl}/funnels`)
  }

  /**
   * Get specific funnel configuration
   */
  async getFunnel(funnelId: string): Promise<FunnelConfig> {
    return apiClient.get(`${this.baseUrl}/funnels/${funnelId}`)
  }

  /**
   * Create new funnel
   */
  async createFunnel(funnel: Omit<FunnelConfig, 'id'>): Promise<FunnelConfig> {
    return apiClient.post(`${this.baseUrl}/funnels`, funnel)
  }

  /**
   * Update funnel configuration
   */
  async updateFunnel(funnelId: string, updates: Partial<FunnelConfig>): Promise<FunnelConfig> {
    return apiClient.put(`${this.baseUrl}/funnels/${funnelId}`, updates)
  }

  /**
   * Delete funnel
   */
  async deleteFunnel(funnelId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/funnels/${funnelId}`)
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(
    funnelId: string,
    options: {
      startDate?: Date
      endDate?: Date
      segments?: string[]
      compareWith?: string // another funnel ID or period
    } = {}
  ): Promise<FunnelAnalysis> {
    return apiClient.get(`${this.baseUrl}/funnels/${funnelId}/analysis`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString(),
      segments: options.segments?.join(',')
    })
  }

  /**
   * Get conversion rates for all funnels
   */
  async getConversionRates(options: {
    startDate?: Date
    endDate?: Date
    groupBy?: 'day' | 'week' | 'month'
  } = {}): Promise<{
    period: { start: Date; end: Date }
    funnels: Array<{
      id: string
      name: string
      conversionRate: number
      totalUsers: number
      completedUsers: number
      trend: 'up' | 'down' | 'stable'
      changePercent: number
    }>
    overall: {
      avgConversionRate: number
      totalUsers: number
      totalCompletions: number
    }
  }> {
    return apiClient.get(`${this.baseUrl}/conversion-rates`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get path analysis
   */
  async getPathAnalysis(options: {
    startDate?: Date
    endDate?: Date
    maxPathLength?: number
    minUserCount?: number
    includeAnonymous?: boolean
  } = {}): Promise<PathAnalysis> {
    return apiClient.get(`${this.baseUrl}/paths`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(options: {
    cohortType?: 'acquisition' | 'behavioral'
    metric?: 'retention' | 'revenue' | 'events'
    startDate?: Date
    endDate?: Date
    cohortSize?: 'day' | 'week' | 'month'
    periods?: number
  } = {}): Promise<CohortAnalysis> {
    return apiClient.get(`${this.baseUrl}/cohorts`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get user segments based on journey behavior
   */
  async getUserSegments(): Promise<Array<{
    id: string
    name: string
    description: string
    criteria: Record<string, any>
    userCount: number
    characteristics: {
      avgSessionDuration: number
      avgEventsPerSession: number
      conversionRate: number
      churnRate: number
    }
  }>> {
    return apiClient.get(`${this.baseUrl}/segments`)
  }

  /**
   * Create user segment
   */
  async createUserSegment(segment: {
    name: string
    description?: string
    criteria: Record<string, any>
  }): Promise<{ id: string }> {
    return apiClient.post(`${this.baseUrl}/segments`, segment)
  }

  /**
   * Get attribution analysis
   */
  async getAttributionAnalysis(options: {
    model?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay'
    startDate?: Date
    endDate?: Date
    conversionEvent?: string
  } = {}): Promise<{
    model: string
    conversions: number
    channels: Array<{
      channel: string
      conversions: number
      attribution: number
      percentage: number
    }>
    touchpoints: Array<{
      channel: string
      position: 'first' | 'middle' | 'last'
      conversions: number
      attribution: number
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/attribution`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Export journey data
   */
  async exportJourneyData(
    format: 'csv' | 'json',
    options: {
      userIds?: string[]
      funnelId?: string
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...options,
      userIds: options.userIds?.join(','),
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get journey insights and recommendations
   */
  async getInsights(options: {
    funnelId?: string
    period?: 'week' | 'month' | 'quarter'
  } = {}): Promise<{
    insights: Array<{
      type: 'optimization' | 'warning' | 'opportunity'
      title: string
      description: string
      impact: 'low' | 'medium' | 'high'
      effort: 'low' | 'medium' | 'high'
      recommendation: string
      data?: Record<string, any>
    }>
    summary: {
      totalInsights: number
      highImpact: number
      quickWins: number
    }
  }> {
    return apiClient.get(`${this.baseUrl}/insights`, options)
  }
}

export const userJourneyService = new UserJourneyService()