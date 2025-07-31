export interface AnalyticsFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  categories?: string[];
  actions?: string[];
  providers?: string[];
  userSegments?: string[];
  deviceTypes?: string[];
}

export interface MetricData {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  trend: TrendData[];
  segment?: string;
}

export interface TrendData {
  date: Date;
  value: number;
  label?: string;
}

export interface ConversionFunnelData {
  step: string;
  stepIndex: number;
  total: number;
  converted: number;
  conversionRate: number;
  dropOff: number;
  dropOffRate: number;
}

export interface RetentionData {
  cohort: string;
  period: number;
  users: number;
  retainedUsers: number;
  retentionRate: number;
}

export interface CategoryBreakdown {
  category: string;
  value: number;
  percentage: number;
  color: string;
  change?: number;
}

export interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  value: number;
  unit: string;
  target?: number;
}

export interface ExportFormat {
  type: 'csv' | 'json' | 'xlsx' | 'pdf';
  name: string;
  description: string;
  icon: string;
}