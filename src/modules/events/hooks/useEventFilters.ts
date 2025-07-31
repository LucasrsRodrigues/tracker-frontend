import { useState, useCallback } from 'react';
import type { EventFilters } from '../types/events.types';

export function useEventFilters() {
  const [filters, setFilters] = useState<EventFilters>({
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    }
  });

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        to: new Date()
      }
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.categories?.length ||
      filters.actions?.length ||
      filters.userIds?.length ||
      filters.sessionIds?.length ||
      filters.traceIds?.length ||
      filters.providers?.length ||
      filters.platforms?.length ||
      filters.devices?.length ||
      filters.countries?.length ||
      filters.statusCodes?.length ||
      filters.hasErrors ||
      filters.search
    );
  }, [filters]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;

    if (filters.categories?.length) count++;
    if (filters.actions?.length) count++;
    if (filters.userIds?.length) count++;
    if (filters.sessionIds?.length) count++;
    if (filters.traceIds?.length) count++;
    if (filters.providers?.length) count++;
    if (filters.platforms?.length) count++;
    if (filters.devices?.length) count++;
    if (filters.countries?.length) count++;
    if (filters.statusCodes?.length) count++;
    if (filters.hasErrors) count++;
    if (filters.search) count++;

    return count;
  }, [filters]);

  const addQuickFilter = useCallback((key: keyof EventFilters, value: string | number | boolean) => {
    if (Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[] | number[];
      if (!currentArray.includes(value as any)) {
        updateFilters({
          [key]: [...currentArray, value]
        });
      }
    } else {
      updateFilters({
        [key]: value
      });
    }
  }, [filters, updateFilters]);

  const removeQuickFilter = useCallback((key: keyof EventFilters, value?: string | number) => {
    if (value !== undefined && Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[] | number[];
      updateFilters({
        [key]: currentArray.filter(item => item !== value)
      });
    } else {
      updateFilters({
        [key]: undefined
      });
    }
  }, [filters, updateFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount,
    addQuickFilter,
    removeQuickFilter
  };
}