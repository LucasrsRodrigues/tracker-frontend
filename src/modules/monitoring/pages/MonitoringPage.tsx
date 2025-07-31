import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveDashboard } from '../components/LiveDashboard';
import { EventStream } from '../components/EventStream';
import { SystemHealth } from '../components/SystemHealth';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { ProviderStatus } from '../components/ProviderStatus';
import { SlaIndicators } from '../components/SlaIndicators';

export function MonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Real-time Monitoring</h1>
        <p className="text-muted-foreground">
          Monitoramento em tempo real do sistema e provedores externos
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <LiveDashboard />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <EventStream />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SystemHealth />
            <SlaIndicators />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="providers" className="mt-6">
          <ProviderStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}