import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useState, useEffect } from 'react';
import type { TimeSeriesData } from '../types/dashboard.types';

export function RealtimeChart() {
  const { realtimeData, isConnected } = useRealtimeUpdates();
  const [chartData, setChartData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    if (realtimeData) {
      setChartData(prev => {
        const newData = [...prev, {
          timestamp: realtimeData.timestamp,
          value: realtimeData.eventsPerMinute,
        }];

        // Mantém apenas os últimos 20 pontos
        return newData.slice(-20);
      });
    }
  }, [realtimeData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Eventos em Tempo Real</CardTitle>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value) => [value, 'Eventos/min']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}