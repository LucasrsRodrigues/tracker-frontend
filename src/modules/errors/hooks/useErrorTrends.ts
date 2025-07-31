import { useState, useMemo } from 'react';
import { useErrorTrends as useErrorTrendsQuery } from './useErrorsData';
import type { ErrorFilters } from '../types/errors.types';

export function useErrorTrends(filters: ErrorFilters) {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const { data: trendsData, isLoading, error } = useErrorTrendsQuery(filters, timeRange);

  const chartData = useMemo(() => {
    if (!trendsData?.data) return [];

    return trendsData.data.map(point => ({
      timestamp: point.timestamp,
      errors: point.errorCount,
      users: point.userCount,
      newGroups: point.newGroups,
      errorRate: ((point.errorCount / (point.userCount || 1)) * 100).toFixed(2),
    }));
  }, [trendsData]);

  const metrics = useMemo(() => {
    if (!trendsData?.summary) return null;

    const current = trendsData.summary;
    return {
      totalErrors: current.totalErrors,
      totalUsers: current.totalUsers,
      errorRate: current.errorRate,
      avgResolutionTime: current.avgResolutionTime,
      criticalErrors: current.criticalErrors,
      topErrors: current.topErrors,
    };
  }, [trendsData]);

  return {
    timeRange,
    setTimeRange,
    chartData,
    metrics,
    isLoading,
    error,
  };
}