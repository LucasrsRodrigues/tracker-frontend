export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  metric: AlertMetric;
  conditions: AlertCondition[];
  evaluationWindow: number; // em segundos
  frequency: number; // em segundos
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // IDs dos canais
  template?: string; // ID do template
  suppressionRules?: SuppressionRule[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertMetric {
  type: 'system' | 'business' | 'error' | 'performance' | 'custom';
  name: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate';
  filters?: Record<string, any>;
  groupBy?: string[];
}

export interface AlertCondition {
  id: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  unit?: string;
  duration?: number; // duração mínima para trigger
}

export interface SuppressionRule {
  id: string;
  type: 'time_based' | 'condition_based' | 'dependency_based';
  config: {
    timeWindows?: TimeWindow[];
    conditions?: AlertCondition[];
    dependencies?: string[]; // IDs de outras regras
  };
  enabled: boolean;
}

export interface TimeWindow {
  start: string; // HH:mm
  end: string; // HH:mm
  days: number[]; // 0-6 (domingo-sábado)
  timezone: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'teams' | 'discord';
  config: ChannelConfig;
  enabled: boolean;
  filters?: ChannelFilter[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelConfig {
  // Email
  emails?: string[];

  // Slack
  webhookUrl?: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;

  // Webhook
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;

  // SMS
  phoneNumbers?: string[];

  // Teams
  teamsWebhookUrl?: string;

  // Discord
  discordWebhookUrl?: string;
}

export interface ChannelFilter {
  severity: string[];
  tags?: string[];
  timeWindows?: TimeWindow[];
}

export interface AlertTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  format: 'text' | 'html' | 'markdown';
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'firing' | 'resolved' | 'suppressed' | 'acknowledged';
  firedAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  value: number;
  threshold: number;
  context: AlertContext;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
  fingerprint: string;
}

export interface AlertContext {
  metric: string;
  query: string;
  evaluationTime: Date;
  dataPoints: DataPoint[];
  relatedAlerts?: string[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  labels?: Record<string, string>;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  action: 'fired' | 'resolved' | 'acknowledged' | 'suppressed' | 'escalated';
  timestamp: Date;
  user?: string;
  details?: Record<string, any>;
}

export interface AlertStats {
  totalRules: number;
  activeRules: number;
  firingAlerts: number;
  acknowledgedAlerts: number;
  suppressedAlerts: number;
  resolvedToday: number;
  avgResolutionTime: number;
  topFiringRules: { ruleId: string; ruleName: string; count: number; }[];
  alertsByHour: { hour: number; count: number; }[];
}

export interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationRule {
  level: number;
  delay: number; // em minutos
  channels: string[];
  conditions?: {
    severity?: string[];
    tags?: string[];
  };
}
