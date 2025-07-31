import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponseTimeChart } from '../components/ResponseTimeChart';
import { EndpointBreakdown } from '../components/EndpointBreakdown';
import { ResourceUsage } from '../components/ResourceUsage';
import { SlowQueries } from '../components/SlowQueries';
import { PerformanceCorrelation } from '../components/PerformanceCorrelation';

export function PerformancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground">
          Análise avançada de performance com breakdown por endpoint e correlação com métricas de negócio
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="correlation">Correlação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <ResponseTimeChart />
            <EndpointBreakdown />
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6">
          <EndpointBreakdown />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourceUsage />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <SlowQueries />
        </TabsContent>

        <TabsContent value="correlation" className="mt-6">
          <PerformanceCorrelation />
        </TabsContent>
      </Tabs>
    </div>
  );
}