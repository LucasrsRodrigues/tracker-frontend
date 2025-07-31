import { useState, useEffect } from 'react';
import { useResourceUtilization } from './usePerformanceMetrics';
import type { ResourceUtilization } from '../types/performance.types';

export function useResourceMonitoring(alertThresholds?: {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}) {
  const [alerts, setAlerts] = useState<string[]>([]);
  const { data: resources, isLoading } = useResourceUtilization('1h');

  useEffect(() => {
    if (!resources || !alertThresholds) return;

    const newAlerts: string[] = [];
    const latest = resources[resources.length - 1];

    if (latest.cpu.usage > alertThresholds.cpu) {
      newAlerts.push(`CPU usage high: ${latest.cpu.usage.toFixed(1)}%`);
    }
    if (latest.memory.usage > alertThresholds.memory) {
      newAlerts.push(`Memory usage high: ${latest.memory.usage.toFixed(1)}%`);
    }
    if (latest.disk.usage > alertThresholds.disk) {
      newAlerts.push(`Disk usage high: ${latest.disk.usage.toFixed(1)}%`);
    }

    setAlerts(newAlerts);
  }, [resources, alertThresholds]);

  const getResourceStatus = (usage: number, threshold: number = 80) => {
    if (usage >= threshold) return 'critical';
    if (usage >= threshold * 0.8) return 'warning';
    return 'normal';
  };

  return {
    resources,
    alerts,
    isLoading,
    getResourceStatus,
  };
}