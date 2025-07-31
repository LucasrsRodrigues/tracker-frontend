interface EnvConfig {
  apiBaseUrl: string
  wsUrl: string
  environment: 'development' | 'staging' | 'production'
  enableDevtools: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  wsUrl: getEnvVar('VITE_WS_URL', 'ws://localhost:3001'),
  environment: (getEnvVar('VITE_ENVIRONMENT', 'development') as EnvConfig['environment']),
  enableDevtools: getEnvVar('VITE_ENABLE_DEVTOOLS', 'true') === 'true',
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as EnvConfig['logLevel']),
}