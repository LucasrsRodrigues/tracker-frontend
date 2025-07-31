import { apiClient } from './api-client'

export interface ErrorFilters {
  startDate?: Date
  endDate?: Date
  timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
  severity?: ('low' | 'medium' | 'high' | 'critical')[]
  status?: ('new' | 'investigating' | 'resolved' | 'ignored')[]
  providers?: string[]
  categories?: string[]
  search?: string
  groupId?: string
  userId?: string
  sessionId?: string
  page?: number
  limit?: number
  sortBy?: 'timestamp' | 'severity' | 'count' | 'lastSeen'
  sortOrder?: 'asc' | 'desc'
}

export interface ErrorOccurrence {
  id: string
  groupId: string
  timestamp: Date
  message: string
  stack?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  provider?: string
  endpoint?: string
  userId?: string
  sessionId?: string
  traceId?: string
  context: {
    userAgent?: string
    ip?: string
    url?: string
    referer?: string
    version?: string
    environment?: string
    [key: string]: any
  }
  metadata?: {
    httpStatus?: number
    requestId?: string
    duration?: number
    [key: string]: any
  }
  fingerprint: string
  resolved: boolean
  assignee?: string
  tags: string[]
}

export interface ErrorGroup {
  id: string
  title: string
  message: string
  fingerprint: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'investigating' | 'resolved' | 'ignored'
  provider?: string
  firstSeen: Date
  lastSeen: Date
  count: number
  userCount: number
  sessionCount: number
  trend: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
  assignee?: {
    id: string
    name: string
    email: string
  }
  tags: string[]
  stackTrace?: {
    frames: Array<{
      filename: string
      function: string
      lineno: number
      colno?: number
      context?: string[]
    }>
    formatted: string
  }
  recentOccurrences: ErrorOccurrence[]
}

export interface ErrorTrends {
  period: { start: Date; end: Date }
  overall: {
    totalErrors: number
    newErrors: number
    resolvedErrors: number
    errorRate: number
    trend: {
      direction: 'up' | 'down' | 'stable'
      percentage: number
    }
  }
  byTime: Array<{
    timestamp: Date
    count: number
    newGroups: number
  }>
  bySeverity: Array<{
    severity: string
    count: number
    percentage: number
    trend: number
  }>
  byProvider: Array<{
    provider: string
    count: number
    percentage: number
    errorRate: number
  }>
  byCategory: Array<{
    category: string
    count: number
    percentage: number
  }>
}

export interface ErrorInsight {
  type: 'spike' | 'new_error' | 'regression' | 'improvement'
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  affectedUsers: number
  data: Record<string, any>
  recommendations?: string[]
  createdAt: Date
}

class ErrorsService {
  private baseUrl = '/errors'

