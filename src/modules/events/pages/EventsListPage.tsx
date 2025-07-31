import { useState } from 'react';
import { EventsList } from '../components/EventsList';
import { EventDetails } from '../components/EventDetails';
import { EventFilters } from '../components/EventFilters';
import { useEventFilters } from '../hooks/useEventFilters';
import type { TrackingEvent } from '../types/events.types';

export function EventsListPage() {
  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(null);
  const { filters, updateFilters } = useEventFilters();

  const handleEventSelect = (event: TrackingEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const handleNavigateToCorrelation = (traceId: string) => {
    // Navigate to correlation page
    console.log('Navigate to correlation:', traceId);
  };

  const handleNavigateToSession = (sessionId: string) => {
    // Navigate to session page
    console.log('Navigate to session:', sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
        <p className="text-muted-foreground">
          Gestão completa de eventos com filtros avançados e análise detalhada
        </p>
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFiltersChange={updateFilters}
      />

      {/* Content */}
      {selectedEvent ? (
        <EventDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
          onNavigateToCorrelation={handleNavigateToCorrelation}
          onNavigateToSession={handleNavigateToSession}
        />
      ) : (
        <EventsList
          filters={filters}
          onEventSelect={handleEventSelect}
          onFilterUpdate={updateFilters}
        />
      )}
    </div>
  );
}