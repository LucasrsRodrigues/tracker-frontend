import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorDashboard } from '../components/ErrorDashboard';
import { ErrorsList } from '../components/ErrorsList';
import { ErrorDetails } from '../components/ErrorDetails';
import { ErrorFilters } from '../components/ErrorFilters';
import { useErrorFilters } from '../hooks/useErrorFilters';
import type { ErrorGroup } from '../types/errors.types';

export function ErrorsOverviewPage() {
  const [selectedGroup, setSelectedGroup] = useState<ErrorGroup | null>(null);
  const { filters, updateFilters } = useErrorFilters();

  const handleGroupSelect = (group: ErrorGroup) => {
    setSelectedGroup(group);
  };

  const handleCloseDetails = () => {
    setSelectedGroup(null);
  };

  const handleStatusUpdate = (groupId: string, status: string) => {
    // Update group status
    console.log('Update status:', groupId, status);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup({ ...selectedGroup, status: status as any });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Tracking & Analysis</h1>
        <p className="text-muted-foreground">
          Rastreamento inteligente de erros com agrupamento automático e análise de impacto
        </p>
      </div>

      {/* Filters */}
      <ErrorFilters
        filters={filters}
        onFiltersChange={updateFilters}
      />

      {/* Content */}
      {selectedGroup ? (
        <ErrorDetails
          group={selectedGroup}
          onClose={handleCloseDetails}
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="errors">Lista de Erros</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <ErrorDashboard
              filters={filters}
              onGroupSelect={(groupId) => {
                // Find group by ID and select it
                console.log('Select group:', groupId);
              }}
            />
          </TabsContent>

          <TabsContent value="errors" className="mt-6">
            <ErrorsList
              filters={filters}
              onGroupSelect={handleGroupSelect}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}