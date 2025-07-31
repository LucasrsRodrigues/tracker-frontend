import { MetricsOverview } from '../components/MetricsOverview';
import { RealtimeChart } from '../components/RealtimeChart';
import { SystemStatus } from '../components/SystemStatus';
import { CriticalAlerts } from '../components/CriticalAlerts';
import { QuickActions } from '../components/QuickActions';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de tracking e observabilidade
        </p>
      </div>

      {/* KPI Cards */}
      <MetricsOverview />

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Real-time Chart - Span 2 columns */}
        <div className="lg:col-span-2">
          <RealtimeChart />
        </div>

        {/* System Status */}
        <SystemStatus />

        {/* Critical Alerts - Span 2 columns */}
        <div className="lg:col-span-2">
          <CriticalAlerts />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}