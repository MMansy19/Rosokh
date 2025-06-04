"use client";
import { useState } from 'react';
import { FilterState, ViewMode } from '../types/audio';

interface UseFiltersReturn {
  searchTerm: string;
  filters: FilterState;
  viewMode: ViewMode;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: FilterState) => void;
  setViewMode: (mode: ViewMode) => void;
  clearFilters: () => void;
}

/**
 * Custom hook for managing filter and view state
 */
export const useFilters = (): UseFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    quality: "all",
    showFavoritesOnly: false
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const clearFilters = () => {
    setFilters({
      category: "all",
      quality: "all",
      showFavoritesOnly: false
    });
    setSearchTerm("");
  };

  return {
    searchTerm,
    filters,
    viewMode,
    setSearchTerm,
    setFilters,
    setViewMode,
    clearFilters
  };
};
