import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { RealtimeStats } from '../types/dashboard.types';

export function useRealtimeUpdates() {
  const [realtimeData, setRealtimeData] = useState<RealtimeStats | null>(null);
  const { socket, isConnected } = useWebSocket('/dashboard/realtime');

  useEffect(() => {
    if (!socket) return;

    socket.on('metrics:update', (data: RealtimeStats) => {
      setRealtimeData(data);
    });

    return () => {
      socket.off('metrics:update');
    };
  }, [socket]);

  return {
    realtimeData,
    isConnected,
  };
}