import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useDebounce } from '../../../hooks/useDebounce';
import type { EventFilters } from '../types/events.types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const defaultFilters: EventFilters = {
  dateRange: {
    from: startOfDay(subDays(new Date(), 1)),
    to: endOfDay(new Date()),
  },
  categories: [],
  actions: [],
  userIds: [],
  sessionIds: [],
  traceIds: [],
  providers: [],
  platforms: [],
  devices: [],
  countries: [],
  statusCodes: [],
  hasErrors: false,
  search: '',
};

export function useEventFilters() {
  const [filters, setFilters] = useState<EventFilters>(defaultFilters);
  const [savedFilters, setSavedFilters] = useLocalStorage('event-filters', []);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  const debouncedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const saveCurrentFilters = useCallback((name: string) => {
    const savedFilter = {
      id: Date.now().toString(),
      name,
      filters: debouncedFilters,
      createdAt: new Date(),
    };
    setSavedFilters(prev => [...prev, savedFilter]);
  }, [debouncedFilters, setSavedFilters]);

  const loadSavedFilters = useCallback((savedFilter: any) => {
    setFilters(savedFilter.filters);
  }, []);

  const deleteSavedFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
  }, [setSavedFilters]);

  const addQuickFilter = useCallback((key: keyof EventFilters, value: any) => {
    updateFilters({
      [key]: Array.isArray(filters[key])
        ? [...(filters[key] as any[]), value]
        : [value]
    });
  }, [filters, updateFilters]);

  const removeQuickFilter = useCallback((key: keyof EventFilters, value: any) => {
    updateFilters({
      [key]: Array.isArray(filters[key])
        ? (filters[key] as any[]).filter(v => v !== value)
        : undefined
    });
  }, [filters, updateFilters]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.actions?.length) count += filters.actions.length;
    if (filters.userIds?.length) count += filters.userIds.length;
    if (filters.sessionIds?.length) count += filters.sessionIds.length;
    if (filters.traceIds?.length) count += filters.traceIds.length;
    if (filters.providers?.length) count += filters.providers.length;
    if (filters.platforms?.length) count += filters.platforms.length;
    if (filters.devices?.length) count += filters.devices.length;
    if (filters.countries?.length) count += filters.countries.length;
    if (filters.statusCodes?.length) count += filters.statusCodes.length;
    if (filters.hasErrors) count += 1;
    if (filters.search) count += 1;
    return count;
  }, [filters]);

  return {
    filters: debouncedFilters,
    updateFilters,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
    addQuickFilter,
    removeQuickFilter,
    getActiveFiltersCount,
  };
}