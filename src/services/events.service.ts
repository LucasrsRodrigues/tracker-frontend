import { apiClient } from './api-client'

export interface EventFilters {
  startDate?: Date
  endDate?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
  category?: string
  action?: string
  userId?: string
  sessionId?: string
  traceId?: string
  provider?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'timestamp' | 'category' | 'action' | 'userId'
  sortOrder?: 'asc' | 'desc'
}

export interface TrackingEvent {
  id: string
  timestamp: Date
  userId?: string
  sessionId: string
  traceId?: string
  category: 'user' | 'system' | 'business' | 'integration'
  action: string
  label?: string
  data: Record<string, any>
  context: {
    ip: string
    userAgent: string
    referer?: string
    appVersion: string
    platform: string
    device?: {
      type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
      os?: string
      browser?: string
      version?: string
    }
    location?: {
      country?: string
      region?: string
      city?: string
      timezone?: string
    }
  }
  metadata?: {
    duration?: number
    errorCode?: string
    provider?: string
    endpoint?: string
  }
}

export interface EventsResult {
  events: TrackingEvent[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  filters: EventFilters
}

export interface EventCorrelation {
  event: TrackingEvent
  relatedEvents: TrackingEvent[]
  userJourney: TrackingEvent[]
  sessionEvents: TrackingEvent[]
}

class EventsService {
  private baseUrl = '/events'

  /**
   * Get events with filtering and pagination
   */
  async getEvents(filters: EventFilters = {}): Promise<EventsResult> {
    return apiClient.get(this.baseUrl, {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    })
  }

  /**
   * Get a specific event by ID
   */
  async getEventById(id: string): Promise<TrackingEvent> {
    return apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Get events by session ID
   */
  async getEventsBySession(sessionId: string): Promise<TrackingEvent[]> {
    return apiClient.get(`${this.baseUrl}/session/${sessionId}`)
  }

  /**
   * Get events by user ID
   */
  async getEventsByUser(userId: string, filters: Partial<EventFilters> = {}): Promise<EventsResult> {
    return apiClient.get(`${this.baseUrl}/user/${userId}`, filters)
  }

  /**
   * Get events by trace ID for correlation
   */
  async getEventsByTrace(traceId: string): Promise<TrackingEvent[]> {
    return apiClient.get(`${this.baseUrl}/trace/${traceId}`)
  }

  /**
   * Get event correlation data
   */
  async getEventCorrelation(eventId: string): Promise<EventCorrelation> {
    return apiClient.get(`${this.baseUrl}/${eventId}/correlation`)
  }

  /**
   * Get event statistics
   */
  async getEventStats(filters: EventFilters = {}): Promise<{
    totalEvents: number
    categoriesBreakdown: Array<{ category: string; count: number; percentage: number }>
    actionsBreakdown: Array<{ action: string; count: number; percentage: number }>
    providersBreakdown: Array<{ provider: string; count: number; percentage: number }>
    hourlyDistribution: Array<{ hour: number; count: number }>
    topUsers: Array<{ userId: string; eventCount: number }>
    topSessions: Array<{ sessionId: string; eventCount: number; duration?: number }>
  }> {
    return apiClient.get(`${this.baseUrl}/stats`, {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    })
  }

  /**
   * Search events with advanced criteria
   */
  async searchEvents(query: {
    text?: string
    filters?: EventFilters
    facets?: string[]
    highlight?: boolean
  }): Promise<{
    events: TrackingEvent[]
    totalCount: number
    facets?: Record<string, Array<{ value: string; count: number }>>
    suggestions?: string[]
  }> {
    return apiClient.post(`${this.baseUrl}/search`, query)
  }

  /**
   * Get event timeline for a user session
   */
  async getSessionTimeline(sessionId: string): Promise<{
    sessionId: string
    userId?: string
    startTime: Date
    endTime?: Date
    duration?: number
    events: Array<TrackingEvent & {
      relativeTime: number
      deltaFromPrevious?: number
    }>
    summary: {
      totalEvents: number
      categories: string[]
      actions: string[]
      errors: number
      conversions: number
    }
  }> {
    return apiClient.get(`${this.baseUrl}/timeline/session/${sessionId}`)
  }

  /**
   * Get user journey across multiple sessions
   */
  async getUserJourney(userId: string, options: {
    startDate?: Date
    endDate?: Date
    limit?: number
  } = {}): Promise<{
    userId: string
    sessions: Array<{
      sessionId: string
      startTime: Date
      endTime?: Date
      duration?: number
      eventCount: number
      conversions: number
      errors: number
      keyEvents: TrackingEvent[]
    }>
    summary: {
      totalSessions: number
      totalEvents: number
      avgSessionDuration: number
      conversionRate: number
      errorRate: number
      firstSeen: Date
      lastSeen: Date
    }
  }> {
    return apiClient.get(`${this.baseUrl}/journey/user/${userId}`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString(),
    })
  }

  /**
   * Create a new event (for testing or manual tracking)
   */
  async createEvent(event: Omit<TrackingEvent, 'id' | 'timestamp'>): Promise<TrackingEvent> {
    return apiClient.post(this.baseUrl, event)
  }

  /**
   * Batch create events
   */
  async createEvents(events: Array<Omit<TrackingEvent, 'id' | 'timestamp'>>): Promise<{
    created: number
    failed: number
    errors?: Array<{ index: number; error: string }>
  }> {
    return apiClient.post(`${this.baseUrl}/batch`, { events })
  }

  /**
   * Delete events (admin only)
   */
  async deleteEvents(filters: EventFilters): Promise<{
    deletedCount: number
  }> {
    return apiClient.delete(this.baseUrl, {
      body: JSON.stringify(filters)
    })
  }

  /**
   * Export events
   */
  async exportEvents(
    format: 'csv' | 'json' | 'xlsx',
    filters: EventFilters = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    })
  }

  /**
   * Get event schema and validation info
   */
  async getEventSchema(): Promise<{
    categories: Array<{
      name: string
      description: string
      actions: string[]
      requiredFields: string[]
      optionalFields: string[]
    }>
    validation: {
      rules: Array<{
        field: string
        type: string
        required: boolean
        constraints?: Record<string, any>
      }>
    }
  }> {
    return apiClient.get(`${this.baseUrl}/schema`)
  }

  /**
   * Validate event before creation
   */
  async validateEvent(event: Partial<TrackingEvent>): Promise<{
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
    return apiClient.post(`${this.baseUrl}/validate`, event)
  }
}

export const eventsService = new EventsService()