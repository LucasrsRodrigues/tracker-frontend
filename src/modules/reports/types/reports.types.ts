export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  templateId?: string;
  configuration: ReportConfiguration;
  schedule?: ReportSchedule;
  recipients: ReportRecipient[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  lastGenerated?: Date;
  nextGeneration?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface ReportType {
  id: string;
  name: string;
  category: 'executive' | 'operational' | 'analytical' | 'compliance' | 'custom';
  description: string;
  defaultConfiguration: ReportConfiguration;
  requiredData: DataSource[];
  outputFormats: OutputFormat[];
  templateOptions: TemplateOption[];
}

export interface ReportConfiguration {
  dateRange: {
    type: 'fixed' | 'relative' | 'custom';
    value?: {
      from: Date;
      to: Date;
    };
    relative?: {
      unit: 'days' | 'weeks' | 'months' | 'quarters' | 'years';
      amount: number;
    };
  };
  dataFilters: DataFilter[];
  metrics: MetricConfiguration[];
  visualizations: VisualizationConfiguration[];
  formatting: FormattingOptions;
  customSections?: CustomSection[];
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  displayName: string;
}

export interface MetricConfiguration {
  id: string;
  name: string;
  dataSource: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  filters?: DataFilter[];
  format: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
  comparison?: {
    enabled: boolean;
    period: 'previous_period' | 'previous_year' | 'custom';
    customPeriod?: { from: Date; to: Date };
  };
}

export interface VisualizationConfiguration {
  id: string;
  type: 'chart' | 'table' | 'metric_card' | 'heatmap' | 'map' | 'custom';
  title: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'funnel';
  dataSource: string;
  metrics: string[];
  dimensions: string[];
  filters?: DataFilter[];
  styling: {
    colors?: string[];
    width: 'full' | 'half' | 'third' | 'quarter';
    height: 'small' | 'medium' | 'large';
  };
}

export interface FormattingOptions {
  theme: 'default' | 'corporate' | 'minimal' | 'branded';
  logo?: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
  pageSettings: {
    orientation: 'portrait' | 'landscape';
    size: 'A4' | 'letter' | 'legal' | 'custom';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

export interface CustomSection {
  id: string;
  title: string;
  content: string; // Markdown or HTML
  position: 'header' | 'footer' | 'before_data' | 'after_data' | 'custom';
  order: number;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customCron?: string;
  timezone: string;
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: Date;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface ReportRecipient {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'ftp' | 's3' | 'sharepoint';
  destination: string;
  configuration: RecipientConfiguration;
  filters?: ReportFilter[];
}

export interface RecipientConfiguration {
  // Email
  subject?: string;
  message?: string;
  attachments?: boolean;

  // Slack
  channel?: string;
  username?: string;
  iconEmoji?: string;

  // Webhook
  url?: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;

  // File Storage
  path?: string;
  credentials?: Record<string, any>;
}

export interface ReportFilter {
  field: string;
  condition: 'if_value_above' | 'if_value_below' | 'if_contains' | 'if_changed';
  threshold?: number;
  value?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'webhook' | 'stream';
  connection: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    url?: string;
    apiKey?: string;
    authType?: 'none' | 'basic' | 'bearer' | 'oauth2';
  };
  tables?: DataTable[];
  refreshRate: number; // em segundos
  lastSynced?: Date;
}

export interface DataTable {
  name: string;
  schema: TableColumn[];
  primaryKey: string[];
  indexes: string[];
  rowCount?: number;
}

export interface TableColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'timestamp' | 'json';
  nullable: boolean;
  description?: string;
}

export interface OutputFormat {
  type: 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'powerpoint';
  name: string;
  description: string;
  features: string[];
  maxSize?: number; // em MB
  compression?: boolean;
}

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  preview?: string;
  category: 'executive' | 'technical' | 'financial' | 'operational';
  customizable: boolean;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggeredBy: 'schedule' | 'manual' | 'api';
  user?: string;
  configuration: ReportConfiguration;
  outputs: ReportOutput[];
  errors?: ReportError[];
  metrics: ExecutionMetrics;
}

export interface ReportOutput {
  id: string;
  format: string;
  size: number;
  url: string;
  expiresAt?: Date;
  downloadCount: number;
  recipients: DeliveryStatus[];
}

export interface DeliveryStatus {
  recipientId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

export interface ReportError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
}

export interface ExecutionMetrics {
  dataFetchTime: number;
  processingTime: number;
  renderingTime: number;
  deliveryTime: number;
  rowsProcessed: number;
  memoryUsage: number;
  cacheHitRate: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'technical' | 'financial' | 'operational' | 'custom';
  version: string;
  configuration: TemplateConfiguration;
  layout: LayoutConfiguration;
  styling: StylingConfiguration;
  variables: TemplateVariable[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  downloadCount: number;
}

export interface TemplateConfiguration {
  supportedFormats: string[];
  defaultFormat: string;
  maxDataRows: number;
  cacheable: boolean;
  cacheTimeout: number;
}

export interface LayoutConfiguration {
  sections: LayoutSection[];
  grid: {
    columns: number;
    gap: number;
  };
  responsive: boolean;
}

export interface LayoutSection {
  id: string;
  type: 'header' | 'summary' | 'chart' | 'table' | 'text' | 'footer';
  title?: string;
  position: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
  content: SectionContent;
  conditions?: DisplayCondition[];
}

export interface SectionContent {
  // For charts
  chartConfig?: VisualizationConfiguration;

  // For tables
  tableConfig?: {
    columns: TableColumnConfig[];
    pagination: boolean;
    sorting: boolean;
    filtering: boolean;
  };

  // For text/summary
  text?: string;
  markdown?: string;
  html?: string;

  // For metrics
  metrics?: MetricDisplayConfig[];
}

export interface TableColumnConfig {
  field: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  format?: string;
  sortable: boolean;
  filterable: boolean;
  width?: number;
}

export interface MetricDisplayConfig {
  metric: string;
  label: string;
  format: 'number' | 'percentage' | 'currency' | 'duration';
  comparison?: boolean;
  trend?: boolean;
  target?: number;
}

export interface DisplayCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value?: any;
}

export interface StylingConfiguration {
  colors: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
  borders: BorderSettings;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface TypographySettings {
  fontFamily: string;
  headingSizes: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
  };
  bodySize: number;
  lineHeight: number;
  fontWeights: {
    normal: number;
    medium: number;
    bold: number;
  };
}

export interface SpacingSettings {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface BorderSettings {
  radius: number;
  width: number;
  color: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';
  defaultValue?: any;
  options?: VariableOption[];
  required: boolean;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface VariableOption {
  value: any;
  label: string;
  description?: string;
}