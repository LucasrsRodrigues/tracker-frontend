
export interface UserJourney {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  steps: JourneyStep[];
  outcome: 'conversion' | 'abandonment' | 'ongoing';
  conversionValue?: number;
  device: string;
  source: string;
}

export interface JourneyStep {
  id: string;
  stepIndex: number;
  action: string;
  page: string;
  timestamp: Date;
  duration: number;
  metadata?: Record<string, any>;
  isConversion?: boolean;
  isDropOff?: boolean;
}

export interface PathFlow {
  from: string;
  to: string;
  count: number;
  conversionRate: number;
  avgDuration: number;
  dropOffRate: number;
}

export interface JourneyFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  outcome?: 'conversion' | 'abandonment' | 'ongoing';
  device?: string[];
  source?: string[];
  minSteps?: number;
  maxSteps?: number;
  conversionGoal?: string;
}

export interface FunnelStep {
  name: string;
  page: string;
  users: number;
  conversionRate: number;
  dropOffCount: number;
  avgTimeToNext?: number;
}

export interface HeatmapData {
  page: string;
  action: string;
  x: number;
  y: number;
  count: number;
  intensity: number;
}

export interface SessionTimeline {
  sessionId: string;
  userId: string;
  events: TimelineEvent[];
  duration: number;
  outcome: string;
  device: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'pageview' | 'click' | 'form' | 'error' | 'conversion';
  action: string;
  page: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PathAnalysisData {
  commonPaths: Path[];
  conversionPaths: Path[];
  dropOffPaths: Path[];
  pathStats: PathStats;
}

export interface Path {
  id: string;
  steps: string[];
  count: number;
  conversionRate: number;
  avgDuration: number;
  revenue?: number;
}

export interface PathStats {
  totalPaths: number;
  avgPathLength: number;
  conversionRate: number;
  mostCommonEntry: string;
  mostCommonExit: string;
}