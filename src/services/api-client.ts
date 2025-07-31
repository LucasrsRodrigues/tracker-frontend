// src/services/api-client.ts
import { APP_CONFIG } from '@/lib/constants'

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  timestamp: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  message: string
  code?: string | number
  details?: any
  timestamp: string
}

export interface RequestOptions extends RequestInit {
  timeout?: number
  useAuth?: boolean
  retries?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout: number

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || APP_CONFIG.api.baseUrl
    this.defaultTimeout = APP_CONFIG.api.timeout
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('tracking-auth-token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  /**
   * Get default headers
   */
  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Handle request with timeout and retries
   */
  private async makeRequest<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      useAuth = true,
      retries = 0,
      headers: customHeaders = {},
      ...fetchOptions
    } = options

    const headers = {
      ...this.getDefaultHeaders(),
      ...(useAuth && this.getAuthHeaders()),
      ...customHeaders,
    }

    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle different response types
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response)
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData,
            new Date().toISOString()
          )
        }

        // Handle successful response
        const result = await this.parseSuccessResponse<T>(response)
        return result

      } catch (error) {
        clearTimeout(timeoutId)
        lastError = error as Error

        // Don't retry on authentication errors or client errors (4xx)
        if (error instanceof ApiError && error.code &&
          typeof error.code === 'number' && error.code >= 400 && error.code < 500) {
          throw error
        }

        // Don't retry on AbortError (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout')
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          break
        }

        // Wait before retrying (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000)
      }
    }

    throw lastError!
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json()
      } catch {
        return { message: 'Invalid JSON in error response' }
      }
    }

    return { message: await response.text() || response.statusText }
  }

  /**
   * Parse success response
   */
  private async parseSuccessResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    // For non-JSON responses, wrap in ApiResponse format
    const text = await response.text()
    return {
      data: text as any,
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => url.searchParams.append(key, String(item)))
          } else {
            url.searchParams.append(key, String(value))
          }
        }
      })
    }

    return url.toString()
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    const response = await this.makeRequest<T>(url, { ...options, method: 'GET' })
    return response.data
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.data
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.makeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await this.makeRequest<T>(url, { ...options, method: 'DELETE' })
    return response.data
  }

  /**
   * Download file
   */
  async download(
    endpoint: string,
    params?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<Blob> {
    const url = this.buildUrl(endpoint, params)
    const headers = {
      ...(options.useAuth !== false && this.getAuthHeaders()),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
      method: options.method || 'GET',
    })

    if (!response.ok) {
      const errorData = await this.parseErrorResponse(response)
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
        new Date().toISOString()
      )
    }

    return response.blob()
  }

  /**
   * Upload file
   */
  async upload<T>(
    endpoint: string,
    file: File,
    options: RequestOptions & { onProgress?: (progress: number) => void } = {}
  ): Promise<T> {
    const { onProgress, ...requestOptions } = options
    const url = this.buildUrl(endpoint)

    const formData = new FormData()
    formData.append('file', file)

    // Don't set Content-Type for FormData, let browser set it with boundary
    const headers = {
      ...(requestOptions.useAuth !== false && this.getAuthHeaders()),
      ...requestOptions.headers,
    }

    // Remove Content-Type if present for file uploads
    delete headers['Content-Type']

    const response = await this.makeRequest<T>(url, {
      ...requestOptions,
      method: 'POST',
      body: formData,
      headers,
    })

    return response.data
  }
}

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public code?: string | number,
    public details?: any,
    public timestamp?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient, ApiError }