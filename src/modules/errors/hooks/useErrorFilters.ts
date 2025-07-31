import { useState, useCallback } from 'react';
import type { ErrorFilters } from '../types/errors.types';

export function useErrorFilters() {
  const [filters, setFilters] = useState<ErrorFilters>({
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      to: new Date()
    }
  });

  const updateFilters = useCallback((newFilters: Partial<ErrorFilters>) => {
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
      filters.severity?.length ||
      filters.status?.length ||
      filters.types?.length ||
      filters.platforms?.length ||
      filters.providers?.length ||
      filters.environments?.length ||
      filters.versions?.length ||
      filters.hasUsers ||
      filters.search
    );
  }, [filters]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;

    if (filters.severity?.length) count++;
    if (filters.status?.length) count++;
    if (filters.types?.length) count++;
    if (filters.platforms?.length) count++;
    if (filters.providers?.length) count++;
    if (filters.environments?.length) count++;
    if (filters.versions?.length) count++;
    if (filters.hasUsers) count++;
    if (filters.search) count++;

    return count;
  }, [filters]);

  const addQuickFilter = useCallback((key: keyof ErrorFilters, value: string | boolean) => {
    if (Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[];
      if (!currentArray.includes(value as string)) {
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

  const removeQuickFilter = useCallback((key: keyof ErrorFilters, value?: string) => {
    if (value !== undefined && Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[];
      updateFilters({
        [key]: currentArray.filter(item => item !== value)
      });
    } else {
      updateFilters({
        [key]: undefined
      });
    }
  }, [filters, updateFilters]);

  const setDateRange = useCallback((from: Date, to: Date) => {
    updateFilters({
      dateRange: { from, to }
    });
  }, [updateFilters]);

  const setSeverityFilter = useCallback((severity: string[]) => {
    updateFilters({ severity });
  }, [updateFilters]);

  const setStatusFilter = useCallback((status: string[]) => {
    updateFilters({ status });
  }, [updateFilters]);

  const setSearch = useCallback((search: string) => {
    updateFilters({ search: search || undefined });
  }, [updateFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount,
    addQuickFilter,
    removeQuickFilter,
    setDateRange,
    setSeverityFilter,
    setStatusFilter,
    setSearch
  };
}