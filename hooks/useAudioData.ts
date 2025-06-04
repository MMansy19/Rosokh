import { useState, useEffect } from 'react';
import { AudioTrack, Reciter, Surah, AudioData, ReciterData } from '@/types/audio';
import { generateAudioTracks } from '../utils/audioUtils';
import { API_ENDPOINTS } from '../constants/audio';

interface UseAudioDataReturn {
  data: {
    tracks: AudioTrack[];
    reciters: Reciter[];
    surahs: Surah[];
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching and managing audio data
 */
export const useAudioData = (): UseAudioDataReturn => {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [audioResponse, recitersResponse] = await Promise.all([
          fetch(API_ENDPOINTS.audioTracks, { signal: abortController.signal }),
          fetch(API_ENDPOINTS.reciters, { signal: abortController.signal })
        ]);

        if (!audioResponse.ok || !recitersResponse.ok) {
          throw new Error("Failed to load data");
        }

        const [audioData, recitersData]: [AudioData, ReciterData] = await Promise.all([
          audioResponse.json(),
          recitersResponse.json()
        ]);

        const generatedTracks = generateAudioTracks(audioData, recitersData);

        setSurahs(audioData.surahs);
        setReciters(recitersData.reciters);
        setAudioTracks(generatedTracks);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error loading audio data:", error);
          setError(error instanceof Error ? error.message : "Failed to load data");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      abortController.abort();
    };
  }, []);
  const refetch = () => {
    setIsLoading(true);
    setError(null);
    // The useEffect will handle the actual refetch
  };

  return {
    data: isLoading || error ? null : {
      tracks: audioTracks,
      reciters,
      surahs
    },
    loading: isLoading,
    error,
    refetch
  };
};
