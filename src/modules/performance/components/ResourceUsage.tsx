import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useResourceMonitoring } from '../hooks/useResourceMonitoring';
import { formatNumber } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ResourceUsage() {
  const {
    resources,
    alerts,
    isLoading,
    getResourceStatus
  } = useResourceMonitoring({
    cpu: 80,
    memory: 85,
    disk: 90,
    network: 100, // MB/s
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Dados de recursos não disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = resources[resources.length - 1];
  const cpuStatus = getResourceStatus(latest.cpu.usage);
  const memoryStatus = getResourceStatus(latest.memory.usage);
  const diskStatus = getResourceStatus(latest.disk.usage);
  const networkUsage = (latest.network.inbound + latest.network.outbound) / (1024 * 1024); // MB/s

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {alerts.map((alert, index) => (
                <div key={index}>{alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Resource Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest.cpu.usage.toFixed(1)}%</div>
            <div className="space-y-2 mt-2">
              <Progress
                value={latest.cpu.usage}
                className={`h-3 [&>div]:${getStatusColor(cpuStatus)}`}
              />
              <div className="text-xs text-muted-foreground">
                {latest.cpu.cores} cores • {latest.cpu.processes.length} processos
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <MemoryStick className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest.memory.usage.toFixed(1)}%</div>
            <div className="space-y-2 mt-2">
              <Progress
                value={latest.memory.usage}
                className={`h-3 [&>div]:${getStatusColor(memoryStatus)}`}
              />
              <div className="text-xs text-muted-foreground">
                {formatBytes(latest.memory.total - latest.memory.available)} / {formatBytes(latest.memory.total)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disco</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest.disk.usage.toFixed(1)}%</div>
            <div className="space-y-2 mt-2">
              <Progress
                value={latest.disk.usage}
                className={`h-3 [&>div]:${getStatusColor(diskStatus)}`}
              />
              <div className="text-xs text-muted-foreground">
                {latest.disk.iops} IOPS • {formatBytes(latest.disk.readThroughput)}/s read
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rede</CardTitle>
            <Wifi className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkUsage.toFixed(1)} MB/s</div>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">In: </span>
                  <span className="font-medium">{formatBytes(latest.network.inbound)}/s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Out: </span>
                  <span className="font-medium">{formatBytes(latest.network.outbound)}/s</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {latest.network.connections} conexões • {latest.network.errors} erros
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CPU & Memory Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memória - Última Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
                    formatter={(value, name) => [
                      `${value}%`,
                      name === 'cpuUsage' ? 'CPU' : 'Memória'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu.usage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="cpuUsage"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="memory.usage"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="memoryUsage"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tráfego de Rede - Última Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  />
                  <YAxis
                    tickFormatter={(value) => formatBytes(value)}
                  />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
                    formatter={(value, name) => [
                      formatBytes(value) + '/s',
                      name === 'inbound' ? 'Entrada' : 'Saída'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="network.inbound"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="inbound"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="network.outbound"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="outbound"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Processes */}
      {latest.cpu.processes && latest.cpu.processes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processos com Maior Uso de CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latest.cpu.processes
                .sort((a, b) => b.cpuUsage - a.cpuUsage)
                .slice(0, 10)
                .map((process) => (
                  <div key={process.pid} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{process.name}</div>
                      <div className="text-sm text-muted-foreground">
                        PID: {process.pid} • {process.threads} threads
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{process.cpuUsage.toFixed(1)}% CPU</div>
                      <div className="text-sm text-muted-foreground">
                        {formatBytes(process.memoryUsage)} RAM
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}