import { useState, useEffect, useRef } from "react";
import { AudioPlayerState, RepeatMode } from "../types";
import { API_ENDPOINTS } from "../constants";
import { AnalyticsService } from "@/services/AnalyticsService";
import { useNotifications } from "@/contexts/GlobalContext";

export const useAudioPlayer = (messages: any) => {
  const { notify } = useNotifications();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioPlayer, setAudioPlayer] = useState<AudioPlayerState>({
    isPlaying: false,
    currentAyah: null,
    currentSurah: 1,
    volume: 0.8,
    speed: 1.0,
    isMuted: false,
    reciter: "7", // Default to Abdul Rahman Al-Sudais
  });

  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [autoPlay, setAutoPlay] = useState(false);

  const playAyah = async (ayahNumber: number, surahNumber: number) => {
    try {
      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent("ayah_play", "engagement", {
        surahNumber,
        ayahNumber,
        reciter: audioPlayer.reciter,
        speed: audioPlayer.speed,
        volume: audioPlayer.volume,
      });

      const paddedSurah = surahNumber.toString().padStart(3, "0");
      const paddedAyah = ayahNumber.toString().padStart(3, "0");
      const audioUrl = API_ENDPOINTS.audio(
        audioPlayer.reciter,
        paddedSurah,
        paddedAyah,
      );

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = audioPlayer.speed;
        audioRef.current.volume = audioPlayer.isMuted ? 0 : audioPlayer.volume;

        await audioRef.current.play();
        setAudioPlayer((prev) => ({
          ...prev,
          isPlaying: true,
          currentAyah: ayahNumber,
          currentSurah: surahNumber,
        }));
      }
    } catch (error) {
      console.error("Error playing audio:", error);

      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent("ayah_play_error", "error", {
        surahNumber,
        ayahNumber,
        error: error instanceof Error ? error.message : "Unknown error",
        reciter: audioPlayer.reciter,
      });

      notify.error(
        messages?.quran?.errors?.audioPlay ||
          "Failed to play audio. Please check your connection and try again.",
      );
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlayer((prev) => ({ ...prev, isPlaying: false }));

      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent("ayah_pause", "engagement", {
        surahNumber: audioPlayer.currentSurah,
        ayahNumber: audioPlayer.currentAyah,
        playbackPosition: audioRef.current.currentTime,
        duration: audioRef.current.duration,
      });
    }
  };

  const togglePlayPause = () => {
    if (audioPlayer.isPlaying) {
      pauseAudio();
    } else if (audioPlayer.currentAyah && audioPlayer.currentSurah) {
      playAyah(audioPlayer.currentAyah, audioPlayer.currentSurah);
    }
  };

  const updateVolume = (volume: number) => {
    setAudioPlayer((prev) => ({ ...prev, volume }));
    if (audioRef.current && !audioPlayer.isMuted) {
      audioRef.current.volume = volume;
    }
  };

  const toggleMute = () => {
    setAudioPlayer((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    if (audioRef.current) {
      audioRef.current.volume = audioPlayer.isMuted ? audioPlayer.volume : 0;
    }
  };

  const updateSpeed = (speed: number) => {
    setAudioPlayer((prev) => ({ ...prev, speed }));
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const updateReciter = (reciter: string) => {
    setAudioPlayer((prev) => ({ ...prev, reciter }));
  };

  return {
    audioRef,
    audioPlayer,
    repeatMode,
    autoPlay,
    playAyah,
    pauseAudio,
    togglePlayPause,
    updateVolume,
    toggleMute,
    updateSpeed,
    updateReciter,
    setRepeatMode,
    setAutoPlay,
  };
};
