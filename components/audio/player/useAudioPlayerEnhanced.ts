import { useMemo } from 'react';
import { AudioTrack } from '@/types/audio';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useGlobalError } from '@/contexts/GlobalContext';

interface UseAudioPlayerEnhancedProps {
  track: AudioTrack;
}

export const useAudioPlayerEnhanced = ({ track }: UseAudioPlayerEnhancedProps) => {
  const { setError } = useGlobalError();
  
  const {
    iframeLoading,
    audioReady,
    estimatedDuration,
    audioError,
    handleIframeLoad,
    handleIframeError
  } = useAudioPlayer();

  // Enhanced iframe load handler with error reporting
  const enhancedHandleIframeLoad = useMemo(() => {
    return () => {      try {
        handleIframeLoad(track.category);
      } catch (error) {
        setError(`Failed to load audio player: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }    };
  }, [handleIframeLoad, track.category, setError]);

  // Enhanced iframe error handler with error reporting
  const enhancedHandleIframeError = useMemo(() => {
    return () => {try {
        handleIframeError();
      } catch (error) {
        setError(`Audio player encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }    };
  }, [handleIframeError, setError]);
  // Memoized player state
  const playerState = useMemo(() => ({
    iframeLoading,
    audioReady,
    estimatedDuration,
    audioError,
    isLoading: iframeLoading,
    hasError: !!audioError,
    isReady: audioReady && !iframeLoading && !audioError
  }), [iframeLoading, audioReady, estimatedDuration, audioError]);

  return {
    ...playerState,
    handleIframeLoad: enhancedHandleIframeLoad,
    handleIframeError: enhancedHandleIframeError
  };
};
