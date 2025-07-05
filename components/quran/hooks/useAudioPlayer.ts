import { useState, useEffect, useRef } from "react";
import { AudioPlayerState, RepeatMode } from "../types";
import { quranService } from "@/services/quranService";
import { RECITERS } from "../constants";
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
    reciter: "ar.alafasy", // Default to Mishary Alafasy (Al Quran Cloud format)
  });

  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [autoPlay, setAutoPlay] = useState(false);

  // Load saved reciter from localStorage on component mount
  useEffect(() => {
    const savedReciter = localStorage.getItem('quran_selected_reciter');
    if (savedReciter && RECITERS.find(r => r.id === savedReciter)) {
      setAudioPlayer(prev => ({ ...prev, reciter: savedReciter }));
    }
  }, []);

  // Save reciter selection to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('quran_selected_reciter', audioPlayer.reciter);
  }, [audioPlayer.reciter]);

  // Auto-play next ayah when current ayah ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (autoPlay && audioPlayer.currentAyah && audioPlayer.currentSurah) {
        // Auto-play logic based on repeat mode
        if (repeatMode === "verse") {
          // Will be handled by the component that uses this hook
          console.log(`Repeat mode: verse - should replay ayah ${audioPlayer.currentAyah}`);
        } else {
          // Try to play next ayah - will be handled by the component
          console.log(`Auto-play ended for ayah ${audioPlayer.currentAyah} in surah ${audioPlayer.currentSurah}`);
        }
      }
      
      // Reset playing state when audio ends
      setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [audioPlayer.currentAyah, audioPlayer.currentSurah, autoPlay, repeatMode]);

  // Handle audio errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = (error: Event) => {
      console.error('Audio playback error:', error);
      setAudioPlayer(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('error', handleError);
    return () => audio.removeEventListener('error', handleError);
  }, []);

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

      // Validate and get working reciter
      const workingReciter = await quranService.getWorkingReciter(audioPlayer.reciter);
      if (workingReciter !== audioPlayer.reciter) {
        notify.info(
          messages?.quran?.reciterNotAvailable?.replace("{name}", audioPlayer.reciter) ||
          `${audioPlayer.reciter} not available, using ${workingReciter}`,
        );
        setAudioPlayer(prev => ({ ...prev, reciter: workingReciter }));
      }

      // Calculate absolute ayah number for Al Quran Cloud API
      // Get surah data to calculate correct ayah number
      const surahData = await quranService.getSurah(surahNumber);
      const targetAyah = surahData.ayahs.find(ayah => ayah.numberInSurah === ayahNumber);
      
      if (!targetAyah) {
        throw new Error(`Ayah ${ayahNumber} not found in Surah ${surahNumber}`);
      }

      // Try different audio URLs with fallback using the working reciter
      const audioUrls = quranService.getAyahAudioUrls(targetAyah.number, workingReciter, surahNumber);

      let audioUrl = "";
      let urlWorked = false;

      // Test each URL to find one that works
      for (let i = 0; i < audioUrls.length; i++) {
        const url = audioUrls[i];
        console.log(`Testing audio URL ${i + 1}/${audioUrls.length}: ${url}`);
        
        try {
          // Skip availability check for proxy URLs as they should work
          const isProxy = url.startsWith('/api/audio/proxy');
          
          if (isProxy) {
            // For proxy URLs, just try to use them directly
            audioUrl = url;
            urlWorked = true;
            console.log(`Using proxy URL: ${url}`);
            break;
          } else {
            // For direct URLs, check availability first
            const isAvailable = await quranService.checkAudioAvailability(url);
            console.log(`URL ${url} availability: ${isAvailable}`);
            
            if (isAvailable) {
              audioUrl = url;
              urlWorked = true;
              console.log(`Using audio URL: ${url}`);
              break;
            }
          }
        } catch (checkError) {
          console.warn(`Error checking URL ${url}:`, checkError);
          continue;
        }
      }

      // If no URL worked through availability check, try proxy URLs directly
      if (!urlWorked) {
        console.warn("No URLs passed availability check, trying proxy URLs directly");
        const proxyUrls = audioUrls.filter(url => url.startsWith('/api/audio/proxy'));
        if (proxyUrls.length > 0) {
          audioUrl = proxyUrls[0];
          urlWorked = true;
          console.log(`Using proxy URL: ${audioUrl}`);
        } else {
          // Last resort: try the first URL directly
          console.warn("No proxy URLs available, trying first URL directly");
          audioUrl = audioUrls[0];
          urlWorked = true;
          console.log(`Using first URL as last resort: ${audioUrl}`);
        }
      }

      if (!urlWorked || !audioUrl) {
        throw new Error("No working audio URL found");
      }

      if (audioRef.current) {
        // Stop current audio if playing and wait for it to properly stop
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          // Wait a bit for the pause to take effect
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        let playAttempts = 0;
        const maxAttempts = Math.min(audioUrls.length, 5); // Limit attempts to prevent infinite loops
        
        const attemptPlay = async (urlToTry: string): Promise<void> => {
          playAttempts++;
          console.log(`Ayah play attempt ${playAttempts}/${maxAttempts} with URL: ${urlToTry}`);
          
          return new Promise((resolve, reject) => {
            if (!audioRef.current) {
              reject(new Error("Audio element not available"));
              return;
            }

            const handleSuccess = () => {
              console.log(`Successfully started playing ayah from: ${urlToTry}`);
              setAudioPlayer((prev) => ({
                ...prev,
                isPlaying: true,
                currentAyah: ayahNumber,
                currentSurah: surahNumber,
              }));
              resolve();
            };

            const handleError = async (error: any) => {
              console.error(`Ayah play attempt ${playAttempts} failed:`, error);
              
              if (playAttempts < maxAttempts && playAttempts < audioUrls.length) {
                // Try next URL
                const nextUrl = audioUrls[playAttempts];
                console.log(`Trying next ayah URL: ${nextUrl}`);
                
                // Wait a bit before trying the next URL
                setTimeout(async () => {
                  try {
                    await attemptPlay(nextUrl);
                    resolve();
                  } catch (nextError) {
                    reject(nextError);
                  }
                }, 200);
              } else {
                reject(error);
              }
            };

            // Set up the audio source
            audioRef.current.src = urlToTry;
            audioRef.current.playbackRate = audioPlayer.speed;
            audioRef.current.volume = audioPlayer.isMuted ? 0 : audioPlayer.volume;
            
            // Load the audio first, then play
            audioRef.current.load();
            
            // Wait a moment for the load to register, then try to play
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play()
                  .then(handleSuccess)
                  .catch(handleError);
              }
            }, 100);
          });
        };

        try {
          await attemptPlay(audioUrl);
        } catch (finalError) {
          console.error(`All ayah play attempts failed:`, finalError);
          throw new Error(`Failed to play audio: ${finalError instanceof Error ? finalError.message : 'Unknown playback error'}`);
        }
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

  const playSurah = async (surahNumber: number) => {
    console.log("Playing surah:", surahNumber);
    try {
      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent("surah_play", "engagement", {
        surahNumber,
        reciter: audioPlayer.reciter,
      });

      // Validate and get working reciter
      const workingReciter = await quranService.getWorkingReciter(audioPlayer.reciter);
      if (workingReciter !== audioPlayer.reciter) {
        notify.info(
          messages?.quran?.reciterNotAvailable?.replace("{name}", audioPlayer.reciter) ||
          `${audioPlayer.reciter} not available, using ${workingReciter}`,
        );
        setAudioPlayer(prev => ({ ...prev, reciter: workingReciter }));
      }

      // Try different audio URLs with fallback using the working reciter
      const audioUrls = quranService.getSurahAudioUrls(surahNumber, workingReciter);

      let audioUrl = "";
      let urlWorked = false;

      for (const url of audioUrls) {
        console.log(`Testing surah audio URL: ${url}`);
        
        try {
          // Skip availability check for proxy URLs as they should work
          const isProxy = url.startsWith('/api/audio/proxy');
          
          if (isProxy) {
            // For proxy URLs, just try to use them directly
            audioUrl = url;
            urlWorked = true;
            console.log(`Using proxy surah URL: ${url}`);
            break;
          } else {
            // For direct URLs, check availability first
            const isAvailable = await quranService.checkAudioAvailability(url);
            console.log(`Surah URL ${url} availability: ${isAvailable}`);
            
            if (isAvailable) {
              audioUrl = url;
              urlWorked = true;
              console.log(`Using surah audio URL: ${url}`);
              break;
            }
          }
        } catch (checkError) {
          console.warn(`Error checking surah URL ${url}:`, checkError);
          continue;
        }
      }

      // If no URL worked through availability check, try proxy URLs first, then fallback
      if (!urlWorked) {
        console.warn("No surah URLs passed availability check, trying proxy URLs directly");
        const proxyUrls = audioUrls.filter(url => url.startsWith('/api/audio/proxy'));
        if (proxyUrls.length > 0) {
          audioUrl = proxyUrls[0];
          urlWorked = true;
          console.log(`Using proxy surah URL: ${audioUrl}`);
        } else if (audioUrls.length > 0) {
          // Last resort: try the first URL directly
          console.warn("No proxy URLs available, trying first surah URL directly");
          audioUrl = audioUrls[0];
          urlWorked = true;
          console.log(`Using first surah URL as last resort: ${audioUrl}`);
        }
      }

      if (!urlWorked || !audioUrl) {
        throw new Error("No working surah audio URL found");
      }

      if (audioRef.current) {
        // Stop current audio if playing and wait for it to properly stop
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          // Wait a bit for the pause to take effect
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        let playAttempts = 0;
        const maxAttempts = audioUrls.length;
        
        const attemptPlaySurah = async (urlToTry: string): Promise<void> => {
          playAttempts++;
          console.log(`Surah play attempt ${playAttempts}/${maxAttempts} with URL: ${urlToTry}`);
          
          return new Promise((resolve, reject) => {
            if (!audioRef.current) {
              reject(new Error("Audio element not available"));
              return;
            }

            const handleSuccess = () => {
              console.log(`Successfully started playing surah from: ${urlToTry}`);
              setAudioPlayer((prev) => ({
                ...prev,
                isPlaying: true,
                currentAyah: 1,
                currentSurah: surahNumber,
              }));
              resolve();
            };

            const handleError = async (error: any) => {
              console.error(`Surah play attempt ${playAttempts} failed:`, error);
              
              if (playAttempts < maxAttempts) {
                // Try next URL
                const nextUrl = audioUrls[playAttempts];
                console.log(`Trying next surah URL: ${nextUrl}`);
                
                // Wait a bit before trying the next URL
                setTimeout(async () => {
                  try {
                    await attemptPlaySurah(nextUrl);
                    resolve();
                  } catch (nextError) {
                    reject(nextError);
                  }
                }, 200);
              } else {
                reject(error);
              }
            };

            // Set up the audio source
            audioRef.current.src = urlToTry;
            audioRef.current.playbackRate = audioPlayer.speed;
            audioRef.current.volume = audioPlayer.isMuted ? 0 : audioPlayer.volume;
            
            // Load the audio first, then play
            audioRef.current.load();
            
            // Wait a moment for the load to register, then try to play
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play()
                  .then(handleSuccess)
                  .catch(handleError);
              }
            }, 100);
          });
        };

        try {
          await attemptPlaySurah(audioUrl);
        } catch (finalError) {
          console.error(`All surah play attempts failed:`, finalError);
          throw new Error(`Failed to play surah audio: ${finalError instanceof Error ? finalError.message : 'Unknown playback error'}`);
        }
      }
    } catch (error) {
      console.error("Error playing surah audio:", error);
      notify.error(
        messages?.quran?.errors?.audioPlay ||
          "Failed to play surah audio. Please check your connection and try again.",
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
    const previousReciter = audioPlayer.reciter;
    setAudioPlayer((prev) => ({ ...prev, reciter }));
    
    // Track reciter change
    const analytics = AnalyticsService.getInstance();
    analytics.trackEvent("reciter_change", "user", {
      fromReciter: previousReciter,
      toReciter: reciter,
      reciterName: RECITERS.find(r => r.id === reciter)?.name || reciter,
    });

    // Show notification about reciter change
    const reciterInfo = RECITERS.find(r => r.id === reciter);
    if (reciterInfo) {
      notify.success(
        messages?.quran?.reciterChanged?.replace("{name}", reciterInfo.name) ||
          `Reciter changed to ${reciterInfo.name}`,
      );
      
      // If currently playing, inform user they may need to restart playback
      if (audioPlayer.isPlaying) {
        notify.info(
          messages?.quran?.reciterChangeRestart ||
          "Reciter changed. Please restart playback to hear the new reciter.",
        );
      }
    }
  };

  const getCurrentReciterName = () => {
    const reciter = RECITERS.find(r => r.id === audioPlayer.reciter);
    return reciter ? reciter.name : audioPlayer.reciter;
  };

  const playNextAyah = async (currentAyahNumber: number, ayahs: any[] = [], currentSurah: number) => {
    if (repeatMode === "verse") {
      // Replay the same verse
      if (audioPlayer.currentSurah) {
        await playAyah(currentAyahNumber, audioPlayer.currentSurah);
      }
      return;
    }

    // Find next ayah in the current surah
    const nextAyah = ayahs.find(
      (ayah: any) => ayah.numberInSurah === currentAyahNumber + 1,
    );
    
    if (nextAyah && currentSurah) {
      // Play next ayah after a brief delay
      setTimeout(() => playAyah(nextAyah.numberInSurah, currentSurah), 500);
    } else if (repeatMode === "surah" && currentSurah) {
      // If at end of surah and repeat mode is surah, go back to beginning
      setTimeout(() => playAyah(1, currentSurah), 500);
    }
  };

  const playPreviousAyah = async () => {
    if (audioPlayer.currentAyah && audioPlayer.currentAyah > 1 && audioPlayer.currentSurah) {
      await playAyah(audioPlayer.currentAyah - 1, audioPlayer.currentSurah);
    }
  };

  return {
    audioRef,
    audioPlayer,
    repeatMode,
    autoPlay,
    playAyah,
    playSurah,
    pauseAudio,
    togglePlayPause,
    updateVolume,
    toggleMute,
    updateSpeed,
    updateReciter,
    setRepeatMode,
    setAutoPlay,
    getCurrentReciterName,
    playNextAyah,
    playPreviousAyah,
  };
};
