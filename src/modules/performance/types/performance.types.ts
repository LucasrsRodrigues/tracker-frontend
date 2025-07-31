export interface PerformanceMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  region?: string;
  cacheHit: boolean;
  databaseQueries?: DatabaseQuery[];
  externalCalls?: ExternalCall[];
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface DatabaseQuery {
  query: string;
  duration: number;
  rows: number;
  cached: boolean;
  database: string;
  table?: string;
}

export interface ExternalCall {
  provider: string;
  endpoint: string;
  duration: number;
  statusCode: number;
  cached: boolean;
}

export interface EndpointPerformance {
  endpoint: string;
  method: string;
  totalRequests: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  throughput: number;
  apdex: number;
  availability: number;
  trend: PerformanceTrend;
  slowestQueries: SlowQuery[];
  topErrors: ErrorBreakdown[];
}

export interface PerformanceTrend {
  timeRange: string;
  data: TrendDataPoint[];
  regression: {
    slope: number;
    confidence: number;
    prediction: number;
  };
}

export interface TrendDataPoint {
  timestamp: Date;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

export interface SlowQuery {
  query: string;
  averageDuration: number;
  maxDuration: number;
  count: number;
  database: string;
  table?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorBreakdown {
  statusCode: number;
  count: number;
  percentage: number;
  averageResponseTime: number;
  commonMessages: string[];
}

export interface ResourceUtilization {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    processes: ProcessMetrics[];
  };
  memory: {
    usage: number;
    total: number;
    available: number;
    cached: number;
    buffers: number;
  };
  disk: {
    usage: number;
    total: number;
    iops: number;
    readThroughput: number;
    writeThroughput: number;
  };
  network: {
    inbound: number;
    outbound: number;
    connections: number;
    errors: number;
  };
}

export interface ProcessMetrics {
  pid: number;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  threads: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'response_time' | 'error_rate' | 'throughput' | 'resource_usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  endpoint?: string;
  resource?: string;
  threshold: number;
  currentValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  duration: number;
  impact: PerformanceImpact;
  recommendations: string[];
  createdAt: Date;
}

export interface PerformanceImpact {
  affectedUsers: number;
  affectedRequests: number;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  estimatedRevenueLoss?: number;
  slaViolation: boolean;
}

export interface PerformanceBaseline {
  endpoint: string;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  expectedResponseTime: number;
  expectedThroughput: number;
  expectedErrorRate: number;
  confidence: number;
  lastUpdated: Date;
}

export interface PerformanceComparison {
  current: PerformancePeriod;
  previous: PerformancePeriod;
  changes: {
    responseTime: ChangeMetric;
    throughput: ChangeMetric;
    errorRate: ChangeMetric;
    availability: ChangeMetric;
  };
}

export interface PerformancePeriod {
  from: Date;
  to: Date;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  totalRequests: number;
}

export interface ChangeMetric {
  absolute: number;
  percentage: number;
  direction: 'increase' | 'decrease' | 'stable';
  significance: 'low' | 'medium' | 'high';
}

export interface PerformanceReport {
  id: string;
  name: string;
  period: {
    from: Date;
    to: Date;
  };
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    availability: number;
    topEndpoints: EndpointSummary[];
    slowestEndpoints: EndpointSummary[];
    errorProne: EndpointSummary[];
  };
  recommendations: PerformanceRecommendation[];
  trends: {
    responseTime: TrendAnalysis;
    throughput: TrendAnalysis;
    errors: TrendAnalysis;
  };
  resourceUsage: ResourceSummary;
  generatedAt: Date;
}

export interface EndpointSummary {
  endpoint: string;
  method: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
  impact: number;
}

export interface PerformanceRecommendation {
  type: 'optimization' | 'scaling' | 'caching' | 'database' | 'infrastructure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  steps: string[];
}

export interface TrendAnalysis {
  direction: 'improving' | 'degrading' | 'stable';
  magnitude: number;
  confidence: number;
  forecast: number[];
}

export interface ResourceSummary {
  peak: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  average: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  alerts: number;
  efficiency: number;
}