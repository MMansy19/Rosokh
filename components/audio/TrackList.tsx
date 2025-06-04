import React from 'react';
import { Music, Sparkles } from 'lucide-react';
import { AudioTrack } from '../../types/audio';
import { TrackCard } from './TrackCard';

interface TrackListProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  favorites: string[];
  viewMode: 'grid' | 'list';
  onPlay: (track: AudioTrack) => void;
  onPause: () => void;
  onToggleFavorite: (trackId: string) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  favorites,
  viewMode,
  onPlay,
  onPause,
  onToggleFavorite
}) => {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6 relative">
          <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
            <Music className="w-12 h-12 text-muted-foreground/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">No tracks found</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          Try adjusting your search terms or filters to discover beautiful Islamic audio content.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
          <span>🎵</span>
          <span>Explore our collection of Quran recitations, duas, and lectures</span>
          <span>🕌</span>
        </div>
      </div>
    );
  }

  const containerClass = viewMode === 'grid' 
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-3';

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-foreground">
              Audio Tracks
            </h2>
          </div>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </div>
        </div>
        
        {/* View Mode Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{viewMode} view</span>
          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
          <span>{viewMode === 'grid' ? '🔲' : '📄'}</span>
        </div>
      </div>

      {/* Tracks Container */}
      <div className={containerClass}>
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            isPlaying={currentTrack?.id === track.id && isPlaying}
            isFavorite={favorites.includes(track.id)}
            onPlay={onPlay}
            onPause={onPause}
            onToggleFavorite={onToggleFavorite}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Footer Info */}
      {tracks.length > 0 && (
        <div className="text-center pt-8 border-t border-border/50">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <span>🎧</span>
              <span>High-quality audio</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>Mobile optimized</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Fast streaming</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
