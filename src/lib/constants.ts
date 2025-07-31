export const APP_CONFIG = {
  name: 'Tracking & Observability Platform',
  version: '1.0.0',
  description: 'Sistema de tracking e observabilidade em tempo real',
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 30000,
  },
  websocket: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  },
  defaults: {
    pageSize: 50,
    maxTableRows: 1000,
    refreshInterval: 30000,
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
} as const

export const ROUTES = {
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  USER_JOURNEY: '/user-journey',
  MONITORING: '/monitoring',
  EVENTS: '/events',
  ERRORS: '/errors',
  ALERTS: '/alerts',
  INTEGRATIONS: '/integrations',
  PERFORMANCE: '/performance',
  REPORTS: '/reports',
} as const

export const LOCAL_STORAGE_KEYS = {
  THEME: 'tracking-ui-theme',
  AUTH_TOKEN: 'tracking-auth-token',
  USER_PREFERENCES: 'tracking-user-preferences',
  SAVED_FILTERS: 'tracking-saved-filters',
} as const

export const QUERY_KEYS = {
  DASHBOARD: ['dashboard'],
  ANALYTICS: ['analytics'],
  USER_JOURNEY: ['user-journey'],
  MONITORING: ['monitoring'],
  EVENTS: ['events'],
  ERRORS: ['errors'],
  ALERTS: ['alerts'],
  INTEGRATIONS: ['integrations'],
  PERFORMANCE: ['performance'],
  REPORTS: ['reports'],
} as const