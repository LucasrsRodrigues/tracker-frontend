export interface RealtimeMetrics {
  timestamp: Date;
  eventsPerSecond: number;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface LiveEvent {
  id: string;
  timestamp: Date;
  type: 'user' | 'system' | 'error' | 'integration';
  category: string;
  action: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  provider?: string;
}

export interface SystemHealth {
  service: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  uptime: number;
  responseTime: number;
  errorCount: number;
  lastCheck: Date;
  dependencies: ServiceDependency[];
}

export interface ServiceDependency {
  name: string;
  status: 'connected' | 'disconnected' | 'degraded';
  latency: number;
  errorRate: number;
}

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  status: 'optimal' | 'slow' | 'critical';
}

export interface ProviderStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  uptime: number;
  latency: number;
  successRate: number;
  lastIncident?: Date;
  slaCompliance: number;
  rateLimitStatus: {
    current: number;
    limit: number;
    resetTime: Date;
  };
}

export interface SlaMetrics {
  provider: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  breaches: SlaBreach[];
  trend: 'improving' | 'stable' | 'degrading';
}

export interface SlaBreach {
  timestamp: Date;
  duration: number;
  impact: 'minor' | 'major' | 'critical';
  reason: string;
  resolved: boolean;
}

export interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number; // em segundos
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
}

export interface LiveAlert {
  id: string;
  configId: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}