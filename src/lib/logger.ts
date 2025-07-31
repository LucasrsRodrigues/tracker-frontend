type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor(level: LogLevel = 'info') {
    this.level = level
    this.isDevelopment = import.meta.env.DEV
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (this.isDevelopment) {
      const styles = {
        debug: 'color: #6b7280',
        info: 'color: #3b82f6',
        warn: 'color: #f59e0b',
        error: 'color: #ef4444',
      }

      console.log(`%c${prefix} ${message}`, styles[level], data || '')
    } else {
      console[level](`${prefix} ${message}`, data || '')
    }
  }

  debug(message: string, data?: any): void {
    this.formatMessage('debug', message, data)
  }

  info(message: string, data?: any): void {
    this.formatMessage('info', message, data)
  }

  warn(message: string, data?: any): void {
    this.formatMessage('warn', message, data)
  }

  error(message: string, error?: any): void {
    this.formatMessage('error', message, error)

    // In production, you might want to send errors to a service
    if (!this.isDevelopment && error) {
      // Send to error tracking service (Sentry, LogRocket, etc.)
    }
  }
}

export const logger = new Logger(import.meta.env.VITE_LOG_LEVEL as LogLevel || 'info')
