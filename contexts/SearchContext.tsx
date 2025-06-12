"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { searchService } from "@/services/SearchService";

interface SearchState {
  query: string;
  context: "quran" | "audio" | "youtube" | "all";
  filters: Record<string, any>;
  results: any[];
  isLoading: boolean;
  suggestions: string[];
  recentSearches: string[];
  popularSearches: string[];
  totalCount: number;
  searchTime: number;
  error: string | null;
}

interface SearchContextType {
  state: SearchState;
  actions: {
    setQuery: (query: string) => void;
    setContext: (context: SearchState["context"]) => void;
    setFilters: (filters: Record<string, any>) => void;
    performSearch: (query?: string, context?: string) => Promise<void>;
    clearSearch: () => void;
    clearHistory: () => void;
    saveSearchToHistory: (query: string) => void;
    navigateToSearch: (query: string, context?: string) => void;
  };
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function SearchProvider({ children, locale }: SearchProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<SearchState>({
    query: "",
    context: "all",
    filters: {},
    results: [],
    isLoading: false,
    suggestions: [],
    recentSearches: [],
    popularSearches: [],
    totalCount: 0,
    searchTime: 0,
    error: null,
  });

  // Initialize search state from URL parameters
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const context =
      (searchParams.get("context") as SearchState["context"]) ||
      detectContextFromPath();

    setState((prev) => ({
      ...prev,
      query,
      context,
    }));

    // Perform search if query exists
    if (query) {
      performSearch(query, context);
    }
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Detect search context from current path
  const detectContextFromPath = (): SearchState["context"] => {
    const path = pathname.split("/")[2]; // Remove locale prefix
    switch (path) {
      case "quran":
        return "quran";
      case "audio":
        return "audio";
      case "youtube":
        return "youtube";
      default:
        return "all";
    }
  };

  // Load popular searches and recent searches
  const loadInitialData = async () => {
    try {
      const [popular, recent] = await Promise.all([
        searchService.getPopularSearches(),
        loadRecentSearches(),
      ]);

      setState((prev) => ({
        ...prev,
        popularSearches: popular,
        recentSearches: recent,
      }));
    } catch (error) {
      console.error("Failed to load search data:", error);
    }
  };

  // Load recent searches from localStorage
  const loadRecentSearches = (): string[] => {
    try {
      const saved = localStorage.getItem("global_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Save search to recent searches
  const saveSearchToHistory = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const updated = [
      trimmedQuery,
      ...state.recentSearches.filter((s) => s !== trimmedQuery),
    ].slice(0, 10);

    setState((prev) => ({
      ...prev,
      recentSearches: updated,
    }));

    localStorage.setItem("global_recent_searches", JSON.stringify(updated));
  };

  // Perform search
  const performSearch = async (
    query?: string,
    context?: string,
  ): Promise<void> => {
    const searchQuery = query || state.query;
    const searchContext = context || state.context;

    if (!searchQuery.trim()) {
      setState((prev) => ({
        ...prev,
        results: [],
        totalCount: 0,
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const startTime = performance.now();

      // Build filters based on context
      const contextFilters = buildContextFilters(searchContext);
      const searchFilters = { ...state.filters, ...contextFilters };

      // Perform search using SearchService
      const result = await searchService.search(searchQuery, searchFilters);

      const endTime = performance.now();

      // Save search analytics
      await searchService.saveSearch(
        searchQuery,
        result.totalCount,
        searchFilters,
      );

      // Save to recent searches
      saveSearchToHistory(searchQuery);

      setState((prev) => ({
        ...prev,
        results: result.tracks || [],
        totalCount: result.totalCount,
        searchTime: endTime - startTime,
        suggestions: result.suggestions || [],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Search failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Search failed",
        results: [],
        totalCount: 0,
      }));
    }
  };

  // Build context-specific filters
  const buildContextFilters = (context: string): Record<string, any> => {
    switch (context) {
      case "quran":
        return {
          category: "quran",
          type: "recitation",
        };
      case "audio":
        return {
          type: "audio",
        };
      case "youtube":
        return {
          type: "video",
          source: "youtube",
        };
      default:
        return {};
    }
  };

  // Navigate to search page with query
  const navigateToSearch = (query: string, context?: string) => {
    const searchContext = context || state.context;
    const targetRoute = getRouteForContext(searchContext);

    const params = new URLSearchParams();
    params.set("q", query);
    if (searchContext !== "all") {
      params.set("context", searchContext);
    }

    router.push(`/${locale}${targetRoute}?${params.toString()}`);
  };

  // Get route for search context
  const getRouteForContext = (context: string): string => {
    switch (context) {
      case "quran":
        return "/quran";
      case "audio":
        return "/audio";
      case "youtube":
        return "/youtube";
      default:
        return "/search";
    }
  };

  // Action handlers
  const setQuery = (query: string) => {
    setState((prev) => ({ ...prev, query }));
  };

  const setContext = (context: SearchState["context"]) => {
    setState((prev) => ({ ...prev, context }));
  };

  const setFilters = (filters: Record<string, any>) => {
    setState((prev) => ({ ...prev, filters }));
  };

  const clearSearch = () => {
    setState((prev) => ({
      ...prev,
      query: "",
      results: [],
      totalCount: 0,
      error: null,
      suggestions: [],
    }));
  };

  const clearHistory = () => {
    setState((prev) => ({ ...prev, recentSearches: [] }));
    localStorage.removeItem("global_recent_searches");
  };

  const contextValue: SearchContextType = {
    state,
    actions: {
      setQuery,
      setContext,
      setFilters,
      performSearch,
      clearSearch,
      clearHistory,
      saveSearchToHistory,
      navigateToSearch,
    },
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

// Hook to use search context
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

// Hook for search suggestions with debouncing
export function useSearchSuggestions(query: string, delay: number = 300) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const result = await searchService.getSearchSuggestions(query);
        setSuggestions(result);
      } catch (error) {
        console.error("Failed to get suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return { suggestions, isLoading };
}
