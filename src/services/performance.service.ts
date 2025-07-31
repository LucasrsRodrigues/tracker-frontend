import { apiClient } from './api-client'

export interface PerformanceMetrics {
  timestamp: Date
  system: {
    cpu: {
      usage: number
      cores: number
      loadAverage: number[]
    }
    memory: {
      used: number
      total: number
      usage: number
      available: number
    }
    disk: {
      used: number
      total: number
      usage: number
      iops: number
    }
    network: {
      inbound: number
      outbound: number
      connections: number
    }
  }
  application: {
    responseTime: {
      avg: number
      min: number
      max: number
      p50: number
      p95: number
      p99: number
    }
    throughput: {
      requestsPerSecond: number
      requestsPerMinute: number
      requestsPerHour: number
    }
    errors: {
      rate: number
      count: number
      types: Record<string, number>
    }
    activeConnections: number
    queueDepth: number
    threadPool: {
      active: number
      idle: number
      max: number
    }
  }
  database: {
    connections: {
      active: number
      idle: number
      max: number
    }
    queries: {
      total: number
      slow: number
      avgDuration: number
      p95Duration: number
    }
    cache: {
      hitRate: number
      missRate: number
      size: number
    }
    locks: {
      waiting: number
      deadlocks: number
    }
  }
  cache: {
    redis?: {
      memory: number
      hitRate: number
      operations: number
      connectedClients: number
    }
    memcached?: {
      memory: number
      hitRate: number
      operations: number
    }
  }
  external: {
    providerLatency: Record<string, number>
    providerErrors: Record<string, number>
    apiCallsPerMinute: number
  }
}

export interface EndpointMetrics {
  endpoint: string
  method: string
  metrics: {
    requestCount: number
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    errorCount: number
    successRate: number
    throughput: number
  }
  errors: Array<{
    statusCode: number
    count: number
    percentage: number
    lastOccurrence: Date
  }>
  trends: {
    responseTime: 'improving' | 'stable' | 'degrading'
    errorRate: 'improving' | 'stable' | 'degrading'
    throughput: 'increasing' | 'stable' | 'decreasing'
  }
  lastUpdated: Date
}

export interface SlowQuery {
  id: string
  query: string
  duration: number
  database: string
  table?: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER'
  executionPlan?: string
  parameters?: Record<string, any>
  timestamp: Date
  frequency: number
  affectedRows?: number
  suggestion?: string
}

export interface PerformanceAlert {
  id: string
  type: 'threshold_breach' | 'anomaly' | 'trend' | 'prediction'
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  description: string
  currentValue: number
  threshold?: number
  expectedValue?: number
  timestamp: Date
  duration?: number
  status: 'active' | 'resolved'
  suggestions: string[]
  affectedComponents: string[]
}

export interface PerformanceReport {
  period: { start: Date; end: Date }
  summary: {
    avgResponseTime: number
    totalRequests: number
    errorRate: number
    uptime: number
    peakThroughput: number
    slowestEndpoint: string
    resourceUtilization: {
      cpu: number
      memory: number
      disk: number
    }
  }
  trends: {
    responseTime: Array<{ timestamp: Date; value: number }>
    throughput: Array<{ timestamp: Date; value: number }>
    errorRate: Array<{ timestamp: Date; value: number }>
    resourceUsage: Array<{
      timestamp: Date
      cpu: number
      memory: number
      disk: number
    }>
  }
  topEndpoints: {
    byTraffic: EndpointMetrics[]
    byLatency: EndpointMetrics[]
    byErrors: EndpointMetrics[]
  }
  slowQueries: SlowQuery[]
  incidents: Array<{
    timestamp: Date
    type: string
    duration: number
    impact: string
    resolution?: string
  }>
  recommendations: Array<{
    category: 'optimization' | 'scaling' | 'configuration'
    priority: 'low' | 'medium' | 'high'
    title: string
    description: string
    estimatedImpact: string
  }>
}

export interface LoadTestConfig {
  name: string
  description?: string
  duration: number // seconds
  concurrency: number
  rampUp?: number // seconds
  targets: Array<{
    endpoint: string
    method: string
    weight: number
    headers?: Record<string, string>
    body?: any
  }>
  thresholds: {
    avgResponseTime?: number
    p95ResponseTime?: number
    errorRate?: number
    throughput?: number
  }
}

export interface LoadTestResult {
  id: string
  config: LoadTestConfig
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  duration: number
  summary: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    maxResponseTime: number
    minResponseTime: number
    throughput: number
    errorRate: number
  }
  thresholdResults: Array<{
    metric: string
    threshold: number
    actual: number
    passed: boolean
  }>
  timeline: Array<{
    timestamp: Date
    responseTime: number
    throughput: number
    errors: number
    activeUsers: number
  }>
  endpoints: Array<{
    endpoint: string
    method: string
    requests: number
    avgResponseTime: number
    errorRate: number
  }>
  errors: Array<{
    error: string
    count: number
    percentage: number
    examples: Array<{
      timestamp: Date
      statusCode?: number
      message: string
    }>
  }>
}

class PerformanceService {
  private baseUrl = '/performance'

