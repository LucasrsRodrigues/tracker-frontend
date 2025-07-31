// src/hooks/useFilters.ts
import { useState, useCallback, useEffect } from 'react';

export interface SavedFilter<T = any> {
  id: string;
  name: string;
  filters: T;
  createdAt: Date;
  updatedAt: Date;
}

export function useFilters<T extends Record<string, any>>() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter<T>[]>([]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved-filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedFilters(parsed.map((filter: any) => ({
          ...filter,
          createdAt: new Date(filter.createdAt),
          updatedAt: new Date(filter.updatedAt)
        })));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, []);

  // Save to localStorage whenever savedFilters changes
  useEffect(() => {
    try {
      localStorage.setItem('saved-filters', JSON.stringify(savedFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [savedFilters]);

  const saveCurrentFilters = useCallback((name: string, filters: T) => {
    const newFilter: SavedFilter<T> = {
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      filters,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSavedFilters(prev => [...prev, newFilter]);
  }, []);

  const loadSavedFilters = useCallback((savedFilter: SavedFilter<T>) => {
    return savedFilter.filters;
  }, []);

  const deleteSavedFilter = useCallback((filterId: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== filterId));
  }, []);

  const updateSavedFilter = useCallback((filterId: string, name: string, filters: T) => {
    setSavedFilters(prev => prev.map(filter =>
      filter.id === filterId
        ? { ...filter, name, filters, updatedAt: new Date() }
        : filter
    ));
  }, []);

  const hasActiveFilters = useCallback(() => {
    // This is a generic implementation - specific hooks should override this
    return false;
  }, []);

  const getActiveFilterCount = useCallback(() => {
    // This is a generic implementation - specific hooks should override this
    return 0;
  }, []);

  return {
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
    updateSavedFilter,
    hasActiveFilters,
    getActiveFilterCount
  };
}