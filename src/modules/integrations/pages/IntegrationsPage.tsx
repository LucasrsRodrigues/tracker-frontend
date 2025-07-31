import { useState } from 'react';
import { ProvidersOverview } from '../components/ProvidersOverview';
import { ProviderDetails } from '../components/ProviderDetails';
import { WebhookMonitor } from '../components/WebhookMonitor';
import { SlaIndicators } from '../components/SlaIndicators';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Provider } from '../types/integrations.types';

export function IntegrationsPage() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleBackToOverview = () => {
    setSelectedProvider(null);
  };

  if (selectedProvider) {
    return (
      <div className="space-y-6">
        <ProviderDetails
          provider={selectedProvider}
          onBack={handleBackToOverview}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provider Integrations</h1>
        <p className="text-muted-foreground">
          Monitoramento e gestão de integrações com provedores externos
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sla">SLA & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProvidersOverview onProviderSelect={handleProviderSelect} />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookMonitor />
        </TabsContent>

        <TabsContent value="sla" className="mt-6">
          <SlaIndicators />
        </TabsContent>
      </Tabs>
    </div>
  );
}