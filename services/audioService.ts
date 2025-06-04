import { AudioTrack } from "@/types/audio";
import { BaseService } from "./BaseService";
import { withErrorHandling } from "../utils/errorHandling";

export interface AudioService {
  fetchTracks(): Promise<AudioTrack[]>;
  searchTracks(query: string): Promise<AudioTrack[]>;
  getTrackById(id: string): Promise<AudioTrack | null>;
  validateTrackUrl(url: string): Promise<boolean>;
  clearCache(): void;
  invalidateCache(pattern?: string): void;
  preloadTrack(id: string): Promise<void>;
  batchFetchTracks(ids: string[]): Promise<AudioTrack[]>;
  getAudioServiceMetrics(): any;
}

class AudioServiceImpl extends BaseService implements AudioService {
  constructor() {
    super({
      baseUrl: "/api",
      timeout: 10000,
      retries: 3,
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        staleWhileRevalidate: true,
      },
    });
  }

  async fetchTracks(): Promise<AudioTrack[]> {
    return await this.fetchWithErrorHandling<AudioTrack[]>("/audio-data", {
      cacheKey: "audio-tracks",
    });
  }

  async searchTracks(query: string): Promise<AudioTrack[]> {
    if (!query.trim()) {
      return [];
    }

    return await this.fetchWithErrorHandling<AudioTrack[]>(
      `/audio-data?search=${encodeURIComponent(query)}`,
      {
        cacheKey: `search-${query}`,
        retries: 2, // fewer retries for search
      },
    );
  }

  async getTrackById(id: string): Promise<AudioTrack | null> {
    return await withErrorHandling(async () => {
      return await this.fetchWithErrorHandling<AudioTrack>(
        `/audio-data/${id}`,
        {
          cacheKey: `track-${id}`,
        },
      );
    });
  }

  async validateTrackUrl(url: string): Promise<boolean> {
    return (
      (await withErrorHandling(async () => {
        // Use HEAD request to validate URL without downloading content
        const response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        return response.ok;
      })) ?? false
    );
  }

  // Cache management methods
  clearCache(): void {
    super.clearCache();
  }

  invalidateCache(pattern?: string): void {
    super.clearCache(pattern);
  }

  // Additional audio-specific methods
  async preloadTrack(id: string): Promise<void> {
    try {
      await this.getTrackById(id);
    } catch (error) {
      // Silently fail preloading - this is a performance optimization
      console.warn(`Failed to preload track ${id}:`, error);
    }
  }

  async batchFetchTracks(ids: string[]): Promise<AudioTrack[]> {
    const promises = ids.map((id) => this.getTrackById(id));
    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<AudioTrack | null> =>
          result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value as AudioTrack);
  }
  // Performance monitoring specific to audio service
  getAudioServiceMetrics() {
    const baseMetrics = this.getPerformanceMetrics();
    const cacheStats = this.getCacheStats();

    return {
      baseMetrics,
      cacheStats,
      serviceName: "AudioService",
      requestCount: Array.isArray(baseMetrics) ? baseMetrics.length : 0,
      averageResponseTime:
        Array.isArray(baseMetrics) && baseMetrics.length > 0
          ? baseMetrics.reduce(
              (sum: number, metric: any) => sum + (metric.average || 0),
              0,
            ) / baseMetrics.length
          : 0,
    };
  }
}

// Singleton instance
export const audioService = new AudioServiceImpl();

// Factory function for testing
export function createAudioService(): AudioService {
  return new AudioServiceImpl();
}
