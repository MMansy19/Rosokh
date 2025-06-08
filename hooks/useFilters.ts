"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilterState, ViewMode } from "@/types/audio";

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
 * Automatically initializes search term from URL parameters for global search integration
 */
export const useFilters = (): UseFiltersReturn => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    quality: "all",
    reciter: "all",
    showFavoritesOnly: false,
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Initialize search term from URL parameters (for global search integration)
  useEffect(() => {
    const urlSearchTerm = searchParams.get("q");
    if (urlSearchTerm && urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  const clearFilters = () => {
    setFilters({
      category: "all",
      quality: "all",
      reciter: "all",
      showFavoritesOnly: false,
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
    clearFilters,
  };
};
