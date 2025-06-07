import { useState, useEffect, useCallback, useMemo } from "react";
import { AudioTrack, Reciter, Surah } from "@/types/audio";

interface useAudioDataReturn {
  data: {
    tracks: AudioTrack[];
    reciters: Reciter[];
    surahs: Surah[];
  } | null;
  loading: boolean;
  error: string | null;
  refetch: (filters?: { reciter?: string; surah?: string }) => void;
}

/**
 * Enhanced audio data hook that loads Quran audio data from the new API
 */
export const useAudioData = (filters?: { reciter?: string; surah?: string }): useAudioDataReturn => {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize filter values to prevent unnecessary re-renders
  const filterKey = useMemo(() => {
    return JSON.stringify({
      reciter: filters?.reciter || 'all',
      surah: filters?.surah || 'all'
    });
  }, [filters?.reciter, filters?.surah]);

  const loadData = useCallback(async (currentFilters?: { reciter?: string; surah?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (currentFilters?.reciter && currentFilters.reciter !== 'all') {
        params.append('reciter', currentFilters.reciter);
      }
      if (currentFilters?.surah && currentFilters.surah !== 'all') {
        params.append('surah', currentFilters.surah);
      }

      const url = `/api/audio${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch audio data: ${response.statusText}`);
      }

      const data = await response.json();
      
      setAudioTracks(data.tracks || []);
      setReciters(data.reciters || []);
      setSurahs(data.surahs || []);
    } catch (err) {
      console.error("Error loading audio data:", err);      setError(err instanceof Error ? err.message : "Failed to load audio data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filters);
  }, [filterKey, loadData]);

  const refetch = useCallback((newFilters?: { reciter?: string; surah?: string }) => {
    loadData(newFilters || filters);
  }, [filters, loadData]);
  return {
    data: audioTracks.length > 0 || reciters.length > 0 ? {
      tracks: audioTracks,
      reciters,
      surahs,
    } : null,
    loading: isLoading,
    error,
    refetch,
  };
};
