import React from 'react';
import { Play, Pause, Heart, Download, Clock, User, BookOpen } from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { getGoogleDriveDownloadUrl, showNotification } from '@/utils/audioUtils';
import { QUALITY_COLORS } from '@/constants/audio';

interface TrackCardProps {
  track: AudioTrack;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (track: AudioTrack) => void;
  onPause: () => void;
  onToggleFavorite: (trackId: string) => void;
  viewMode: 'grid' | 'list';
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isFavorite,
  onPlay,
  onPause,
  onToggleFavorite,
  viewMode
}) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = getGoogleDriveDownloadUrl(track.id);
    window.open(downloadUrl, '_blank');
    showNotification(`Started downloading "${track.title}"`, 'success');
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(track.id);
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause();
    } else {
      onPlay(track);
    }
  };

  const qualityColor = QUALITY_COLORS[track.quality];

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-card via-card/95 to-card/90 hover:from-card/90 hover:via-card hover:to-card/95 rounded-lg border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg backdrop-blur-sm">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary flex items-center justify-center text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group-hover:shadow-primary/25"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate text-lg">
                {track.title}
              </h3>
              {track.arabicTitle && (
                <p className="text-muted-foreground/80 text-right mt-1 font-arabic text-lg leading-relaxed">
                  {track.arabicTitle}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{track.reciter.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{track.duration}</span>
                </div>
                {track.surah && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Surah {track.surah}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${qualityColor} flex-shrink-0`}>
              {track.quality.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
              isFavorite
                ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900'
                : 'text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-all duration-200 hover:scale-110"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group relative bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"></div>
      </div>

      <div className="relative p-6">
        {/* Header with Quality Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${qualityColor}`}>
            {track.quality.toUpperCase()}
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
              isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Track Title */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-lg leading-tight">
            {track.title}
          </h3>
          {track.arabicTitle && (
            <p className="text-muted-foreground/80 text-right font-arabic text-lg leading-relaxed line-clamp-2">
              {track.arabicTitle}
            </p>
          )}
        </div>

        {/* Track Info */}
        <div className="space-y-2 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{track.reciter.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{track.duration}</span>
            </div>
            {track.surah && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span>Surah {track.surah}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group-hover:shadow-primary/25"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Play</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-3 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
