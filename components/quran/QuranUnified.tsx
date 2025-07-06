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
  const handlePlayAyah = async (ayahNumber: number) => {
    try {
      // If currently playing the same ayah, pause it
      if (audioPlayer.currentAyah === ayahNumber && audioPlayer.currentSurah === selectedSurah && audioPlayer.isPlaying) {
        pauseAudio();
        setAutoPlay(false);
        notify.info(messages?.quran?.playbackStopped || "Playback stopped");
        return;
      }

      // Set auto-play to true so it continues to next ayahs
      setAutoPlay(true);
      
      // Track the event
      analytics.trackEvent("ayah_play_from_selected", "engagement", {
        surahNumber: selectedSurah,
        startingAyah: ayahNumber,
        totalAyahs: ayahs.length,
        reciter: audioPlayer.reciter,
      });

      // Start playing from the selected ayah
      await playAyah(ayahNumber, selectedSurah);
      
      // Show notification about continuous play
      notify.info(
        messages?.quran?.playingFromAyah?.replace("{ayah}", ayahNumber.toString())?.replace("{surah}", currentSurah?.name || `Surah ${selectedSurah}`) ||
        `Playing from Ayah ${ayahNumber} to end of ${currentSurah?.name || `Surah ${selectedSurah}`}`,
      );
    } catch (error) {
      console.error("Error starting continuous ayah playback:", error);
      notify.error(
        messages?.quran?.errors?.audioPlay ||
        "Failed to play audio. Please check your connection and try again.",
      );
    }
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
      <div className="mb-4 sm:mb-6">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-surface p-1 rounded-lg flex">
            <button
              onClick={() => handleModeToggle("read")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                currentMode === "read"
                  ? "bg-primary text-white shadow-md"
                  : " hover:"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{messages?.quran?.read || "قراءة"}</span>
              <span className="sm:hidden">{messages?.quran?.read || "قراءة"}</span>
            </button>
            <button
              onClick={() => handleModeToggle("learn")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                currentMode === "learn"
                  ? "bg-primary text-white shadow-md"
                  : " hover:"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{messages?.quran?.learn || "تعلم"}</span>
              <span className="sm:hidden">{messages?.quran?.learn || "تعلم"}</span>
            </button>
          </div>
        </div>

        {/* Enhanced Header with Navigation */}
        <div className="bg-background rounded-lg p-2 sm:p-4 border border-border shadow-sm">
          {/* Surah Navigation */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1 mx-4 my-1">
              <h1 className="text-lg sm:text-2xl font-bold  mb-1">
                {messages?.quran?.surah || "سورة"} {currentSurah?.name || currentSurah?.arabicName}
              </h1>
              <p className="text-xs sm:text-sm ">
                {currentSurah?.revelationType === "Meccan" ? (messages?.quran?.meccan || "مكية") : (messages?.quran?.medinan || "مدنية")} • {currentSurah?.numberOfAyahs} {messages?.quran?.verses || "آيات"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-background rounded-lg border border-border">
          <div className="space-y-4">
            {/* Font Size Control */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium ">{messages?.quran?.fontSize || "حجم الخط"}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-background transition-colors"
                >
                  -
                </button>
                <span className="text-sm min-w-[3ch] text-center font-medium">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(60, fontSize + 2))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-background transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Line Height Control */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium ">{messages?.quran?.lineSpacing || "تباعد الأسطر"}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLineHeight(Math.max(1.5, lineHeight - 0.1))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-background transition-colors"
                >
                  -
                </button>
                <span className="text-sm min-w-[3ch] text-center font-medium">{lineHeight.toFixed(1)}</span>
                <button
                  onClick={() => setLineHeight(Math.min(3.5, lineHeight + 0.1))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-background transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Translation Toggle (only for learn mode) */}
            {currentMode === "learn" && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium ">{messages?.quran?.translation || "الترجمة"}</label>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    showTranslation
                      ? "bg-primary text-white"
                      : "bg-background border border-border hover:bg-background "
                  }`}
                >
                  {showTranslation ? (messages?.quran?.hideTranslation || "إخفاء") : (messages?.quran?.showTranslation || "إظهار")}
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
            <div className="sticky top-4">
              <SurahsList
          surahs={surahs}
          selectedSurah={selectedSurah}
          onSurahSelect={handleSurahSelect}
          messages={messages}
          loading={surahsLoading}
              />
            </div>
          </div>
        )}

        {/* Content Panel */}
        <div className={currentMode === "learn" ? "lg:col-span-3" : "col-span-1"}>
          <div className="bg-background rounded-lg shadow-lg border border-border">
            {/* Reading Controls (only for learn mode) */}
              <ReadingControls
                showTranslation={showTranslation}
                fontSize={fontSize}
                showSettings={showSettings}
                onTranslationToggle={() => setShowTranslation(!showTranslation)}
                onFontSizeChange={setFontSize}
                onSettingsToggle={() => setShowSettings(!showSettings)}
                messages={messages}
              currentMode={currentMode}
              />
            {/* Surah Navigation */}
            <div className="flex justify-between items-center mt-6 mx-4" dir={locale === "ar" ? "rtl" : "ltr"}>
              <button
                onClick={goToPreviousSurah}
                disabled={selectedSurah <= 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-background hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
              >
                <ChevronLeft className="w-4 h-4" />
                {/* السورة السابقة */}
              </button>

              <div className="text-center">
                <select
                  value={selectedSurah}
                  onChange={(e) => handleSurahSelect(Number(e.target.value))}
                  className="px-4 py-2 rounded-lg bg-background border border-border  focus:outline-none focus:ring-2 focus:ring-primary text-center"
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
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-background hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
              >
                <ChevronRight className="w-4 h-4" />
                {/* السورة التالية */}
              </button>
            </div>
            <div className="p-2 sm:p-6">
              {currentMode === "read" ? (
                /* Read Mode - Continuous Text */
                <div className="text-justify leading-loose quran-text">
                  {/* Ayah Actions Panel */}
                  {selectedAyah && (
                    <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium  mb-1">
                            {messages?.quran?.ayah || "آية"} {selectedAyah} - {messages?.quran?.surah || "سورة"} {currentSurah?.name}
                          </h3>
                          <p className="text-xs ">
                            {selectedSurah}:{selectedAyah}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePlayAyah(selectedAyah!)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-primary hover:bg-primary/80 text-foreground transition-colors"
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
                              ? (messages?.quran?.stop || "إيقاف")
                              : (messages?.quran?.playFromHere || "تشغيل من هنا")}
                          </button>

                          {/* Show continuous play indicator */}
                          {audioPlayer.isPlaying && autoPlay && audioPlayer.currentSurah === selectedSurah && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg">
                              <span>🔄</span>
                              <span>{messages?.quran?.continuousPlay || "تشغيل متواصل"}</span>
                            </div>
                          )}

                          <button
                            onClick={() => handleBookmarkToggle(selectedSurah, selectedAyah!)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                          >
                            <BookOpen className="w-4 h-4" />
                            {messages?.quran?.bookmark || "إشارة مرجعية"}
                          </button>
                        </div>
                      </div>

                      {/* Tafsir */}
                      {showTafsir && (
                        <div className="mt-4 p-1 sm:p-4 bg-background rounded-lg border border-border">
                          <h4 className="text-sm font-medium  mb-2">{messages?.quran?.tafsir || "التفسير"}</h4>
                          <p className="text-sm ">
                            {messages?.quran?.tafsirPlaceholder || "Tafsir content will be available soon"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Bismillah */}
                  {selectedSurah !== 1 && selectedSurah !== 9 && (
                    <div className="text-center mb-8">
                      <p
                        className=" leading-relaxed"
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
                    className=""
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      wordSpacing: "0.2em",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {ayahs.map((ayah: any, index: number) => {
                      const withoutBismillah = selectedSurah !== 1 && selectedSurah !== 9;
                      if (index === 0 && withoutBismillah) {
                        // Remove Bismillah from the beginning of the ayah text
                        ayah = {
                          ...ayah,
                          text: ayah.text.substring(38).trim(),
                        };
                      }
                      return (
                        <span key={ayah.number}>
                          <span
                            className={`cursor-pointer transition-all duration-200 hover:bg-primary/10 rounded px-1 ${
                              selectedAyah === ayah.numberInSurah
                                ? "bg-primary/20 shadow-sm"
                                : ""
                            }`}
                            onClick={() => handleAyahClick(ayah.numberInSurah)}
                            title={`${messages?.quran?.ayah || "آية"} ${ayah.numberInSurah}`}
                          >
                            {ayah.text}
                          </span>{" "}
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 mx-2 ${
                              audioPlayer.currentAyah === ayah.numberInSurah && 
                              audioPlayer.currentSurah === selectedSurah
                                ? "bg-primary text-white"
                                : selectedAyah === ayah.numberInSurah
                                  ? "bg-primary/80 text-foreground"
                                  : "bg-primary/20 text-primary hover:bg-primary/30"
                            }`}
                            onClick={() => handleAyahClick(ayah.numberInSurah)}
                            style={{ fontSize: "12px" }}
                          >
                            {ayah.numberInSurah}
                          </span>
                          {index < ayahs.length - 1 && " "}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ) : (
                /* Learn Mode - Ayah by Ayah */
                <AyahsList
                  ayahs={ayahs}
                  translations={translations}
                  currentSurah={currentSurah}
                  selectedSurah={selectedSurah}
                  showTranslation={showTranslation}
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



          {/* Bookmarks Summary */}
          {bookmarkedAyahs.size > 0 && (
            <div className="mt-8 p-4 bg-background border border-border rounded-lg">
              <h3 className="font-semibold  mb-2">
                {messages?.quran?.bookmarks || "Bookmarks"} ({bookmarkedAyahs.size})
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...bookmarkedAyahs].map((bookmark) => (
                  <span
                    key={bookmark}
                    className="inline-block px-3 py-1 bg-primary text-white text-sm rounded-full"
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
