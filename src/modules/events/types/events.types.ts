export interface TrackingEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  traceId?: string;
  category: 'user' | 'system' | 'business' | 'integration';
  action: string;
  label?: string;
  data: Record<string, any>;
  context: EventContext;
  metadata?: EventMetadata;
}

export interface EventContext {
  ip: string;
  userAgent: string;
  referer?: string;
  appVersion: string;
  platform: string;
  country?: string;
  city?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

export interface EventMetadata {
  duration?: number;
  errorCode?: string;
  provider?: string;
  endpoint?: string;
  statusCode?: number;
  responseSize?: number;
  correlationId?: string;
}

export interface EventFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  categories?: string[];
  actions?: string[];
  userIds?: string[];
  sessionIds?: string[];
  traceIds?: string[];
  providers?: string[];
  platforms?: string[];
  devices?: string[];
  countries?: string[];
  statusCodes?: number[];
  hasErrors?: boolean;
  search?: string;
}

export interface EventsResponse {
  events: TrackingEvent[];
  totalCount: number;
  hasMore: boolean;
  aggregations?: EventAggregations;
}

export interface EventAggregations {
  byCategory: Record<string, number>;
  byAction: Record<string, number>;
  byProvider: Record<string, number>;
  byPlatform: Record<string, number>;
  byHour: Record<string, number>;
  errorRate: number;
  avgDuration: number;
}

export interface EventCorrelation {
  traceId: string;
  events: TrackingEvent[];
  totalDuration: number;
  spanCount: number;
  errorCount: number;
  services: string[];
  timeline: CorrelationTimeline[];
}

export interface CorrelationTimeline {
  timestamp: Date;
  service: string;
  action: string;
  duration: number;
  status: 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
}

export interface SessionGrouping {
  sessionId: string;
  userId?: string;
  events: TrackingEvent[];
  startTime: Date;
  endTime: Date;
  duration: number;
  eventCount: number;
  uniqueActions: number;
  errorCount: number;
  platform: string;
  device: string;
  outcome: 'conversion' | 'abandonment' | 'ongoing';
}

export interface EventExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeContext: boolean;
  includeMetadata: boolean;
  maxRows?: number;
  compression?: boolean;
}