import { useState, useCallback, useEffect } from 'react'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'

export interface FilterState {
  dateRange?: {
    from: Date
    to: Date
  }
  categories?: string[]
  actions?: string[]
  providers?: string[]
  deviceTypes?: string[]
  userId?: string
  sessionId?: string
  search?: string
  severity?: string[]
  status?: string[]
  [key: string]: any
}

export interface SavedFilter {
  id: string
  name: string
  filters: FilterState
  createdAt: Date
  updatedAt: Date
}

export function useFilters(initialFilters: FilterState = {}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])

  // Load saved filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_FILTERS)
      if (saved) {
        const parsedFilters = JSON.parse(saved)
        setSavedFilters(parsedFilters.map((filter: any) => ({
          ...filter,
          createdAt: new Date(filter.createdAt),
          updatedAt: new Date(filter.updatedAt)
        })))
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error)
    }
  }, [])

  // Save filters to localStorage whenever savedFilters changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(savedFilters))
    } catch (error) {
      console.error('Failed to save filters:', error)
    }
  }, [savedFilters])

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }, [])

  const saveCurrentFilters = useCallback((name: string) => {
    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      filters: { ...filters },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSavedFilters(prev => [...prev, newFilter])
    return newFilter
  }, [filters])

  const loadSavedFilters = useCallback((savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters)
  }, [])

  const deleteSavedFilter = useCallback((filterId: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== filterId))
  }, [])

  const updateSavedFilter = useCallback((filterId: string, updates: Partial<Omit<SavedFilter, 'id' | 'createdAt'>>) => {
    setSavedFilters(prev => prev.map(filter =>
      filter.id === filterId
        ? { ...filter, ...updates, updatedAt: new Date() }
        : filter
    ))
  }, [])

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null && value !== ''
    })
  }, [filters])

  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null && value !== ''
    }).length
  }, [filters])

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','))
        } else if (value instanceof Date) {
          params.set(key, value.toISOString())
        } else if (typeof value === 'object' && value.from && value.to) {
          // Handle date range
          params.set(`${key}_from`, value.from.toISOString())
          params.set(`${key}_to`, value.to.toISOString())
        } else {
          params.set(key, String(value))
        }
      }
    })

    return params
  }, [filters])

  const exportFilters = useCallback(() => {
    return {
      filters,
      savedFilters,
      timestamp: new Date().toISOString()
    }
  }, [filters, savedFilters])

  const importFilters = useCallback((data: {
    filters?: FilterState
    savedFilters?: SavedFilter[]
  }) => {
    if (data.filters) {
      setFilters(data.filters)
    }
    if (data.savedFilters) {
      setSavedFilters(data.savedFilters.map(filter => ({
        ...filter,
        createdAt: new Date(filter.createdAt),
        updatedAt: new Date(filter.updatedAt)
      })))
    }
  }, [])

  return {
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    clearFilter,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
    updateSavedFilter,
    hasActiveFilters,
    getActiveFilterCount,
    buildQueryParams,
    exportFilters,
    importFilters
  }
}