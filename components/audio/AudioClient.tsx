"use client";
import React, { useState, useMemo, useEffect } from "react";
import { AudioTrack } from "@/types/audio";
import { useAudioData } from "@/hooks/useAudioData";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";
import { useNotifications } from "@/contexts/GlobalContext";
import { SearchFilters } from "./SearchFilters";
import { TrackList } from "./TrackList";
import { AudioPlayer } from "./AudioPlayer";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { StatsSection } from "./StatsSection";
import { FeaturesSection } from "./FeaturesSection";
import { filterTracks } from "@/utils/audioUtils";
import { getTranslation } from "@/utils/translations";
import { AnalyticsService } from "@/services/AnalyticsService";
import { NotificationService } from "@/services/NotificationService";

interface AudioClientProps {
  locale: string;
  messages: any;
}

export const AudioClient: React.FC<AudioClientProps> = ({
  locale,
  messages,
}) => {
  const dir = locale === "ar" ? "rtl" : "ltr";
  // Notification and Analytics services
  const { notify } = useNotifications();
  const analytics = useMemo(() => AnalyticsService.getInstance(), []);
  const notifications = useMemo(() => NotificationService.getInstance(), []);

  // Favorites management
  const { favorites, toggleFavorite } = useFavorites();

  // Filters and search
  const {
    searchTerm,
    filters,
    viewMode,
    setSearchTerm,
    setFilters,
    setViewMode,
    clearFilters,
  } = useFilters();

  // Data fetching with filters - memoize to prevent unnecessary re-renders
  const audioFilters = useMemo(
    () => ({
      reciter: filters.reciter !== "all" ? filters.reciter : undefined,
    }),
    [filters.reciter],
  );

  const { data, loading, error, refetch } = useAudioData(audioFilters);
  // Audio player state
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false); // Track page view and session start
  useEffect(() => {
    analytics.trackPageView("/audio", "Audio Library");
    analytics.trackEvent("audio_library_visit", "user", {
      timestamp: new Date().toISOString(),
      locale,
      section: "audio-library",
    });
  }, [analytics, locale]); // Filter tracks based on search and filters (excluding reciter since API handles that)

  const filteredTracks = useMemo(() => {
    if (!data?.tracks) return [];

    // Create filters without reciter since API already handles that
    const clientFilters = {
      category: filters.category,
      quality: filters.quality,
      reciter: "all", // Don't filter by reciter on client side
      showFavoritesOnly: filters.showFavoritesOnly,
    };

    return filterTracks(
      data.tracks,
      searchTerm,
      clientFilters,
      Array.from(favorites),
    );
  }, [
    data?.tracks,
    searchTerm,
    filters.category,
    filters.quality,
    filters.showFavoritesOnly,
    favorites,
  ]); // Handle play/pause

  const handlePlay = async (track: AudioTrack) => {
    try {
      if (currentTrack?.id !== track.id) {
        setCurrentTrack(track);
        setIsPlayerExpanded(true); // Track audio play event
        analytics.trackEvent("audio_play", "engagement", {
          trackId: track.id,
          trackTitle: track.title,
          category: track.category || "unknown",
          duration: track.duration || 0,
        });

        notify.success(
          `${getTranslation(messages, "audio.player.nowPlaying", "Now playing")}: ${track.title}`,
        );
      }
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
      notify.error(
        getTranslation(
          messages,
          "audio.player.playError",
          "Error playing audio track",
        ),
      );
    }
  };
  const handlePause = () => {
    setIsPlaying(false);

    // Track pause event
    if (currentTrack) {
      analytics.trackEvent("audio_pause", "engagement", {
        trackId: currentTrack.id,
        trackTitle: currentTrack.title,
      });
    }
  };

  const handleTogglePlayer = () => {
    setIsPlayerExpanded(!isPlayerExpanded);
  };

  const handleStopAudio = () => {
    if (currentTrack) {
      // Track stop event
      analytics.trackEvent("audio_stop", "engagement", {
        trackId: currentTrack.id,
        trackTitle: currentTrack.title,
      });
    }

    setCurrentTrack(null);
    setIsPlaying(false);
    setIsPlayerExpanded(false);
    notify.info(
      getTranslation(messages, "audio.player.stopped", "Audio stopped"),
    );
  }; // Handle favorite toggle
  const handleToggleFavorite = (trackId: string) => {
    const track = data?.tracks?.find((t: AudioTrack) => t.id === trackId);
    if (track) {
      toggleFavorite(trackId);
      const isFavorite = favorites.has(trackId);

      // Track favorite action
      analytics.trackEvent("audio_favorite", "engagement", {
        trackId,
        trackTitle: track.title,
        action: isFavorite ? "add" : "remove",
      });

      const action = isFavorite
        ? getTranslation(
            messages,
            "audio.track.removeFromFavorites",
            "Removed from",
          )
        : getTranslation(messages, "audio.track.addToFavorites", "Added to");
      notify.success(
        `${action} ${getTranslation(messages, "common.favorites", "favorites")}: ${track.title}`,
      );
    }
  }; // Error handling
  if (error) {
    // Track error
    analytics.trackEvent("audio_load_error", "error", {
      errorMessage: error,
      errorType: "data_fetch",
      section: "audio-library",
    });

    return (
      <div className="container mx-auto px-4 py-8">
        {" "}
        <ErrorState
          error={error}
          onRetry={refetch}
          type="network"
          locale={locale}
          messages={messages}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState
          message={getTranslation(
            messages,
            "audio.loading.loadingAudio",
            "Loading your Islamic audio collection...",
          )}
          showSkeleton={true}
          locale={locale}
          messages={messages}
        />
      </div>
    );
  }
  const tracks = data || [];
  const favoriteCount = favorites.size;

  return (
    <div dir={dir} className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            <span className="text-2xl"></span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            {getTranslation(messages, "audio.title", "Islamic Audio Library")}
          </h1>
        </div>
      </div>{" "}
      {/* Search and Filters */}
      <SearchFilters
        searchTerm={searchTerm}
        filters={filters}
        viewMode={viewMode}
        favoriteCount={favoriteCount}
        reciters={data?.reciters || []}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        onViewModeChange={setViewMode}
        onClearFilters={clearFilters}
        locale={locale}
        messages={messages}
      />
      {/* Statistics Section */}
      <StatsSection
        tracks={filteredTracks}
        favoriteCount={favoriteCount}
        isVisible={filteredTracks.length > 0}
        locale={locale}
        messages={messages}
      />{" "}
      {/* Track List */}
      <TrackList
        tracks={filteredTracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        favorites={Array.from(favorites)}
        viewMode={viewMode}
        locale={locale}
        messages={messages}
        onPlay={handlePlay}
        onPause={handlePause}
        onToggleFavorite={handleToggleFavorite}
      />
      {/* Audio Player */}{" "}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-primary">
          <div className="container mx-auto md:px-4 px-2">
            <AudioPlayer
              track={currentTrack}
              isExpanded={isPlayerExpanded}
              onToggleExpand={handleTogglePlayer}
              onClose={handleStopAudio}
              locale={locale}
              messages={messages}
            />
          </div>
        </div>
      )}
      {/* Features Section - Show when no tracks or as fallback */}
      <FeaturesSection
        isVisible={filteredTracks.length === 0 && !loading}
      />{" "}
      {/* Bottom Spacing for Fixed Player */}
      {currentTrack && <div className="h-32"></div>}
    </div>
  );
};
