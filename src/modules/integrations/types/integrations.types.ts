//
export interface Provider {
  id: string;
  name: string;
  type: 'payment' | 'pix' | 'consultation' | 'authentication' | 'other';
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  configuration: ProviderConfiguration;
  endpoints: ProviderEndpoint[];
  webhooks: WebhookConfiguration[];
  rateLimits: RateLimit[];
  sla: SlaConfiguration;
  monitoring: MonitoringConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderConfiguration {
  baseUrl: string;
  apiVersion?: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic' | 'bearer' | 'custom';
    credentials: Record<string, any>;
    refreshToken?: string;
    expiresAt?: Date;
  };
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    initialDelay: number;
    maxDelay: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
  };
}

export interface ProviderEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
  isActive: boolean;
  expectedResponseTime: number;
  healthCheck: boolean;
  monitoring: EndpointMonitoring;
}

export interface EndpointMonitoring {
  enabled: boolean;
  frequency: number; // em segundos
  timeout: number;
  expectedStatusCodes: number[];
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    availability: number;
  };
}

export interface WebhookConfiguration {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  authentication?: {
    type: 'hmac' | 'header' | 'query' | 'none';
    secret?: string;
    header?: string;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffTime: number;
  };
  filtering: {
    conditions?: WebhookFilter[];
  };
}

export interface WebhookFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in';
  value: any;
}

export interface RateLimit {
  id: string;
  name: string;
  type: 'requests_per_second' | 'requests_per_minute' | 'requests_per_hour' | 'requests_per_day';
  limit: number;
  current: number;
  resetTime: Date;
  slidingWindow: boolean;
  endpoints?: string[]; // specific endpoints, empty = all
}

export interface SlaConfiguration {
  availability: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  reportingPeriod: 'daily' | 'weekly' | 'monthly';
  penaltyThresholds: {
    minor: number;
    major: number;
    critical: number;
  };
}

export interface MonitoringConfiguration {
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    frequency: number;
    timeout: number;
    expectedResponse?: any;
  };
  alerting: {
    enabled: boolean;
    channels: string[];
    escalationPolicy?: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    includeRequestBody: boolean;
    includeResponseBody: boolean;
    retentionDays: number;
  };
}

export interface ProviderMetrics {
  providerId: string;
  timeRange: {
    from: Date;
    to: Date;
  };
  availability: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  slaCompliance: number;
  uptime: number;
  incidents: ProviderIncident[];
  performanceTrend: PerformanceDataPoint[];
}

export interface ProviderIncident {
  id: string;
  providerId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startTime: Date;
  endTime?: Date;
  impact: IncidentImpact;
  updates: IncidentUpdate[];
}

export interface IncidentImpact {
  affectedEndpoints: string[];
  estimatedUsersAffected: number;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  financialImpact?: number;
}

export interface IncidentUpdate {
  id: string;
  timestamp: Date;
  status: string;
  message: string;
  author: string;
}

export interface PerformanceDataPoint {
  timestamp: Date;
  responseTime: number;
  errorRate: number;
  throughput: number;
  availability: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  providerId: string;
  event: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: WebhookAttempt[];
  createdAt: Date;
  deliveredAt?: Date;
  nextRetryAt?: Date;
}

export interface WebhookAttempt {
  id: string;
  attemptNumber: number;
  timestamp: Date;
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
}

export interface SlaReport {
  providerId: string;
  period: {
    from: Date;
    to: Date;
  };
  metrics: {
    availability: {
      target: number;
      actual: number;
      breaches: SlaBreach[];
    };
    responseTime: {
      target: number;
      actual: number;
      p95: number;
      p99: number;
      breaches: SlaBreach[];
    };
    errorRate: {
      target: number;
      actual: number;
      breaches: SlaBreach[];
    };
  };
  compliance: {
    overall: number;
    penalties: SlaIncident[];
  };
  incidents: ProviderIncident[];
}

export interface SlaBreach {
  id: string;
  metric: string;
  threshold: number;
  actualValue: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  severity: 'minor' | 'major' | 'critical';
}

export interface SlaIncident {
  id: string;
  type: 'availability' | 'performance' | 'error_rate';
  severity: 'minor' | 'major' | 'critical';
  penalty: number;
  startTime: Date;
  endTime: Date;
  description: string;
}