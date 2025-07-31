import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { LiveEvent, RealtimeMetrics } from '../types/monitoring.types';

export function useRealtimeEvents(filters?: {
  types?: string[];
  severity?: string[];
  providers?: string[];
}) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [isRecording, setIsRecording] = useState(true);
  const { socket, isConnected } = useWebSocket('/monitoring/live');

  useEffect(() => {
    if (!socket) return;

    socket.on('event:new', (event: LiveEvent) => {
      if (!isRecording) return;

      // Apply filters
      if (filters?.types && !filters.types.includes(event.type)) return;
      if (filters?.severity && !filters.severity.includes(event.severity)) return;
      if (filters?.providers && event.provider && !filters.providers.includes(event.provider)) return;

      setEvents(prev => [event, ...prev].slice(0, 1000)); // Keep last 1000 events
    });

    socket.on('metrics:update', (newMetrics: RealtimeMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      socket.off('event:new');
      socket.off('metrics:update');
    };
  }, [socket, isRecording, filters]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  const pauseRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const resumeRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  return {
    events,
    metrics,
    isConnected,
    isRecording,
    clearEvents,
    toggleRecording,
    pauseRecording,
    resumeRecording,
  };
}
