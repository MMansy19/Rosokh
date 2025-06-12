import React, { useState } from "react";
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

interface QuranReadProps {
  locale: string;
  messages: any;
}

export const QuranRead: React.FC<QuranReadProps> = ({ locale, messages }) => {
  const { notify } = useNotifications();
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);

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
  // Handle surah selection
  const handleSurahSelect = (surahNumber: number) => {
    const previousSurah = selectedSurah;
    setSelectedSurah(surahNumber);

    analytics.trackEvent("surah_select", "user", {
      fromSurah: previousSurah,
      toSurah: surahNumber,
      surahName: surahs.find((s: Surah) => s.number === surahNumber)
        ?.englishName,
      arabicName: surahs.find((s: Surah) => s.number === surahNumber)?.name,
    });
  };

  // Handle audio actions
  const handlePlayAyah = (ayahNumber: number) => {
    playAyah(ayahNumber, selectedSurah);
  };

  const playNextAyah = (currentAyahNumber: number) => {
    if (repeatMode === "verse") {
      playAyah(currentAyahNumber, selectedSurah);
      return;
    }
    const nextAyah = ayahs.find(
      (ayah: Ayah) => ayah.numberInSurah === currentAyahNumber + 1,
    );
    if (nextAyah) {
      setTimeout(() => playAyah(nextAyah.numberInSurah, selectedSurah), 1000);
    } else if (repeatMode === "surah") {
      setTimeout(() => playAyah(1, selectedSurah), 1000);
    }
  };

  const playPreviousAyah = () => {
    if (audioPlayer.currentAyah && audioPlayer.currentAyah > 1) {
      playAyah(audioPlayer.currentAyah - 1, selectedSurah);
    }
  };

  const playFullSurah = async () => {
    if (ayahs.length > 0) {
      analytics.trackEvent("surah_full_play", "engagement", {
        surahNumber: selectedSurah,
        surahName:
          locale === "ar" ? currentSurah?.name : currentSurah?.englishName,
        totalAyahs: ayahs.length,
        reciter: audioPlayer.reciter,
      });

      setAutoPlay(true);
      await playAyah(1, selectedSurah);

      notify.info(
        messages?.quran?.playingFullSurah?.replace(
          "{name}",
          locale === "ar"
            ? currentSurah?.name
            : currentSurah?.englishName || `Surah ${selectedSurah}`,
        ) ||
          `Playing full ${locale === "ar" ? currentSurah?.name : currentSurah?.englishName || `Surah ${selectedSurah}`}`,
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
      }
    } else {
      try {
        if ("clipboard" in navigator && (navigator as any).clipboard) {
          await (navigator as any).clipboard.writeText(shareText);
          notify.success(
            messages?.quran?.copiedToClipboard || "Verse copied to clipboard",
          );
        }
      } catch (error) {
        notify.error(
          messages?.quran?.errors?.copyFailed ||
            "Failed to copy verse to clipboard",
        );
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

  // Handle font size change
  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    analytics.trackEvent("font_size_change", "user", {
      oldSize: fontSize,
      newSize,
      surahNumber: selectedSurah,
    });
  };

  // Handle toggle functions
  const handleTranslationToggle = () => {
    const newValue = !showTranslation;
    setShowTranslation(newValue);
    analytics.trackEvent("translation_toggle", "user", {
      enabled: newValue,
      surahNumber: selectedSurah,
      locale,
    });
  };

  const handleTransliterationToggle = () => {
    const newValue = !showTransliteration;
    setShowTransliteration(newValue);
    analytics.trackEvent("transliteration_toggle", "user", {
      enabled: newValue,
      surahNumber: selectedSurah,
      locale,
    });
  };

  const currentSurah = surahs.find((s: Surah) => s.number === selectedSurah);
  const loading = surahsLoading || ayahsLoading;

  // Error handling
  if (surahsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {messages?.quran?.errors?.surahsLoad ||
            "Failed to load Quran chapters"}
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

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          if (autoPlay && audioPlayer.currentAyah) {
            playNextAyah(audioPlayer.currentAyah);
          }
        }}
      />

      {/* Audio Player Bar */}
      <AudioPlayerBar
        audioPlayer={audioPlayer}
        repeatMode={repeatMode}
        autoPlay={autoPlay}
        currentSurah={currentSurah}
        onPlayPause={togglePlayPause}
        onPrevious={playPreviousAyah}
        onNext={() =>
          audioPlayer.currentAyah && playNextAyah(audioPlayer.currentAyah)
        }
        onRepeatModeChange={handleRepeatModeChange}
        onAutoPlayToggle={() => setAutoPlay(!autoPlay)}
        onPlayFullSurah={playFullSurah}
        onSpeedChange={updateSpeed}
        onVolumeToggle={toggleMute}
        onReciterChange={updateReciter}
        onVolumeChange={updateVolume}
        showSettings={showSettings}
        messages={messages}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Surahs List */}
        <div className="lg:col-span-1">
          <SurahsList
            surahs={surahs}
            selectedSurah={selectedSurah}
            onSurahSelect={handleSurahSelect}
            messages={messages}
            loading={surahsLoading}
          />
        </div>

        {/* Reading Panel */}
        <div className="lg:col-span-3">
          <div className="bg-surface rounded-lg shadow-lg border border-border">
            {/* Control Bar */}
            <ReadingControls
              showTranslation={showTranslation}
              showTransliteration={showTransliteration}
              fontSize={fontSize}
              showSettings={showSettings}
              onTranslationToggle={handleTranslationToggle}
              onTransliterationToggle={handleTransliterationToggle}
              onFontSizeChange={handleFontSizeChange}
              onSettingsToggle={() => setShowSettings(!showSettings)}
              messages={messages}
            />

            <div className="p-6">
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
              />
            </div>
          </div>
        </div>
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
    </>
  );
};
