import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  Play,
  Pause,
} from "lucide-react";
import { useSurahs } from "./hooks/useSurahs";
import { useAyahs } from "./hooks/useAyahs";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useBookmarks } from "./hooks/useBookmarks";
import { AudioPlayerBar } from "./ui/AudioPlayerBar";
import { AnalyticsService } from "@/services/AnalyticsService";
import { useNotifications } from "@/contexts/GlobalContext";
import { RepeatMode, Surah, Ayah } from "./types";

interface QuranUthmaniProps {
  locale: string;
  messages: any;
}

export const QuranUthmani: React.FC<QuranUthmaniProps> = ({
  locale,
  messages,
}) => {
  const { notify } = useNotifications();
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [fontSize, setFontSize] = useState(32);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [lineHeight, setLineHeight] = useState(2.5);

  // Use the same hooks as in the learn tab
  const { surahs, loading: surahsLoading, error: surahsError } = useSurahs();
  const {
    ayahs,
    loading: ayahsLoading,
    error: ayahsError,
  } = useAyahs(currentSurah, locale);

  // Add audio player hook
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
  } = useAudioPlayer(messages);

  // Analytics
  const analytics = AnalyticsService.getInstance();

  // Get current surah info from the surahs list
  const currentSurahInfo = surahs.find(
    (surah) => surah.number === currentSurah,
  );

  // Combined loading state
  const loading = surahsLoading || ayahsLoading;
  const error = surahsError || ayahsError;

  const goToPreviousSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
      setSelectedAyah(null);
    }
  };

  const goToNextSurah = () => {
    if (currentSurah < 114) {
      setCurrentSurah(currentSurah + 1);
      setSelectedAyah(null);
    }
  };

  const handleAyahClick = (ayahNumber: number) => {
    setSelectedAyah(selectedAyah === ayahNumber ? null : ayahNumber);
  };

  const handlePlayAyah = (ayahNumber: number) => {
    analytics.trackEvent("ayah_play", "engagement", {
      surahNumber: currentSurah,
      ayahNumber,
      reciter: audioPlayer.reciter,
      tabContext: "read",
    });
    playAyah(ayahNumber, currentSurah);
  };

  const playFullSurah = async () => {
    if (currentSurah) {
      analytics.trackEvent("surah_full_play", "engagement", {
        surahNumber: currentSurah,
        surahName:
          locale === "ar" ? currentSurahInfo?.name : currentSurahInfo?.englishName,
        totalAyahs: ayahs.length,
        reciter: audioPlayer.reciter,
        tabContext: "read",
      });

      await playSurah(currentSurah);

      notify.info(
        messages?.quran?.playingFullSurah?.replace(
          "{name}",
          locale === "ar"
            ? currentSurahInfo?.name
            : currentSurahInfo?.englishName || `Surah ${currentSurah}`,
        ) ||
          `Playing full ${locale === "ar" ? currentSurahInfo?.name : currentSurahInfo?.englishName || `Surah ${currentSurah}`}`,
      );
    }
  };

  const playNextAyah = (currentAyahNumber: number) => {
    if (repeatMode === "verse") {
      playAyah(currentAyahNumber, currentSurah);
      return;
    }
    const nextAyah = ayahs.find(
      (ayah: Ayah) => ayah.numberInSurah === currentAyahNumber + 1,
    );
    if (nextAyah) {
      setTimeout(() => playAyah(nextAyah.numberInSurah, currentSurah), 1000);
    } else if (repeatMode === "surah") {
      setTimeout(() => playAyah(1, currentSurah), 1000);
    }
  };

  const playPreviousAyah = () => {
    if (audioPlayer.currentAyah && audioPlayer.currentAyah > 1) {
      playAyah(audioPlayer.currentAyah - 1, currentSurah);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            خطأ في تحميل البيانات
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-4" dir="rtl">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Audio Player Bar */}
      {audioPlayer.currentAyah && (
        <AudioPlayerBar
          audioPlayer={audioPlayer}
          repeatMode={repeatMode}
          autoPlay={autoPlay}
          currentSurah={currentSurahInfo}
          onPlayPause={togglePlayPause}
          onPrevious={playPreviousAyah}
          onNext={() => playNextAyah(audioPlayer.currentAyah!)}
          onRepeatModeChange={() => {
            const modes: RepeatMode[] = ["none", "verse", "surah"];
            const currentIndex = modes.indexOf(repeatMode);
            setRepeatMode(modes[(currentIndex + 1) % modes.length]);
          }}
          onAutoPlayToggle={() => setAutoPlay(!autoPlay)}
          onPlayFullSurah={playFullSurah}
          onSpeedChange={updateSpeed}
          onVolumeToggle={toggleMute}
          onReciterChange={updateReciter}
          onVolumeChange={updateVolume}
          showSettings={showSettings}
          messages={messages}
          locale={locale}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-surface rounded-lg p-4 border border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousSurah}
            disabled={currentSurah <= 1}
            className="p-2 rounded-lg bg-background hover:bg-background/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              سورة {currentSurahInfo?.arabicName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentSurahInfo?.revelationType === "Meccan" ? "مكية" : "مدنية"}{" "}
              • {currentSurahInfo?.numberOfAyahs} آيات
            </p>
          </div>

          <button
            onClick={goToNextSurah}
            disabled={currentSurah >= 114}
            className="p-2 rounded-lg bg-background hover:bg-background/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-background hover:bg-background/80 transition-colors border border-border"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                حجم الخط
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(20, fontSize - 2))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  -
                </button>
                <span className="text-sm min-w-[3ch] text-center">
                  {fontSize}
                </span>
                <button
                  onClick={() => setFontSize(Math.min(60, fontSize + 2))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                المسافة بين السطور
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLineHeight(Math.max(1.5, lineHeight - 0.1))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  -
                </button>
                <span className="text-sm min-w-[3ch] text-center">
                  {lineHeight.toFixed(1)}
                </span>
                <button
                  onClick={() => setLineHeight(Math.min(4, lineHeight + 0.1))}
                  className="px-3 py-1 text-sm rounded bg-background border border-border hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surah Content */}
      <div className="bg-surface rounded-lg border border-border p-8 quran-text">
        {/* Bismillah */}
        {currentSurah !== 1 && currentSurah !== 9 && (
          <div className="text-center mb-8">
            <p
              className="text-foreground leading-relaxed"
              style={{
                fontSize: `${fontSize + 4}px`,
                // fontFamily: "'Amiri Quran', 'Noto Sans Arabic', serif",
                lineHeight: lineHeight,
              }}
            >
              بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
            </p>
          </div>
        )}{" "}
        {/* Continuous Verses Layout (like quran.com) */}
        <div className="text-justify leading-loose">
          <p
            className="text-foreground"
            style={{
              fontSize: `${fontSize}px`,
              // fontFamily: "'Amiri Quran', 'Noto Sans Arabic', serif",
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
                    audioPlayer.currentAyah === ayah.numberInSurah && audioPlayer.currentSurah === currentSurah
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
            ))}
          </p>
        </div>{" "}
        {/* Ayah Actions Panel */}
        {selectedAyah && (
          <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  آية {selectedAyah} - سورة {currentSurahInfo?.arabicName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentSurah}:{selectedAyah}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayAyah(selectedAyah!)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-foreground transition-colors"
                >
                  {audioPlayer.currentAyah === selectedAyah && audioPlayer.currentSurah === currentSurah && audioPlayer.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {audioPlayer.currentAyah === selectedAyah && audioPlayer.currentSurah === currentSurah && audioPlayer.isPlaying
                    ? messages?.pause || "إيقاف"
                    : messages?.play || "تشغيل"}
                </button>

                <button 
                  onClick={() => toggleBookmark(currentSurah, selectedAyah!, messages)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-foreground transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  إشارة مرجعية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goToPreviousSurah}
          disabled={currentSurah <= 1}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
        >
          <ChevronRight className="w-4 h-4" />
          السورة السابقة
        </button>
        <div className="text-center">
          <select
            value={currentSurah}
            onChange={(e) => setCurrentSurah(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center"
                      dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {surahs.map((surah) => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.arabicName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={goToNextSurah}
          disabled={currentSurah >= 114}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
        >
          السورة التالية
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
