"use client";
import React, { useState, useMemo } from 'react';
import { AudioTrack } from '../../types/audio';
import { useAudioData } from '../../hooks/useAudioData';
import { useFavorites } from '../../hooks/useFavorites';
import { useFilters } from '../../hooks/useFilters';
import { SearchFilters } from './SearchFilters';
import { TrackList } from './TrackList';
import { AudioPlayer } from './AudioPlayer';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';
import { filterTracks, showNotification } from '../../utils/audioUtils';

export const AudioClient: React.FC = () => {
  // Data fetching
  const { data, loading, error, refetch } = useAudioData();
  
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
    clearFilters
  } = useFilters();

  // Audio player state
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);  // Filter tracks based on search and filters
  const filteredTracks = useMemo(() => {
    if (!data?.tracks) return [];
    return filterTracks(data.tracks, searchTerm, filters, Array.from(favorites));
  }, [data?.tracks, searchTerm, filters, favorites]);

  // Handle play/pause
  const handlePlay = (track: AudioTrack) => {
    if (currentTrack?.id !== track.id) {
      setCurrentTrack(track);
      setIsPlayerExpanded(true);
      showNotification(`Now playing: ${track.title}`, 'success');
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTogglePlayer = () => {
    setIsPlayerExpanded(!isPlayerExpanded);
  };
  // Handle favorite toggle
  const handleToggleFavorite = (trackId: string) => {
    const track = data?.tracks?.find((t: AudioTrack) => t.id === trackId);
    if (track) {
      toggleFavorite(trackId);
      const isFavorite = favorites.has(trackId);
      showNotification(
        `${isFavorite ? 'Removed from' : 'Added to'} favorites: ${track.title}`,
        'success'
      );
    }
  };

  // Error handling
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState 
          error={error} 
          onRetry={refetch}
          type="network"
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState 
          message="Loading your Islamic audio collection..."
          showSkeleton={true}
        />
      </div>
    );
  }
  const tracks = data?.tracks || [];
  const favoriteCount = favorites.size;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Islamic Audio Library
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Discover beautiful Quran recitations, Islamic lectures, duas, and nasheeds from renowned scholars and reciters worldwide
        </p>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchTerm={searchTerm}
        filters={filters}
        viewMode={viewMode}
        favoriteCount={favoriteCount}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        onViewModeChange={setViewMode}
        onClearFilters={clearFilters}
      />

      {/* Statistics Section */}
      <StatsSection 
        tracks={filteredTracks}
        favoriteCount={favoriteCount}
        isVisible={filteredTracks.length > 0}
      />      {/* Track List */}
      <TrackList
        tracks={filteredTracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        favorites={Array.from(favorites)}
        viewMode={viewMode}
        onPlay={handlePlay}
        onPause={handlePause}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
          <div className="container mx-auto px-4">
            <AudioPlayer
              track={currentTrack}
              isExpanded={isPlayerExpanded}
              onToggleExpand={handleTogglePlayer}
            />
          </div>
        </div>
      )}

      {/* Features Section - Show when no tracks or as fallback */}
      <FeaturesSection 
        isVisible={filteredTracks.length === 0 && !loading}
      />      {/* Bottom Spacing for Fixed Player */}
      {currentTrack && <div className="h-32"></div>}
    </div>
  );
};