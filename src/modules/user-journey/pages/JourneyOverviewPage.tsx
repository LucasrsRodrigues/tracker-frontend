import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JourneyVisualization } from '../components/JourneyVisualization';
import { ConversionFunnel } from '../components/ConversionFunnel';
import { PathAnalysis } from '../components/PathAnalysis';
import { DropoffAnalysis } from '../components/DropoffAnalysis';
import { JourneyFilters } from '../components/JourneyFilters';
import type { JourneyFilters as JourneyFiltersType, UserJourney } from '../types/journey.types';

export function JourneyOverviewPage() {
  const [filters, setFilters] = useState<JourneyFiltersType | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<UserJourney | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Journey Mapping</h1>
        <p className="text-muted-foreground">
          Visualização completa das jornadas dos usuários e análise de comportamento
        </p>
      </div>

      {/* Filters */}
      <JourneyFilters onFiltersChange={setFilters} />

      {/* Content */}
      {filters && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="funnel">Funil</TabsTrigger>
            <TabsTrigger value="paths">Caminhos</TabsTrigger>
            <TabsTrigger value="dropoff">Drop-off</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <JourneyVisualization
              filters={filters}
              selectedJourney={selectedJourney}
              onJourneySelect={setSelectedJourney}
            />
          </TabsContent>

          <TabsContent value="funnel" className="mt-6">
            <ConversionFunnel filters={filters} />
          </TabsContent>

          <TabsContent value="paths" className="mt-6">
            <PathAnalysis filters={filters} />
          </TabsContent>

          <TabsContent value="dropoff" className="mt-6">
            <DropoffAnalysis filters={filters} />
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!filters && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Configure os filtros acima para visualizar as jornadas dos usuários
          </p>
        </div>
      )}
    </div>
  );
}