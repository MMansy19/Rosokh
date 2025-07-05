import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  Play,
  Pause,
  Book,
  GraduationCap,
  Eye,
} from "lucide-react";
import { useSurahs } from "./hooks/useSurahs";
import { useAyahs } from "./hooks/useAyahs";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useBookmarks } from "./hooks/useBookmarks";
import { SurahsList } from "./ui/SurahsList";
import { ReadingControls } from "./ui/ReadingControls";
import { AyahsList } from "./ui/AyahsList";
import { AudioPlayerBar } from "./ui/AudioPlayerBar";
import { AnalyticsService } from "@/services/AnalyticsService";
import { useNotifications } from "@/contexts/GlobalContext";
import { RepeatMode, Surah, Ayah } from "./types";

interface QuranUnifiedProps {
  locale: string;
  messages: any;
  mode?: "read" | "learn";
}

export const QuranUnified: React.FC<QuranUnifiedProps> = ({ 
  locale, 
  messages, 
  mode = "read" 
}) => {
  const { notify } = useNotifications();
  const analytics = AnalyticsService.getInstance();

  // State management
  const [currentMode, setCurrentMode] = useState<"read" | "learn">(mode);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [fontSize, setFontSize] = useState(currentMode === "read" ? 32 : 24);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [lineHeight, setLineHeight] = useState(2.5);
  const [viewMode, setViewMode] = useState<"continuous" | "ayah-by-ayah">(
    currentMode === "read" ? "continuous" : "ayah-by-ayah"
  );

  // Custom hooks
  const { surahs, loading: surahsLoading, error: surahsError } = useSurahs();
  const {
    ayahs,
    translations,
    loading: ayahsLoading,
    error: ayahsError,
  } = useAyahs(selectedSurah, locale);
  const { bookmarkedAyahs, toggleBookmark, isBookmarked } = useBookmarks();
  const {
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
    playNextAyah,
    playPreviousAyah,
  } = useAudioPlayer(messages);
  useEffect(() => {
    if (currentMode === "read") {
      setViewMode("continuous");
      setFontSize(32);
      setShowTranslation(false);
    } else {
      setViewMode("ayah-by-ayah");
      setFontSize(24);
      setShowTranslation(true);
    }
  }, [currentMode]);

  // Get current surah info
  const currentSurah = surahs.find((s: Surah) => s.number === selectedSurah);
  const loading = surahsLoading || ayahsLoading;

  // Handle mode toggle
  const handleModeToggle = (newMode: "read" | "learn") => {
    const previousMode = currentMode;
    setCurrentMode(newMode);
    
    analytics.trackEvent("mode_switch", "user", {
      fromMode: previousMode,
      toMode: newMode,
      surahNumber: selectedSurah,
    });
  };

  // Handle surah selection
  const handleSurahSelect = (surahNumber: number) => {
    const previousSurah = selectedSurah;
    setSelectedSurah(surahNumber);
    setSelectedAyah(null);

    analytics.trackEvent("surah_select", "user", {
      fromSurah: previousSurah,
      toSurah: surahNumber,
      mode: currentMode,
    });
  };

  // Handle ayah click (for read mode)
  const handleAyahClick = (ayahNumber: number) => {
    if (currentMode === "read") {
      setSelectedAyah(selectedAyah === ayahNumber ? null : ayahNumber);
    }
  };

  // Handle audio actions
  const handlePlayAyah = (ayahNumber: number) => {
    playAyah(ayahNumber, selectedSurah);
  };

  const handlePlayFullSurah = async () => {
    if (selectedSurah) {
      analytics.trackEvent("surah_full_play", "engagement", {
        surahNumber: selectedSurah,
        mode: currentMode,
        reciter: audioPlayer.reciter,
      });

      await playSurah(selectedSurah);
      notify.info(
        messages?.quran?.playingFullSurah?.replace(
          "{name}",
          locale === "ar" ? currentSurah?.name : currentSurah?.englishName,
        ) || `Playing full ${currentSurah?.name || `Surah ${selectedSurah}`}`,
      );
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = (surahNumber: number, ayahNumber: number) => {
    const wasBookmarked = toggleBookmark(surahNumber, ayahNumber, messages);
    
    if (wasBookmarked) {
      notify.success(messages?.quran?.bookmarkAdded || "Verse bookmarked");
    } else {
      notify.success(messages?.quran?.bookmarkRemoved || "Bookmark removed");
    }
  };

  // Handle share
  const handleShare = async (surah: number, ayah: number, text: string) => {
    const shareText = `${text}\n\n— Quran ${surah}:${ayah}`;

    if ("share" in navigator) {
      try {
        await navigator.share({
          title: `Quran ${surah}:${ayah}`,
          text: shareText,
        });
        notify.success(messages?.quran?.shareSuccess || "Verse shared successfully");
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      try {
        if ("clipboard" in navigator && (navigator as any).clipboard) {
          await (navigator as any).clipboard.writeText(shareText);
          notify.success(messages?.quran?.copiedToClipboard || "Verse copied to clipboard");
        }
      } catch (error) {
        notify.error(messages?.quran?.errors?.copyFailed || "Failed to copy verse");
      }
    }
  };

  // Handle repeat mode change
  const handleRepeatModeChange = () => {
    const modes: RepeatMode[] = ["none", "verse", "surah"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Navigation functions
  const goToPreviousSurah = () => {
    if (selectedSurah > 1) {
      setSelectedSurah(selectedSurah - 1);
      setSelectedAyah(null);
    }
  };

  const goToNextSurah = () => {
    if (selectedSurah < 114) {
      setSelectedSurah(selectedSurah + 1);
      setSelectedAyah(null);
    }
  };

  // Error handling
  if (surahsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {messages?.quran?.errors?.surahsLoad || "Failed to load Quran chapters"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
        >
          {messages?.common?.retry || "Try Again"}
        </button>
      </div>
    );
  }

  if (ayahsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {messages?.quran?.errors?.ayahsLoad || "Failed to load verses"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
        >
          {messages?.common?.retry || "Try Again"}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {messages?.common?.loading || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        onEnded={() => {
          if (autoPlay && audioPlayer.currentAyah) {
            playNextAyah(audioPlayer.currentAyah, ayahs, selectedSurah);
          }
        }}
        onError={(e) => {
          console.error("Audio element error:", e);
          // Don't show error notification immediately - let the fallback system handle it
        }}
        onLoadStart={() => {
          console.log("Audio loading started");
        }}
        onCanPlay={() => {
          console.log("Audio can play");
        }}
        onLoadedMetadata={() => {
          console.log("Audio metadata loaded");
        }}
      />

      {/* Audio Player Bar */}
      {audioPlayer.currentAyah && (
        <AudioPlayerBar
          audioPlayer={audioPlayer}
          repeatMode={repeatMode}
          autoPlay={autoPlay}
          currentSurah={currentSurah}
          onPlayPause={togglePlayPause}
          onPrevious={playPreviousAyah}
          onNext={() => audioPlayer.currentAyah && playNextAyah(audioPlayer.currentAyah, ayahs, selectedSurah)}
          onRepeatModeChange={handleRepeatModeChange}
          onAutoPlayToggle={() => setAutoPlay(!autoPlay)}
          onPlayFullSurah={handlePlayFullSurah}
          onSpeedChange={updateSpeed}
          onVolumeToggle={toggleMute}
          onReciterChange={updateReciter}
          onVolumeChange={updateVolume}
          showSettings={showSettings}
          messages={messages}
          locale={locale}
        />
      )}

      {/* Mode Toggle & Header */}
      <div className="mb-8">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-surface rounded-lg p-1 border border-border shadow-sm">
            <button
              onClick={() => handleModeToggle("read")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                currentMode === "read"
                  ? "bg-primary text-white shadow-md transform scale-105"
                  : "text-muted hover:text-foreground hover:bg-secondary"
              }`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{messages?.quran?.read || "Read"}</span>
              <span className="sm:hidden">قراءة</span>
            </button>
            <button
              onClick={() => handleModeToggle("learn")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                currentMode === "learn"
                  ? "bg-primary text-white shadow-md transform scale-105"
                  : "text-muted hover:text-foreground hover:bg-secondary"
              }`}
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{messages?.quran?.learn || "Learn"}</span>
              <span className="sm:hidden">تعلم</span>
            </button>
          </div>
        </div>

        {/* Enhanced Header with Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-surface rounded-lg p-4 border border-border gap-4">
          <div className="flex items-center gap-2 sm:gap-4 order-2 sm:order-1">
            <button
              onClick={goToPreviousSurah}
              disabled={selectedSurah <= 1}
              className="p-2 rounded-lg bg-background hover:bg-background/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="text-center">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-1">
                سورة {currentSurah?.name || currentSurah?.arabicName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {currentSurah?.revelationType === "Meccan" ? "مكية" : "مدنية"} • {currentSurah?.numberOfAyahs} آيات
              </p>
            </div>
            <button
              onClick={goToNextSurah}
              disabled={selectedSurah >= 114}
              className="p-2 rounded-lg bg-background hover:bg-background/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 order-1 sm:order-2 flex-wrap justify-center">
            {/* Tafsir Toggle */}
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                showTafsir
                  ? "bg-accent text-white"
                  : "bg-background text-foreground hover:bg-secondary border border-border"
              }`}
            >
              <Book className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">التفسير</span>
              <span className="sm:hidden">📖</span>
            </button>

            {/* View Mode Toggle (only for learn mode) */}
            {currentMode === "learn" && (
              <button
                onClick={() => setViewMode(viewMode === "continuous" ? "ayah-by-ayah" : "continuous")}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg bg-background text-foreground hover:bg-secondary border border-border transition-colors"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{viewMode === "continuous" ? "متصل" : "آية بآية"}</span>
                <span className="sm:hidden">👁️</span>
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-background hover:bg-background/80 transition-colors border border-border"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">حجم الخط</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  -
                </button>
                <span className="text-sm min-w-[3ch] text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(60, fontSize + 2))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">تباعد الأسطر</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLineHeight(Math.max(1.5, lineHeight - 0.1))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  -
                </button>
                <span className="text-sm min-w-[3ch] text-center">{lineHeight.toFixed(1)}</span>
                <button
                  onClick={() => setLineHeight(Math.min(3.5, lineHeight + 0.1))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {currentMode === "learn" && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">الترجمة</label>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    showTranslation
                      ? "bg-primary text-white"
                      : "bg-background border border-border hover:bg-surface"
                  }`}
                >
                  {showTranslation ? "إخفاء" : "إظهار"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`grid gap-2 sm:gap-4 md:gap-8 ${currentMode === "learn" ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
        {/* Surahs List (only for learn mode) */}
        {currentMode === "learn" && (
          <div className="lg:col-span-1">
            <SurahsList
              surahs={surahs}
              selectedSurah={selectedSurah}
              onSurahSelect={handleSurahSelect}
              messages={messages}
              loading={surahsLoading}
            />
          </div>
        )}

        {/* Content Panel */}
        <div className={currentMode === "learn" ? "lg:col-span-3" : "col-span-1"}>
          <div className="bg-surface rounded-lg shadow-lg border border-border">
            {/* Reading Controls (only for learn mode) */}
            {currentMode === "learn" && (
              <ReadingControls
                showTranslation={showTranslation}
                showTransliteration={showTransliteration}
                fontSize={fontSize}
                showSettings={showSettings}
                onTranslationToggle={() => setShowTranslation(!showTranslation)}
                onTransliterationToggle={() => setShowTransliteration(!showTransliteration)}
                onFontSizeChange={setFontSize}
                onSettingsToggle={() => setShowSettings(!showSettings)}
                messages={messages}
              />
            )}

            <div className="p-2 sm:p-6">
              {currentMode === "read" ? (
                /* Read Mode - Continuous Text */
                <div className="text-justify leading-loose quran-text">
                  {/* Bismillah */}
                  {selectedSurah !== 1 && selectedSurah !== 9 && (
                    <div className="text-center mb-8">
                      <p
                        className="text-foreground leading-relaxed"
                        style={{
                          fontSize: `${fontSize + 4}px`,
                          lineHeight: lineHeight,
                        }}
                      >
                        بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
                      </p>
                    </div>
                  )}

                  {/* Continuous Verses */}
                  <p
                    className="text-foreground"
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      wordSpacing: "0.2em",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {ayahs.map((ayah, index) => (
                      <span key={ayah.number}>
                        <span
                          className={`cursor-pointer transition-all duration-200 hover:bg-primary/10 rounded px-1 ${
                            selectedAyah === ayah.numberInSurah
                              ? "bg-primary/20 shadow-sm"
                              : ""
                          }`}
                          onClick={() => handleAyahClick(ayah.numberInSurah)}
                          title={`آية ${ayah.numberInSurah}`}
                        >
                          {ayah.text}
                        </span>{" "}
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 mx-2 ${
                            audioPlayer.currentAyah === ayah.numberInSurah && 
                            audioPlayer.currentSurah === selectedSurah
                              ? "bg-primary text-white"
                              : selectedAyah === ayah.numberInSurah
                                ? "bg-primary/80 text-white"
                                : "bg-primary/20 text-primary hover:bg-primary/30"
                          }`}
                          onClick={() => handleAyahClick(ayah.numberInSurah)}
                          style={{ fontSize: "12px" }}
                        >
                          {ayah.numberInSurah}
                        </span>
                        {index < ayahs.length - 1 && " "}
                      </span>
                    ))}
                  </p>

                  {/* Ayah Actions Panel */}
                  {selectedAyah && (
                    <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-foreground mb-1">
                            آية {selectedAyah} - سورة {currentSurah?.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {selectedSurah}:{selectedAyah}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePlayAyah(selectedAyah!)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                          >
                            {audioPlayer.currentAyah === selectedAyah && 
                             audioPlayer.currentSurah === selectedSurah && 
                             audioPlayer.isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {audioPlayer.currentAyah === selectedAyah && 
                             audioPlayer.currentSurah === selectedSurah && 
                             audioPlayer.isPlaying
                              ? "إيقاف"
                              : "تشغيل"}
                          </button>

                          <button 
                            onClick={() => handleBookmarkToggle(selectedSurah, selectedAyah!)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                          >
                            <BookOpen className="w-4 h-4" />
                            إشارة مرجعية
                          </button>
                        </div>
                      </div>

                      {/* Tafsir */}
                      {showTafsir && (
                        <div className="mt-4 p-1 sm:p-4 bg-accent/5 rounded-lg border border-accent/20">
                          <h4 className="text-sm font-medium text-foreground mb-2">التفسير</h4>
                          <p className="text-sm text-muted-foreground">
                            {messages?.quran?.tafsirPlaceholder || "Tafsir content will be available soon"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Learn Mode - Ayah by Ayah */
                <AyahsList
                  ayahs={ayahs}
                  translations={translations}
                  currentSurah={currentSurah}
                  selectedSurah={selectedSurah}
                  showTranslation={showTranslation}
                  showTransliteration={showTransliteration}
                  fontSize={fontSize}
                  bookmarkedAyahs={bookmarkedAyahs}
                  currentPlayingAyah={audioPlayer.currentAyah}
                  onPlayAudio={handlePlayAyah}
                  onBookmark={handleBookmarkToggle}
                  onShare={handleShare}
                  locale={locale}
                  messages={messages}
                  loading={loading}
                  showTafsir={showTafsir}
                />
              )}
            </div>
          </div>

          {/* Surah Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={goToPreviousSurah}
              disabled={selectedSurah <= 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
            >
              <ChevronRight className="w-4 h-4" />
              السورة السابقة
            </button>

            <div className="text-center">
              <select
                value={selectedSurah}
                onChange={(e) => handleSurahSelect(Number(e.target.value))}
                className="px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center"
                dir={locale === "ar" ? "rtl" : "ltr"}
              >
                {surahs.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name || surah.arabicName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={goToNextSurah}
              disabled={selectedSurah >= 114}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
            >
              السورة التالية
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmarks Summary */}
          {bookmarkedAyahs.size > 0 && (
            <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">
                {messages?.quran?.bookmarks || "Bookmarks"} ({bookmarkedAyahs.size})
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
        </div>
      </div>
    </div>
  );
};
