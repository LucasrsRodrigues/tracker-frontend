import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { APP_CONFIG } from './constants'
import { logger } from './logger'

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
  status: number
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: APP_CONFIG.api.baseUrl,
      timeout: APP_CONFIG.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('tracking-auth-token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracing
        config.headers['X-Request-ID'] = this.generateRequestId()

        logger.debug('API Request', {
          method: config.method,
          url: config.url,
          headers: config.headers,
        })

        return config
      },
      (error) => {
        logger.error('API Request Error', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        })

        return response
      },
      (error: AxiosError<ApiError>) => {
        logger.error('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message,
        })

        // Handle common errors
        if (error.response?.status === 401) {
          // Redirect to login or refresh token
          this.handleUnauthorized()
        }

        return Promise.reject(this.transformError(error))
      }
    )
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private handleUnauthorized(): void {
    localStorage.removeItem('tracking-auth-token')
    window.location.href = '/login'
  }

  private transformError(error: AxiosError<ApiError>): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details,
      status: error.response?.status || 0,
    }
  }

  // HTTP Methods
  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data)
    return response.data
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url)
    return response.data
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('tracking-auth-token', token)
    this.client.defaults.headers.Authorization = `Bearer ${token}`
  }

  removeAuthToken(): void {
    localStorage.removeItem('tracking-auth-token')
    delete this.client.defaults.headers.Authorization
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || ''
  }
}

export const apiClient = new ApiClient()