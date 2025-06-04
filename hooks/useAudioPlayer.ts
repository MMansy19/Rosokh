"use client";
import { useState } from 'react';
import { AudioPlayerState } from '@/types/audio';
import { getEstimatedDuration } from '@/utils/audioUtils';

interface UseAudioPlayerReturn extends AudioPlayerState {
  setIframeLoading: (loading: boolean) => void;
  setAudioReady: (ready: boolean) => void;
  setAudioError: (error: string | null) => void;
  handleIframeLoad: (category: string) => void;
  handleIframeError: () => void;
  resetPlayerState: () => void;
}

/**
 * Custom hook for managing audio player state
 */
export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [iframeLoading, setIframeLoading] = useState<boolean>(false);
  const [audioReady, setAudioReady] = useState<boolean>(false);
  const [estimatedDuration, setEstimatedDuration] = useState<string>("Loading...");
  const [audioError, setAudioError] = useState<string | null>(null);

  const handleIframeLoad = (category: string) => {
    setIframeLoading(false);
    setTimeout(() => setAudioReady(true), 1000);
    setAudioError(null);
    setEstimatedDuration(getEstimatedDuration(category));
    
    // Hide ready indicator after 4 seconds
    setTimeout(() => setAudioReady(false), 4000);
  };

  const handleIframeError = () => {
    setIframeLoading(false);
    setAudioError('Failed to load audio');
    setAudioReady(false);
  };

  const resetPlayerState = () => {
    setIframeLoading(true);
    setAudioReady(false);
    setAudioError(null);
    setEstimatedDuration("Loading...");
  };

  return {
    iframeLoading,
    audioReady,
    estimatedDuration,
    audioError,
    setIframeLoading,
    setAudioReady,
    setAudioError,
    handleIframeLoad,
    handleIframeError,
    resetPlayerState
  };
};
