import { alertsService } from './alerts.service'
import { analyticsService } from './analytics.service'
import { dashboardService } from './dashboard.service'
import { errorsService } from './errors.service'
import { eventsService } from './events.service'
import { integrationsService } from './integrations.service'
import { monitoringService } from './monitoring.service'
import { performanceService } from './performance.service'
import { reportsService } from './reports.service'

export { apiClient, ApiClient, ApiError } from './api-client'
export { authApi } from './auth-api'
export { dashboardService } from './dashboard.service'
export { analyticsService } from './analytics.service'
export { eventsService } from './events.service'
export { monitoringService } from './monitoring.service'
export { userJourneyService } from './user-journey.service'
export { errorsService } from './errors.service'
export { alertsService } from './alerts.service'
export { integrationsService } from './integrations.service'
export { performanceService } from './performance.service'
export { reportsService } from './reports.service'

// Export types for convenience
export type {
  // Analytics types
  AnalyticsFilters,
  MetricResult,
  TimeSeriesPoint,
  AnalyticsOverview,
  RealTimeData,
  RetentionAnalysis
} from './analytics.service'

export type {
  // Events types
  EventFilters,
  TrackingEvent,
  EventsResult,
  EventCorrelation
} from './events.service'

export type {
  // Monitoring types
  SystemHealthStatus,
  ProviderStatus,
  RealTimeEvent,
  PerformanceMetrics as MonitoringPerformanceMetrics,
  SLAIndicator
} from './monitoring.service'

export type {
  // User Journey types
  JourneyStep,
  FunnelConfig,
  FunnelAnalysis,
  UserJourney,
  PathAnalysis,
  CohortAnalysis
} from './user-journey.service'

export type {
  // Errors types
  ErrorFilters,
  ErrorOccurrence,
  ErrorGroup,
  ErrorTrends,
  ErrorInsight
} from './errors.service'

export type {
  // Alerts types
  AlertRule,
  AlertCondition,
  AlertChannel,
  AlertSchedule,
  AlertInstance,
  AlertFilters,
  AlertAnalytics
} from './alerts.service'

export type {
  // Integrations types
  Integration,
  IntegrationMetrics,
  IntegrationTest,
  IntegrationEvent,
  WebhookConfig
} from './integrations.service'

export type {
  // Performance types
  PerformanceMetrics,
  EndpointMetrics,
  SlowQuery,
  PerformanceAlert,
  PerformanceReport,
  LoadTestConfig,
  LoadTestResult
} from './performance.service'

export type {
  // Reports types
  ReportConfig,
  Report,
  ReportTemplate,
  ReportInsights,
  ReportAudit
} from './reports.service'

// Common interfaces for all services
export interface BaseFilters {
  startDate?: Date
  endDate?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'error' | 'offline'
  lastCheck: Date
  responseTime?: number
  uptime?: number
  version?: string
}

// Service status aggregator
export class ServicesStatus {
  static async checkAllServices(): Promise<Record<string, ServiceHealth>> {
    const services = {
      dashboard: dashboardService.getSystemHealth(),
      monitoring: monitoringService.getSystemHealth(),
      analytics: analyticsService.getRealTimeData(),
      events: eventsService.getEvents({ limit: 1 }),
      errors: errorsService.getErrorStats(),
      alerts: alertsService.getAlertMetrics(),
      integrations: integrationsService.getHealthSummary(),
      performance: performanceService.getPerformanceMetrics(),
      reports: reportsService.getReportAnalytics()
    }

    const results: Record<string, ServiceHealth> = {}
    const startTime = Date.now()

    for (const [serviceName, serviceCall] of Object.entries(services)) {
      try {
        await serviceCall
        results[serviceName] = {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime: Date.now() - startTime
        }
      } catch (error) {
        results[serviceName] = {
          status: 'error',
          lastCheck: new Date(),
          responseTime: Date.now() - startTime
        }
      }
    }

    return results
  }

  static getOverallHealth(services: Record<string, ServiceHealth>): ServiceHealth['status'] {
    const statuses = Object.values(services).map(s => s.status)

    if (statuses.includes('error')) return 'error'
    if (statuses.includes('warning')) return 'warning'
    if (statuses.includes('offline')) return 'offline'
    return 'healthy'
  }
}

// Export utility functions
export const serviceUtils = {
  formatTimeRange: (timeRange: string) => {
    const now = new Date()
    switch (timeRange) {
      case 'last_hour':
        return {
          start: new Date(now.getTime() - 60 * 60 * 1000),
          end: now
        }
      case 'last_24h':
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        }
      case 'last_7d':
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        }
      case 'last_30d':
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        }
      default:
        return { start: now, end: now }
    }
  },

  buildFilters: (baseFilters: BaseFilters, additionalFilters?: Record<string, any>) => {
    return {
      ...baseFilters,
      ...additionalFilters,
      startDate: baseFilters.startDate?.toISOString(),
      endDate: baseFilters.endDate?.toISOString()
    }
  },

  handleServiceError: (error: any, serviceName: string) => {
    console.error(`Error in ${serviceName} service:`, error)

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      `Service ${serviceName} unavailable`,
      'SERVICE_ERROR',
      error,
      new Date().toISOString()
    )
  }
}