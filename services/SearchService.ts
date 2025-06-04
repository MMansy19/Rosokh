import { BaseService } from "./BaseService";
import { AudioTrack } from "@/types/audio";
import { withErrorHandling } from "../utils/errorHandling";

export interface SearchFilters {
  category?: string;
  reciter?: string;
  duration?: { min?: number; max?: number };
  quality?: string;
  language?: string;
  dateRange?: { start?: string; end?: string };
}

export interface SearchResult {
  tracks: AudioTrack[];
  totalCount: number;
  facets: SearchFacets;
  suggestions: string[];
  searchTime: number;
}

export interface SearchFacets {
  categories: Array<{ name: string; count: number }>;
  reciters: Array<{ name: string; count: number }>;
  languages: Array<{ name: string; count: number }>;
  durations: Array<{ range: string; count: number }>;
}

export interface SearchHistory {
  query: string;
  timestamp: string;
  resultCount: number;
  filters?: SearchFilters;
}

export interface SearchService {
  search(
    query: string,
    filters?: SearchFilters,
    pagination?: { page: number; limit: number },
  ): Promise<SearchResult>;
  getPopularSearches(): Promise<string[]>;
  getSearchSuggestions(query: string): Promise<string[]>;
  getSearchHistory(): Promise<SearchHistory[]>;
  saveSearch(
    query: string,
    resultCount: number,
    filters?: SearchFilters,
  ): Promise<void>;
  clearSearchHistory(): Promise<void>;
  getAdvancedFilters(): Promise<{ [key: string]: string[] }>;
}

class SearchServiceImpl extends BaseService implements SearchService {
  private searchIndex: Map<string, any> = new Map();
  private popularSearches: string[] = [];

  constructor() {
    super({
      baseUrl: "/api/search",
      timeout: 10000,
      retries: 2,
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes for search results
        maxSize: 200,
        staleWhileRevalidate: true,
      },
    });

    this.initializeSearchIndex();
  }

  private async initializeSearchIndex(): Promise<void> {
    try {
      // In a real implementation, this would build a search index
      // For now, we'll simulate with popular searches
      this.popularSearches = [
        "quran recitation",
        "surah al-fatiha",
        "islamic lectures",
        "nasheed",
        "duas",
        "tafsir",
        "hadith",
        "quranic studies",
      ];
    } catch (error) {
      console.warn("Failed to initialize search index:", error);
    }
  }

  async search(
    query: string,
    filters: SearchFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 },
  ): Promise<SearchResult> {
    const startTime = performance.now();

    // Create cache key based on query, filters, and pagination
    const cacheKey = `search-${this.hashSearchParams(query, filters, pagination)}`;

    const result = await this.fetchWithErrorHandling<SearchResult>("/tracks", {
      method: "POST",
      body: JSON.stringify({
        query: query.trim(),
        filters,
        pagination,
      }),
      cacheKey,
    });

    // Record search analytics
    this.recordSearchAnalytics(query, filters, result.totalCount);

    // Update search suggestions
    this.updateSearchSuggestions(query);

    const endTime = performance.now();
    result.searchTime = endTime - startTime;

    return result;
  }

  async getPopularSearches(): Promise<string[]> {
    return await this.fetchWithErrorHandling<string[]>("/popular", {
      cacheKey: "popular-searches",
    });
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) {
      return this.popularSearches.slice(0, 5);
    }

    return await this.fetchWithErrorHandling<string[]>(
      `/suggestions?q=${encodeURIComponent(query)}`,
      {
        cacheKey: `suggestions-${query.toLowerCase()}`,
        retries: 1, // Fewer retries for suggestions
      },
    );
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return (
      (await withErrorHandling(async () => {
        return await this.fetchWithErrorHandling<SearchHistory[]>("/history", {
          cacheKey: "search-history",
        });
      })) || []
    );
  }

  async saveSearch(
    query: string,
    resultCount: number,
    filters?: SearchFilters,
  ): Promise<void> {
    // Fire and forget - don't block UI
    this.fetchWithErrorHandling("/history", {
      method: "POST",
      body: JSON.stringify({
        query: query.trim(),
        resultCount,
        filters,
        timestamp: new Date().toISOString(),
      }),
      skipCache: true,
    }).catch((error) => {
      console.warn("Failed to save search history:", error);
    });

    // Invalidate search history cache
    this.clearCache("search-history");
  }

  async clearSearchHistory(): Promise<void> {
    await this.fetchWithErrorHandling("/history", {
      method: "DELETE",
      skipCache: true,
    });

    this.clearCache("search-history");
  }

  async getAdvancedFilters(): Promise<{ [key: string]: string[] }> {
    return await this.fetchWithErrorHandling<{ [key: string]: string[] }>(
      "/filters",
      {
        cacheKey: "advanced-filters",
      },
    );
  }

  // Client-side search optimization
  async searchWithAutoComplete(query: string): Promise<{
    results: SearchResult;
    suggestions: string[];
  }> {
    const [results, suggestions] = await Promise.all([
      this.search(query),
      this.getSearchSuggestions(query),
    ]);

    return { results, suggestions };
  }

  // Fuzzy search for better user experience
  async fuzzySearch(
    query: string,
    threshold: number = 0.7,
  ): Promise<SearchResult> {
    // Implement fuzzy search logic
    const normalizedQuery = this.normalizeQuery(query);

    return await this.search(normalizedQuery);
  }

  // Search analytics
  private async recordSearchAnalytics(
    query: string,
    filters: SearchFilters,
    resultCount: number,
  ): Promise<void> {
    // Record search metrics for analytics
    const searchMetric = {
      query,
      filters,
      resultCount,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
    };

    // In production, send to analytics service
    console.log("Search analytics:", searchMetric);
  }

  private updateSearchSuggestions(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();

    if (
      normalizedQuery.length > 1 &&
      !this.popularSearches.includes(normalizedQuery)
    ) {
      // Add to local suggestions (in production, this would update server-side)
      this.popularSearches.unshift(normalizedQuery);
      this.popularSearches = this.popularSearches.slice(0, 20); // Keep top 20
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " "); // Normalize whitespace
  }

  private hashSearchParams(
    query: string,
    filters: SearchFilters,
    pagination: { page: number; limit: number },
  ): string {
    const params = {
      query: this.normalizeQuery(query),
      filters,
      pagination,
    };

    // Simple hash function for cache key
    return btoa(JSON.stringify(params)).slice(0, 20);
  }

  // Real-time search with debouncing
  createDebouncedSearch(
    delay: number = 300,
  ): (query: string) => Promise<SearchResult> {
    let timeoutId: NodeJS.Timeout;
    let currentQuery: string = "";

    return (query: string): Promise<SearchResult> => {
      currentQuery = query;

      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(async () => {
          // Only search if this is still the current query
          if (query === currentQuery) {
            try {
              const result = await this.search(query);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        }, delay);
      });
    };
  }

  // Search performance metrics
  getSearchMetrics() {
    const baseMetrics = this.getPerformanceMetrics();
    const cacheStats = this.getCacheStats();

    return {
      baseMetrics,
      cacheStats,
      serviceName: "SearchService",
      popularSearchesCount: this.popularSearches.length,
      searchIndexSize: this.searchIndex.size,
    };
  }
}

// Singleton instance
export const searchService = new SearchServiceImpl();

// Factory function for testing
export function createSearchService(): SearchService {
  return new SearchServiceImpl();
}
