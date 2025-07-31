import { useState, useEffect } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { LiveAlert } from '../types/monitoring.types';

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, isConnected } = useWebSocket('/monitoring/alerts');

  useEffect(() => {
    if (!socket) return;

    socket.on('alert:new', (alert: LiveAlert) => {
      setAlerts(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification for critical alerts
      if (alert.severity === 'critical' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(alert.title, {
            body: alert.message,
            icon: '/favicon.ico',
            tag: alert.id,
          });
        }
      }
    });

    socket.on('alert:resolved', (alertId: string) => {
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, resolvedAt: new Date() }
            : alert
        )
      );
    });

    return () => {
      socket.off('alert:new');
      socket.off('alert:resolved');
    };
  }, [socket]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
    socket?.emit('alert:acknowledge', alertId);
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return {
    alerts,
    unreadCount,
    isConnected,
    acknowledgeAlert,
    markAllAsRead,
  };
}