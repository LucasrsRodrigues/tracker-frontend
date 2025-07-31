import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertRules } from '../components/AlertRules';
import { AlertHistory } from '../components/AlertHistory';
import { AlertConfiguration } from '../components/AlertConfiguration';
import { NotificationChannels } from '../components/NotificationChannels';
import { AlertTemplates } from '../components/AlertTemplates';
import { AlertStats } from '../components/AlertStats';
import type { AlertRule } from '../types/alerts.types';

export function AlertsPage() {
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(false);

  const handleCreateRule = () => {
    setSelectedRule(null);
    setShowConfiguration(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setSelectedRule(rule);
    setShowConfiguration(true);
  };

  const handleSaveRule = (ruleData: Partial<AlertRule>) => {
    // Save rule logic
    console.log('Saving rule:', ruleData);
    setShowConfiguration(false);
    setSelectedRule(null);
  };

  const handleCancelConfiguration = () => {
    setShowConfiguration(false);
    setSelectedRule(null);
  };

  if (showConfiguration) {
    return (
      <div className="space-y-6">
        <AlertConfiguration
          rule={selectedRule}
          onSave={handleSaveRule}
          onCancel={handleCancelConfiguration}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerting System</h1>
        <p className="text-muted-foreground">
          Configure regras de alerta, canais de notificação e monitore o status do sistema
        </p>
      </div>

      {/* Stats Overview */}
      <AlertStats />

      {/* Main Content */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="suppression">Supressão</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <AlertRules
            onCreateRule={handleCreateRule}
            onEditRule={handleEditRule}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AlertHistory />
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <NotificationChannels />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <AlertTemplates />
        </TabsContent>

        <TabsContent value="suppression" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Configuração de regras de supressão em desenvolvimento
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}