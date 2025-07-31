import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportBuilder } from '../components/ReportBuilder';
import { ReportScheduler } from '../components/ReportScheduler';
import { ReportTemplates } from '../components/ReportTemplates';
import { ReportHistory } from '../components/ReportHistory';
import { ExportOptions } from '../components/ExportOptions';

export function ReportsPage() {
  const [activeView, setActiveView] = useState<'list' | 'builder' | 'template'>('list');

  if (activeView === 'builder') {
    return (
      <div className="space-y-6">
        <ReportBuilder />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Export</h1>
        <p className="text-muted-foreground">
          Crie, agende e distribua relatórios executivos automatizados
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="schedule">Agendamentos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setActiveView('builder')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Novo Relatório
            </button>
          </div>
          {/* Reports list would go here */}
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ReportScheduler />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <ReportTemplates onSelectTemplate={(template) => setActiveView('builder')} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ReportHistory />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportOptions />
        </TabsContent>
      </Tabs>
    </div>
  );
}