  /**
   * Get error groups with filtering
   */
  async getErrors(filters: ErrorFilters = {}): Promise<{
    groups: ErrorGroup[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
  }> {
    return apiClient.get(this.baseUrl, {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      severity: filters.severity?.join(','),
      status: filters.status?.join(','),
      providers: filters.providers?.join(','),
      categories: filters.categories?.join(',')
    })
  }

  /**
   * Get specific error group by ID
   */
  async getErrorById(id: string): Promise<ErrorGroup> {
    return apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Get error occurrences for a group
   */
  async getErrorOccurrences(
    groupId: string,
    options: {
      page?: number
      limit?: number
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<{
    occurrences: ErrorOccurrence[]
    totalCount: number
    page: number
    limit: number
  }> {
    return apiClient.get(`${this.baseUrl}/${groupId}/occurrences`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString()
    })
  }

  /**
   * Get error trends and analytics
   */
  async getErrorTrends(filters: {
    startDate?: Date
    endDate?: Date
    timeRange?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d'
    interval?: 'minute' | 'hour' | 'day'
    providers?: string[]
  } = {}): Promise<ErrorTrends> {
    return apiClient.get(`${this.baseUrl}/trends`, {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      providers: filters.providers?.join(',')
    })
  }

  /**
   * Update error group status
   */
  async updateErrorStatus(
    groupId: string,
    status: 'new' | 'investigating' | 'resolved' | 'ignored',
    options: {
      assignee?: string
      note?: string
      resolution?: string
    } = {}
  ): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/${groupId}/status`, {
      status,
      ...options
    })
  }

  /**
   * Assign error group to user
   */
  async assignError(groupId: string, assigneeId: string, note?: string): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/${groupId}/assign`, {
      assigneeId,
      note
    })
  }

  /**
   * Add tags to error group
   */
  async addTags(groupId: string, tags: string[]): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${groupId}/tags`, { tags })
  }

  /**
   * Remove tags from error group
   */
  async removeTags(groupId: string, tags: string[]): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${groupId}/tags`, {
      body: JSON.stringify({ tags })
    })
  }

  /**
   * Merge error groups
   */
  async mergeErrors(primaryGroupId: string, secondaryGroupIds: string[]): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${primaryGroupId}/merge`, {
      secondaryGroupIds
    })
  }

  /**
   * Split error group
   */
  async splitError(
    groupId: string,
    criteria: {
      field: string
      operator: 'equals' | 'contains' | 'regex'
      value: string
    }
  ): Promise<{ newGroupId: string }> {
    return apiClient.post(`${this.baseUrl}/${groupId}/split`, criteria)
  }

  /**
   * Create custom error group
   */
  async createErrorGroup(group: {
    title: string
    message: string
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    fingerprint?: string
    tags?: string[]
  }): Promise<{ id: string }> {
    return apiClient.post(this.baseUrl, group)
  }

  /**
   * Delete error group (and all occurrences)
   */
  async deleteErrorGroup(groupId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${groupId}`)
  }

  /**
   * Get error insights and anomalies
   */
  async getErrorInsights(options: {
    startDate?: Date
    endDate?: Date
    providers?: string[]
  } = {}): Promise<ErrorInsight[]> {
    return apiClient.get(`${this.baseUrl}/insights`, {
      ...options,
      startDate: options.startDate?.toISOString(),
      endDate: options.endDate?.toISOString(),
      providers: options.providers?.join(',')
    })
  }

  /**
   * Get error statistics
   */
  async getErrorStats(filters: ErrorFilters = {}): Promise<{
    totalErrors: number
    totalGroups: number
    newErrors24h: number
    resolvedErrors24h: number
    errorRate: number
    avgResolutionTime: number
    topCategories: Array<{
      category: string
      count: number
      percentage: number
    }>
    topProviders: Array<{
      provider: string
      count: number
      errorRate: number
    }>
    severityDistribution: Array<{
      severity: string
      count: number
      percentage: number
    }>
    statusDistribution: Array<{
      status: string
      count: number
      percentage: number
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/stats`, {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString()
    })
  }

  /**
   * Search errors
   */
  async searchErrors(query: {
    text: string
    filters?: ErrorFilters
    fuzzy?: boolean
  }): Promise<{
    groups: ErrorGroup[]
    totalCount: number
    suggestions: string[]
    facets: Record<string, Array<{ value: string; count: number }>>
  }> {
    return apiClient.post(`${this.baseUrl}/search`, query)
  }

  /**
   * Get similar errors
   */
  async getSimilarErrors(groupId: string, limit: number = 10): Promise<{
    similar: Array<{
      group: ErrorGroup
      similarity: number
      reasons: string[]
    }>
  }> {
    return apiClient.get(`${this.baseUrl}/${groupId}/similar`, { limit })
  }

  /**
   * Export error data
   */
  async exportErrors(
    format: 'csv' | 'json' | 'xlsx',
    filters: ErrorFilters = {}
  ): Promise<Blob> {
    return apiClient.download(`${this.baseUrl}/export`, {
      format,
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString()
    })
  }

  /**
   * Get error sampling rules
   */
  async getSamplingRules(): Promise<Array<{
    id: string
    name: string
    enabled: boolean
    criteria: Record<string, any>
    sampleRate: number
    priority: number
  }>> {
    return apiClient.get(`${this.baseUrl}/sampling-rules`)
  }

  /**
   * Update error sampling rules
   */
  async updateSamplingRules(rules: Array<{
    id?: string
    name: string
    enabled: boolean
    criteria: Record<string, any>
    sampleRate: number
    priority: number
  }>): Promise<void> {
    return apiClient.put(`${this.baseUrl}/sampling-rules`, { rules })
  }

  /**
   * Test error sampling
   */
  async testSampling(errorData: Partial<ErrorOccurrence>): Promise<{
    shouldSample: boolean
    appliedRule?: string
    sampleRate: number
  }> {
    return apiClient.post(`${this.baseUrl}/test-sampling`, errorData)
  }
}

export const errorsService = new ErrorsService()