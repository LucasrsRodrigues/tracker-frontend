import { useState, useCallback } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import type { AnalyticsFilters } from '../types/analytics.types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const defaultFilters: AnalyticsFilters = {
  dateRange: {
    from: startOfDay(subDays(new Date(), 7)),
    to: endOfDay(new Date()),
  },
  categories: [],
  actions: [],
  providers: [],
  userSegments: [],
  deviceTypes: [],
};

export function useFilters() {
  const [savedFilters, setSavedFilters] = useLocalStorage('analytics-filters', []);
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const saveCurrentFilters = useCallback((name: string) => {
    const savedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date(),
    };
    setSavedFilters(prev => [...prev, savedFilter]);
  }, [filters, setSavedFilters]);

  const loadSavedFilters = useCallback((savedFilter: any) => {
    setFilters(savedFilter.filters);
  }, []);

  const deleteSavedFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
  }, [setSavedFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
  };
}