  /**
   * Get current performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return apiClient.get(`${this.baseUrl}/metrics`)
  }

  /**
   * Get historical performance metrics
   */
  async getMetricsHistory(options: {
    startDate?: Date
    endDate?: Date
    interval?: 'minute' | 'hour' | 'day'
    metrics?: string[]
  } = {}): Promise<PerformanceMetrics[]> {
    return apiClient.get(`${this.baseUrl}/metrics/history`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString(),
      metrics: options.metrics?.join(',')
    })
  }

  /**
   * Get endpoint performance metrics
   */
  async getEndpointMetrics(options: {
    startDate?: Date
    endDate?: Date
    endpoint?: string
    method?: string
    sortBy?: 'requests' | 'responseTime' | 'errorRate'
    limit?: number
  } = {}): Promise<EndpointMetrics[]> {
    return apiClient.get(`${this.baseUrl}/endpoints`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get specific endpoint metrics
   */
  async getEndpointDetails(endpoint: string, method: string, options: {
    startDate?: Date
    endDate?: Date
    interval?: 'minute' | 'hour' | 'day'
  } = {}): Promise<{
    endpoint: EndpointMetrics
    timeline: Array<{
      timestamp: Date
      responseTime: number
      requests: number
      errors: number
    }>
    recentErrors: Array<{
      timestamp: Date
      statusCode: number
      message: string
      traceId?: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/endpoints/${encodeURIComponent(endpoint)}/${method}`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(options: {
    startDate?: Date
    endDate?: Date
    database?: string
    minDuration?: number
    limit?: number
    sortBy?: 'duration' | 'frequency' | 'timestamp'
  } = {}): Promise<SlowQuery[]> {
    return apiClient.get(`${this.baseUrl}/queries/slow`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get query analysis
   */
  async getQueryAnalysis(queryId: string): Promise<{
    query: SlowQuery
    analysis: {
      complexity: 'low' | 'medium' | 'high'
      indexUsage: Array<{
        table: string
        index: string
        used: boolean
        suggestion?: string
      }>
      tableStats: Array<{
        table: string
        rows: number
        size: number
        indexes: number
      }>
      optimizationSuggestions: Array<{
        type: 'index' | 'query_rewrite' | 'schema_change'
        description: string
        estimatedImprovement: string
      }>
    }
    history: Array<{
      timestamp: Date
      duration: number
      executionPlan?: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/queries/${queryId}/analysis`)
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(options: {
    status?: 'active' | 'resolved'
    severity?: string[]
    type?: string[]
    limit?: number
  } = {}): Promise<PerformanceAlert[]> {
    return apiClient.get(`${this.baseUrl}/alerts`, {
      ...options,
      severity: options.severity?.join(','),
      type: options.type?.join(',')
    })
  }

  /**
   * Acknowledge performance alert
   */
  async acknowledgeAlert(alertId: string, note?: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/alerts/${alertId}/acknowledge`, { note })
  }

  /**
   * Generate performance report
   */
  async generateReport(options: {
    startDate: Date
    endDate: Date
    includeRecommendations?: boolean
    format?: 'json' | 'pdf' | 'excel'
  }): Promise<PerformanceReport | Blob> {
    if (options.format && options.format !== 'json') {
      return apiClient.download(`${this.baseUrl}/reports`, {
        ...options,
        startDate: options.startDate.toISOString(),
        endDate: options.endDate.toISOString()
      })
    }

    return apiClient.get(`${this.baseUrl}/reports`, {
      ...options,
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString()
    })
  }

  /**
   * Create load test
   */
  async createLoadTest(config: LoadTestConfig): Promise<{ id: string }> {
    return apiClient.post(`${this.baseUrl}/load-tests`, config)
  }

  /**
   * Start load test
   */
  async startLoadTest(testId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/load-tests/${testId}/start`)
  }

  /**
   * Stop load test
   */
  async stopLoadTest(testId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/load-tests/${testId}/stop`)
  }

  /**
   * Get load test results
   */
  async getLoadTestResult(testId: string): Promise<LoadTestResult> {
    return apiClient.get(`${this.baseUrl}/load-tests/${testId}`)
  }

  /**
   * Get load test history
   */
  async getLoadTestHistory(options: {
    status?: string
    limit?: number
  } = {}): Promise<Array<{
    id: string
    name: string
    status: string
    startedAt: Date
    duration?: number
    summary?: {
      totalRequests: number
      avgResponseTime: number
      errorRate: number
    }
  }>> {
    return apiClient.get(`${this.baseUrl}/load-tests`, options)
  }

  /**
   * Get performance baselines
   */
  async getBaselines(): Promise<Array<{
    metric: string
    baseline: number
    current: number
    threshold: number
    status: 'normal' | 'warning' | 'critical'
    lastUpdated: Date
  }>> {
    return apiClient.get(`${this.baseUrl}/baselines`)
  }

  /**
   * Update performance baseline
   */
  async updateBaseline(metric: string, value: number): Promise<void> {
    return apiClient.put(`${this.baseUrl}/baselines/${metric}`, { value })
  }

  /**
   * Get capacity planning data
   */
  async getCapacityPlanning(options: {
    metric: 'cpu' | 'memory' | 'disk' | 'throughput'
    period: 'week' | 'month' | 'quarter'
    growthRate?: number
  }): Promise<{
    current: number
    predicted: Array<{
      date: Date
      value: number
      confidence: number
    }>
    recommendations: Array<{
      action: string
      timeframe: string
      impact: string
      cost?: string
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/capacity-planning`, options)
  }

  /**
   * Get performance optimization suggestions
   */
  async getOptimizationSuggestions(): Promise<Array<{
    category: 'database' | 'application' | 'infrastructure' | 'caching'
    priority: 'low' | 'medium' | 'high'
    title: string
    description: string
    impact: string
    effort: string
    implementation: string[]
    metrics: Record<string, number>
  }>> {
    return apiClient.get(`${this.baseUrl}/optimizations`)
  }

  /**
   * Export performance data
   */
  async exportPerformanceData(
    format: 'csv' | 'json' | 'xlsx',
    options: {
      startDate?: Date
      endDate?: Date
      metrics?: string[]
      includeEndpoints?: boolean
      includeQueries?: boolean
    } = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString(),
      metrics: options.metrics?.join(',')
    })
  }
}

export const performanceService = new PerformanceService()