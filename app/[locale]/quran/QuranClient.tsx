"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useNotifications } from "@/contexts/GlobalContext";
import { AnalyticsService } from "@/services/AnalyticsService";
import { NotificationService } from "@/services/NotificationService";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Settings,
  Download,
  Share2,
  Search,
  Repeat,
} from "lucide-react";
import QuranSearch from "@/components/quran/QuranSearch";
import { VerseInteraction } from "@/components/quran/VerseInteraction";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: number;
}

interface Translation {
  id: number;
  text: string;
  language_name: string;
  resource_name: string;
}

interface QuranClientProps {
  locale: string;
  messages: any;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentAyah: number | null;
  currentSurah: number;
  volume: number;
  speed: number;
  isMuted: boolean;
  reciter: string;
}

// Available reciters with their API IDs
const reciters = [
  { id: "7", name: "Abdul Rahman Al-Sudais", arabicName: "عبد الرحمن السديس" },
  {
    id: "3",
    name: "Abdul Basit Abdul Samad",
    arabicName: "عبد الباسط عبد الصمد",
  },
  { id: "1", name: "Alafasy", arabicName: "العفاسي" },
  { id: "6", name: "Abu Bakr Ash-Shaatree", arabicName: "أبو بكر الشاطري" },
  { id: "11", name: "Maher Al Mueaqly", arabicName: "ماهر المعيقلي" },
  { id: "4", name: "Saad Al Ghamdi", arabicName: "سعد الغامدي" },
  { id: "1", name: "Mishary Rashid Alafasy", arabicName: "مشاري راشد العفاسي" },
  { id: "5", name: "Sa'ud Ash-Shuraym", arabicName: "سعود الشريم" },
  { id: "6", name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي" },
];

export function QuranClient({ locale, messages }: QuranClientProps) {
  const searchParams = useSearchParams();
  // Notification and Analytics services
  const { notify } = useNotifications();
  const analytics = useMemo(() => AnalyticsService.getInstance(), []);
  const notifications = useMemo(() => NotificationService.getInstance(), []);

  const [activeTab, setActiveTab] = useState<"read" | "search">("read");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<string>>(
    new Set(),
  );
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize active tab based on URL parameters (for global search integration)
  useEffect(() => {
    const urlSearchTerm = searchParams.get("q");
    if (urlSearchTerm && activeTab !== "search") {
      setActiveTab("search");
    }
  }, [searchParams, activeTab]);

  const [audioPlayer, setAudioPlayer] = useState<AudioPlayerState>({
    isPlaying: false,
    currentAyah: null,
    currentSurah: 1,
    volume: 0.8,
    speed: 1.0,
    isMuted: false,
    reciter: "7", // Default to Abdul Rahman Al-Sudais
  });
  const [audioQueue, setAudioQueue] = useState<number[]>([]);
  const [repeatMode, setRepeatMode] = useState<"none" | "verse" | "surah">(
    "none",
  );
  const [autoPlay, setAutoPlay] = useState(false);

  // Track page view and reading session
  useEffect(() => {
    analytics.trackPageView("/quran", "Quran Reader");
    analytics.trackEvent("quran_session_start", "user", {
      timestamp: new Date().toISOString(),
      locale,
      initialSurah: selectedSurah,
      settings: {
        showTranslation,
        showTransliteration,
        fontSize,
      },
    });

    // Track reading session duration
    const sessionStart = Date.now();
    return () => {
      const sessionDuration = Date.now() - sessionStart;
      analytics.trackEvent("quran_session_end", "engagement", {
        duration: sessionDuration,
        surahsRead: [selectedSurah], // Could track multiple surahs if navigation is implemented
        versesViewed: ayahs.length,
        bookmarksAdded: bookmarkedAyahs.size,
      });
    };
  }, [
    analytics,
    locale,
    selectedSurah,
    showTranslation,
    showTransliteration,
    fontSize,
    ayahs.length,
    bookmarkedAyahs.size,
  ]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("quran_bookmarks");
    if (savedBookmarks) {
      setBookmarkedAyahs(new Set(JSON.parse(savedBookmarks)));

      analytics.trackEvent("bookmarks_loaded", "user", {
        count: JSON.parse(savedBookmarks).length,
      });
    }
  }, [analytics]);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem(
      "quran_bookmarks",
      JSON.stringify([...bookmarkedAyahs]),
    );
  }, [bookmarkedAyahs]);

  // Fetch Surahs list
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        analytics.trackEvent("surahs_fetch_start", "content", {
          timestamp: new Date().toISOString(),
        });

        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        setSurahs(data.data);

        analytics.trackEvent("surahs_loaded", "content", {
          surahsCount: data.data.length,
          source: "alquran_cloud_api",
        });

        notify.success(
          messages?.quran?.surahsLoaded || "Quran chapters loaded successfully",
        );
      } catch (error) {
        console.error("Error fetching surahs:", error);

        analytics.trackEvent("surahs_fetch_error", "error", {
          error: error instanceof Error ? error.message : "Unknown error",
          api: "alquran_cloud",
        });

        notify.error(
          messages?.quran?.errors?.surahsLoad ||
            "Failed to load Quran chapters. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, [analytics, messages, notify]);

  // Fetch Ayahs for selected Surah with translations
  useEffect(() => {
    const fetchAyahs = async () => {
      if (!selectedSurah) return;

      setLoading(true);
      try {
        const surahName =
          surahs.find((s) => s.number === selectedSurah)?.englishName ||
          `Surah ${selectedSurah}`;

        analytics.trackEvent("surah_load_start", "content", {
          surahNumber: selectedSurah,
          surahName,
          locale,
        });

        // Get Arabic text
        const arabicResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${selectedSurah}`,
        );
        const arabicData = await arabicResponse.json();
        setAyahs(arabicData.data.ayahs);

        // Get translations based on locale
        let translationEdition = "";
        switch (locale) {
          case "en":
            translationEdition = "en.sahih"; // Sahih International
            break;
          case "ru":
            translationEdition = "ru.osmanov"; // Russian translation
            break;
          case "ar":
            translationEdition = "ar.muyassar"; // Arabic tafseer
            break;
          default:
            translationEdition = "en.sahih";
        }

        const translationResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${selectedSurah}/${translationEdition}`,
        );
        const translationData = await translationResponse.json();

        if (translationData.data && translationData.data.ayahs) {
          const translationsArray = translationData.data.ayahs.map(
            (ayah: any, index: number) => ({
              id: index,
              text: ayah.text,
              language_name: locale,
              resource_name: translationData.data.edition.name,
            }),
          );
          setTranslations(translationsArray);
        }

        analytics.trackEvent("surah_loaded", "content", {
          surahNumber: selectedSurah,
          surahName,
          ayahsCount: arabicData.data.ayahs.length,
          translationEdition,
          hasTranslation: !!translationData.data,
        });

        notify.success(
          messages?.quran?.surahLoaded?.replace("{name}", surahName) ||
            `${surahName} loaded successfully`,
        );
      } catch (error) {
        console.error("Error fetching ayahs:", error);

        analytics.trackEvent("surah_load_error", "error", {
          surahNumber: selectedSurah,
          error: error instanceof Error ? error.message : "Unknown error",
          locale,
        });

        notify.error(
          messages?.quran?.errors?.surahLoad ||
            "Failed to load Quran verses. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAyahs();
  }, [selectedSurah, locale, analytics, messages, notify, surahs]);

  // Audio functions
  const playAyah = async (ayahNumber: number) => {
    try {
      analytics.trackEvent("ayah_play", "engagement", {
        surahNumber: selectedSurah,
        ayahNumber,
        reciter: audioPlayer.reciter,
        speed: audioPlayer.speed,
        volume: audioPlayer.volume,
      });

      const paddedSurah = selectedSurah.toString().padStart(3, "0");
      const paddedAyah = ayahNumber.toString().padStart(3, "0");
      const audioUrl = `https://verses.quran.com/${audioPlayer.reciter}/${paddedSurah}${paddedAyah}.mp3`;

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = audioPlayer.speed;
        audioRef.current.volume = audioPlayer.isMuted ? 0 : audioPlayer.volume;

        await audioRef.current.play();
        setAudioPlayer((prev) => ({
          ...prev,
          isPlaying: true,
          currentAyah: ayahNumber,
          currentSurah: selectedSurah,
        }));

        // Set up auto-play for next verse if enabled
        if (autoPlay) {
          audioRef.current.onended = () => playNextAyah(ayahNumber);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);

      analytics.trackEvent("ayah_play_error", "error", {
        surahNumber: selectedSurah,
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

  const playNextAyah = (currentAyahNumber: number) => {
    if (repeatMode === "verse") {
      playAyah(currentAyahNumber);
      return;
    }

    const nextAyah = ayahs.find(
      (ayah) => ayah.numberInSurah === currentAyahNumber + 1,
    );
    if (nextAyah) {
      setTimeout(() => playAyah(nextAyah.numberInSurah), 1000);
    } else if (repeatMode === "surah") {
      setTimeout(() => playAyah(1), 1000);
    }
  };

  const playPreviousAyah = () => {
    if (audioPlayer.currentAyah && audioPlayer.currentAyah > 1) {
      playAyah(audioPlayer.currentAyah - 1);
    }
  };

  const playFullSurah = async () => {
    if (ayahs.length > 0) {
      analytics.trackEvent("surah_full_play", "engagement", {
        surahNumber: selectedSurah,
        surahName: currentSurah?.englishName,
        totalAyahs: ayahs.length,
        reciter: audioPlayer.reciter,
      });

      setAutoPlay(true);
      await playAyah(1);

      notify.info(
        messages?.quran?.playingFullSurah?.replace(
          "{name}",
          currentSurah?.englishName || `Surah ${selectedSurah}`,
        ) ||
          `Playing full ${currentSurah?.englishName || `Surah ${selectedSurah}`}`,
      );
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlayer((prev) => ({ ...prev, isPlaying: false }));

      analytics.trackEvent("ayah_pause", "engagement", {
        surahNumber: selectedSurah,
        ayahNumber: audioPlayer.currentAyah,
        playbackPosition: audioRef.current.currentTime,
        duration: audioRef.current.duration,
      });
    }
  };

  const toggleBookmark = (surahNumber: number, ayahNumber: number) => {
    const bookmarkId = `${surahNumber}:${ayahNumber}`;
    const newBookmarks = new Set(bookmarkedAyahs);
    const isBookmarked = newBookmarks.has(bookmarkId);

    if (isBookmarked) {
      newBookmarks.delete(bookmarkId);
      analytics.trackEvent("bookmark_removed", "user", {
        surahNumber,
        ayahNumber,
        totalBookmarks: newBookmarks.size,
      });

      notify.success(messages?.quran?.bookmarkRemoved || "Bookmark removed");
    } else {
      newBookmarks.add(bookmarkId);
      analytics.trackEvent("bookmark_added", "user", {
        surahNumber,
        ayahNumber,
        totalBookmarks: newBookmarks.size,
      });

      notify.success(messages?.quran?.bookmarkAdded || "Verse bookmarked");
    }

    setBookmarkedAyahs(newBookmarks);
  };

  const shareAyah = async (surah: number, ayah: number, text: string) => {
    const shareText = `${text}\n\n— Quran ${surah}:${ayah}`;

    analytics.trackEvent("ayah_share", "engagement", {
      surahNumber: surah,
      ayahNumber: ayah,
      shareMethod: "share" in navigator ? "native" : "clipboard",
      textLength: shareText.length,
    });

    if ("share" in navigator) {
      try {
        await navigator.share({
          title: `Quran ${surah}:${ayah}`,
          text: shareText,
        });

        notify.success(
          messages?.quran?.shareSuccess || "Verse shared successfully",
        );
      } catch (error) {
        console.log("Error sharing:", error);
        analytics.trackEvent("ayah_share_error", "error", {
          surahNumber: surah,
          ayahNumber: ayah,
          error: error instanceof Error ? error.message : "Share cancelled",
        });
      }
    } else {
      // Fallback to clipboard
      try {
        if (
          "clipboard" in navigator &&
          (navigator as any).clipboard &&
          (navigator as any).clipboard.writeText
        ) {
          await (navigator as any).clipboard.writeText(shareText);
          notify.success(
            messages?.quran?.copiedToClipboard || "Verse copied to clipboard",
          );
        } else {
          throw new Error("Clipboard API not available");
        }
      } catch (error) {
        console.log("Error copying to clipboard:", error);
        analytics.trackEvent("ayah_share_error", "error", {
          surahNumber: surah,
          ayahNumber: ayah,
          error:
            error instanceof Error ? error.message : "Clipboard access failed",
        });

        notify.error(
          messages?.quran?.errors?.copyFailed ||
            "Failed to copy verse to clipboard",
        );
      }
    }
  };

  const currentSurah = surahs.find((s) => s.number === selectedSurah);
  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() =>
          setAudioPlayer((prev) => ({
            ...prev,
            isPlaying: false,
            currentAyah: null,
          }))
        }
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.quran?.title || "Quran Reader"}
          </h1>
          <div className="text-6xl font-amiri text-primary mb-4">﷽</div>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {messages?.quran?.description ||
              "Read the Quran with beautiful Arabic text, translations, and audio"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8  mx-auto items-center">
          <div className="flex flex-row md:gap-4 gap-2 bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => {
                setActiveTab("read");
                analytics.trackEvent("tab_switch", "user", {
                  fromTab: activeTab,
                  toTab: "read",
                  timestamp: new Date().toISOString(),
                });
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === "read"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted hover:text-foreground hover:bg-secondary"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              {messages?.quran?.read || "Read"}
            </button>
            <button
              onClick={() => {
                setActiveTab("search");
                analytics.trackEvent("tab_switch", "user", {
                  fromTab: activeTab,
                  toTab: "search",
                  timestamp: new Date().toISOString(),
                });
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === "search"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Search className="w-5 h-5" />
              {messages?.quran?.search || "Search"}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "search" ? (
          <QuranSearch locale={locale} messages={messages} />
        ) : (
          <>
            {/* Audio Player Bar */}
            {audioPlayer.currentAyah && (
              <div className="sticky top-4 z-50 mb-6">
                <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      {/* Previous Button */}
                      <button
                        onClick={playPreviousAyah}
                        disabled={audioPlayer.currentAyah === 1}
                        className="p-2 bg-secondary text-foreground rounded-full hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          audioPlayer.isPlaying
                            ? pauseAudio()
                            : playAyah(audioPlayer.currentAyah!)
                        }
                        className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
                      >
                        {audioPlayer.isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={() => playNextAyah(audioPlayer.currentAyah!)}
                        disabled={
                          !ayahs.find(
                            (ayah) =>
                              ayah.numberInSurah ===
                              audioPlayer.currentAyah! + 1,
                          )
                        }
                        className="p-2 bg-secondary text-foreground rounded-full hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      {/* Repeat Mode Button */}
                      <button
                        onClick={() => {
                          const modes: Array<"none" | "verse" | "surah"> = [
                            "none",
                            "verse",
                            "surah",
                          ];
                          const currentIndex = modes.indexOf(repeatMode);
                          const nextMode =
                            modes[(currentIndex + 1) % modes.length];
                          setRepeatMode(nextMode);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          repeatMode !== "none"
                            ? "bg-accent text-white"
                            : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                        }`}
                        title={`Repeat: ${repeatMode}`}
                      >
                        <Repeat className="w-4 h-4" />
                      </button>

                      <div className="text-sm">
                        <div className="font-medium">
                          {currentSurah?.englishName}
                        </div>
                        <div className="text-muted">
                          Verse {audioPlayer.currentAyah}
                          {repeatMode !== "none" && (
                            <span className="ml-1 text-accent">
                              ({repeatMode === "verse" ? "🔂" : "🔁"})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Auto-play toggle */}
                      <button
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          autoPlay
                            ? "bg-accent text-white"
                            : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                        }`}
                      >
                        Auto
                      </button>

                      {/* Play Full Surah */}
                      <button
                        onClick={playFullSurah}
                        className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                      >
                        Play All
                      </button>

                      {/* Speed Control */}
                      <select
                        value={audioPlayer.speed}
                        onChange={(e) => {
                          const newSpeed = parseFloat(e.target.value);
                          setAudioPlayer((prev) => ({
                            ...prev,
                            speed: newSpeed,
                          }));
                          if (audioRef.current) {
                            audioRef.current.playbackRate = newSpeed;
                          }
                        }}
                        className="text-xs bg-secondary border border-border rounded px-2 py-1"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                      </select>

                      {/* Volume Control */}
                      <button
                        onClick={() => {
                          setAudioPlayer((prev) => ({
                            ...prev,
                            isMuted: !prev.isMuted,
                          }));
                          if (audioRef.current) {
                            audioRef.current.volume = audioPlayer.isMuted
                              ? audioPlayer.volume
                              : 0;
                          }
                        }}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        {audioPlayer.isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar - if we can get current time */}
                  <div className="w-full bg-secondary rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Surahs List */}
              <div className="lg:col-span-1">
                <div className="bg-surface rounded-lg shadow-lg p-6 border border-border sticky top-4">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    {messages?.quran?.surahs || "Surahs"}
                  </h2>
                  <div className="max-h-96 overflow-y-auto">
                    {surahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => {
                          const previousSurah = selectedSurah;
                          setSelectedSurah(surah.number);
                          analytics.trackEvent("surah_select", "user", {
                            fromSurah: previousSurah,
                            toSurah: surah.number,
                            surahName: surah.englishName,
                            arabicName: surah.arabicName,
                            totalAyahs: surah.numberOfAyahs,
                            revelationType: surah.revelationType,
                          });
                        }}
                        className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                          selectedSurah === surah.number
                            ? "bg-primary text-white"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {surah.number}. {surah.englishName}
                            </div>
                            <div className="text-sm font-amiri">
                              {surah.arabicName}
                            </div>
                          </div>
                          <div className="text-xs opacity-75">
                            {surah.numberOfAyahs}{" "}
                            {messages?.quran?.verses || "verses"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>{" "}
              {/* Reading Panel */}
              <div className="lg:col-span-3">
                <div className="bg-surface rounded-lg shadow-lg border border-border">
                  {/* Control Bar */}
                  <div className="p-6 border-b border-border">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            const newValue = !showTranslation;
                            setShowTranslation(newValue);
                            analytics.trackEvent("translation_toggle", "user", {
                              enabled: newValue,
                              surahNumber: selectedSurah,
                              locale,
                            });
                          }}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            showTranslation
                              ? "bg-primary text-white"
                              : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                          }`}
                        >
                          {messages?.quran?.translation || "Translation"}
                        </button>

                        <button
                          onClick={() => {
                            const newValue = !showTransliteration;
                            setShowTransliteration(newValue);
                            analytics.trackEvent(
                              "transliteration_toggle",
                              "user",
                              {
                                enabled: newValue,
                                surahNumber: selectedSurah,
                                locale,
                              },
                            );
                          }}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            showTransliteration
                              ? "bg-primary text-white"
                              : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                          }`}
                        >
                          {messages?.quran?.transliteration ||
                            "Transliteration"}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Font Size Control */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted">Font:</span>
                          <input
                            type="range"
                            min="16"
                            max="36"
                            value={fontSize}
                            onChange={(e) => {
                              const newSize = parseInt(e.target.value);
                              setFontSize(newSize);
                              analytics.trackEvent("font_size_change", "user", {
                                oldSize: fontSize,
                                newSize,
                                surahNumber: selectedSurah,
                              });
                            }}
                            className="w-20"
                          />
                          <span className="text-sm text-muted w-8">
                            {fontSize}px
                          </span>
                        </div>

                        {/* Settings Button */}
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                      <div className="mt-4 p-4 bg-secondary rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Reciter
                            </label>
                            <select
                              value={audioPlayer.reciter}
                              onChange={(e) =>
                                setAudioPlayer((prev) => ({
                                  ...prev,
                                  reciter: e.target.value,
                                }))
                              }
                              className="w-full bg-background border border-border rounded-lg px-3 py-2"
                            >
                              {reciters.map((reciter) => (
                                <option key={reciter.id} value={reciter.id}>
                                  {reciter.name} - {reciter.arabicName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Volume
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={audioPlayer.volume}
                              onChange={(e) => {
                                const newVolume = parseFloat(e.target.value);
                                setAudioPlayer((prev) => ({
                                  ...prev,
                                  volume: newVolume,
                                }));
                                if (audioRef.current && !audioPlayer.isMuted) {
                                  audioRef.current.volume = newVolume;
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Surah Header */}
                    {currentSurah && (
                      <div className="text-center mb-8 p-6 bg-secondary rounded-lg border border-border">
                        <h2 className="text-3xl font-amiri text-foreground mb-2">
                          {currentSurah.arabicName}
                        </h2>
                        <h3 className="text-xl font-bold text-primary mb-2">
                          {currentSurah.englishName}
                        </h3>
                        <p className="text-muted">
                          {currentSurah.revelationType} •{" "}
                          {currentSurah.numberOfAyahs}{" "}
                          {messages?.quran?.verses || "verses"}
                        </p>
                      </div>
                    )}

                    {/* Bismillah */}
                    {selectedSurah !== 1 && selectedSurah !== 9 && (
                      <div className="text-center mb-8">
                        <div className="text-4xl font-amiri text-primary">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </div>
                      </div>
                    )}

                    {/* Ayahs */}
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted">
                          {messages?.quran?.loading || "Loading..."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {ayahs.map((ayah, index) => {
                          const isBookmarked = bookmarkedAyahs.has(
                            `${selectedSurah}:${ayah.numberInSurah}`,
                          );
                          const translation = translations[index];

                          return (
                            <div
                              key={ayah.number}
                              className={`group p-4 rounded-lg transition-all duration-200 border relative ${
                                audioPlayer.currentAyah === ayah.numberInSurah
                                  ? "bg-primary/5 border-primary/20"
                                  : "border-transparent hover:bg-secondary hover:border-border"
                              }`}
                            >
                              {/* Verse Interaction Component */}
                              <VerseInteraction
                                surahNumber={selectedSurah}
                                ayahNumber={ayah.numberInSurah}
                                ayahText={ayah.text}
                                translation={translation?.text}
                                onPlayAudio={playAyah}
                                onBookmark={toggleBookmark}
                                isBookmarked={isBookmarked}
                                locale={locale}
                                messages={messages}
                              />

                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {ayah.numberInSurah}
                                </div>

                                <div className="flex-1">
                                  {/* Arabic Text */}
                                  <p
                                    className="font-amiri leading-loose text-foreground text-right mb-4"
                                    style={{ fontSize: `${fontSize}px` }}
                                  >
                                    {ayah.text}
                                  </p>

                                  {/* Translation */}
                                  {showTranslation && translation && (
                                    <div className="mb-4 p-3 bg-background/50 rounded-lg">
                                      <p className="text-lg text-muted leading-relaxed">
                                        {translation.text}
                                      </p>
                                      <p className="text-xs text-muted mt-2">
                                        — {translation.resource_name}
                                      </p>
                                    </div>
                                  )}

                                  {/* Transliteration placeholder */}
                                  {showTransliteration && (
                                    <div className="mb-4 p-3 bg-background/50 rounded-lg">
                                      <p className="text-lg text-muted italic">
                                        {messages?.quran
                                          ?.transliterationNotAvailable ||
                                          "Transliteration not available"}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Traditional Action Buttons (still available) */}
                                <div className="flex-shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {/* Play Audio */}
                                  <button
                                    onClick={() => playAyah(ayah.numberInSurah)}
                                    className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
                                    title="Play Audio"
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>

                                  {/* Bookmark */}
                                  <button
                                    onClick={() =>
                                      toggleBookmark(
                                        selectedSurah,
                                        ayah.numberInSurah,
                                      )
                                    }
                                    className={`p-2 rounded-full transition-colors ${
                                      isBookmarked
                                        ? "bg-accent text-white"
                                        : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                                    }`}
                                    title="Bookmark"
                                  >
                                    {isBookmarked ? (
                                      <BookmarkCheck className="w-4 h-4" />
                                    ) : (
                                      <Bookmark className="w-4 h-4" />
                                    )}
                                  </button>

                                  {/* Share */}
                                  <button
                                    onClick={() =>
                                      shareAyah(
                                        selectedSurah,
                                        ayah.numberInSurah,
                                        ayah.text,
                                      )
                                    }
                                    className="p-2 bg-secondary text-foreground rounded-full hover:bg-accent hover:text-white transition-colors"
                                    title="Share"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bookmarks Summary */}
            {bookmarkedAyahs.size > 0 && (
              <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">
                  {messages?.quran?.bookmarks || "Bookmarks"} (
                  {bookmarkedAyahs.size})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...bookmarkedAyahs].map((bookmark) => (
                    <span
                      key={bookmark}
                      className="inline-block px-3 py-1 bg-accent text-white text-sm rounded-full"
                    >
                      {bookmark}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
