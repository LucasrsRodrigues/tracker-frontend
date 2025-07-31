export interface DashboardMetrics {
  totalEvents: number;
  uniqueUsers: number;
  activeSessions: number;
  errorRate: number;
  avgResponseTime: number;
  conversionRate: number;
  providersStatus: ProviderStatus[];
  realtimeStats: RealtimeStats;
}

export interface ProviderStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  uptime: number;
  latency: number;
  errorCount: number;
}

export interface RealtimeStats {
  eventsPerMinute: number;
  activeUsers: number;
  errorsPerMinute: number;
  timestamp: Date;
}

export interface CriticalAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  provider?: string;
  acknowledged: boolean;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}