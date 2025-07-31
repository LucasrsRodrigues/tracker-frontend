export { apiClient, ApiClient, ApiError } from './api-client'
export { authApi } from './auth-api'
export { dashboardService } from './dashboard.service'

// Analytics Services
export type { MetricsService } from '../modules/analytics/services/metrics.service'

// Events Services
export interface EventsService {
  getEvents(filters?: any): Promise<any[]>
  getEventById(id: string): Promise<any>
  getEventsBySession(sessionId: string): Promise<any[]>
  getEventsByUser(userId: string): Promise<any[]>
}

// Monitoring Services
export interface MonitoringService {
  getRealTimeEvents(): Promise<any[]>
  getSystemHealth(): Promise<any>
  getProviderStatus(): Promise<any[]>
}

// User Journey Services  
export interface UserJourneyService {
  getJourneyByUser(userId: string): Promise<any>
  getFunnelAnalysis(funnelId: string): Promise<any>
  getConversionRates(): Promise<any>
}

// Errors Services
export interface ErrorsService {
  getErrors(filters?: any): Promise<any[]>
  getErrorById(id: string): Promise<any>
  getErrorTrends(): Promise<any>
}

// Alerts Services
export interface AlertsService {
  getAlerts(filters?: any): Promise<any[]>
  createAlert(alert: any): Promise<any>
  updateAlert(id: string, alert: any): Promise<any>
  deleteAlert(id: string): Promise<void>
}

// Integrations Services
export interface IntegrationsService {
  getIntegrations(): Promise<any[]>
  getIntegrationById(id: string): Promise<any>
  testIntegration(id: string): Promise<any>
}

// Performance Services
export interface PerformanceService {
  getPerformanceMetrics(): Promise<any>
  getEndpointMetrics(): Promise<any[]>
  getSlowQueries(): Promise<any[]>
}

// Reports Services
export interface ReportsService {
  getReports(): Promise<any[]>
  generateReport(config: any): Promise<any>
  scheduleReport(config: any): Promise<any>
  downloadReport(id: string, format: string): Promise<Blob>
}