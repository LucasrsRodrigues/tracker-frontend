export interface ErrorEvent {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  userId?: string;
  sessionId: string;
  context: ErrorContext;
  metadata?: ErrorMetadata;
  groupId?: string;
  fingerprint: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ErrorContext {
  url: string;
  userAgent: string;
  ip: string;
  platform: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location?: {
    country: string;
    city: string;
  };
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export interface ErrorMetadata {
  provider?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  requestId?: string;
  traceId?: string;
  version?: string;
  environment: 'development' | 'staging' | 'production';
  tags?: string[];
  customData?: Record<string, any>;
}

export interface ErrorGroup {
  id: string;
  fingerprint: string;
  title: string;
  message: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  count: number;
  userCount: number;
  firstSeen: Date;
  lastSeen: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
  stack?: string;
  affectedVersions: string[];
  platforms: string[];
  topUrls: { url: string; count: number }[];
  recentEvents: ErrorEvent[];
}

export interface ErrorFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  severity?: string[];
  status?: string[];
  types?: string[];
  platforms?: string[];
  providers?: string[];
  environments?: string[];
  versions?: string[];
  hasUsers?: boolean;
  search?: string;
}

export interface ErrorTrends {
  timeRange: 'hour' | 'day' | 'week' | 'month';
  data: {
    timestamp: Date;
    errorCount: number;
    userCount: number;
    newGroups: number;
  }[];
  summary: {
    totalErrors: number;
    totalUsers: number;
    errorRate: number;
    avgResolutionTime: number;
    topErrors: ErrorGroup[];
    criticalErrors: number;
  };
}

export interface ErrorAnalysis {
  groupId: string;
  impactAnalysis: {
    affectedUsers: number;
    affectedSessions: number;
    errorRate: number;
    frequencyPattern: 'spike' | 'consistent' | 'declining';
  };
  correlations: {
    relatedErrors: ErrorGroup[];
    commonPatterns: string[];
    userJourneyImpact: {
      abandonmentRate: number;
      conversionImpact: number;
    };
  };
  recommendations: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    actions: string[];
    estimatedImpact: string;
  };
}

export interface StackTrace {
  frames: StackFrame[];
  language: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp';
  formatted: string;
}

export interface StackFrame {
  filename: string;
  function: string;
  line: number;
  column?: number;
  context?: {
    pre: string[];
    post: string[];
    current: string;
  };
  inApp: boolean;
  vars?: Record<string, any>;
}