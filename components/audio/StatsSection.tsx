import React from 'react';
import { Music, Users, Clock, Download, Sparkles, Heart, BookOpen, Mic } from 'lucide-react';
import { AudioTrack } from '../../types/audio';

interface StatsSectionProps {
  tracks: AudioTrack[];
  favoriteCount: number;
  isVisible?: boolean;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ 
  tracks, 
  favoriteCount, 
  isVisible = true 
}) => {
  if (!isVisible || tracks.length === 0) return null;

  // Calculate statistics
  const stats = {
    totalTracks: tracks.length,
    totalReciters: new Set(tracks.map(track => track.reciter.id)).size,
    totalDuration: tracks.reduce((acc, track) => {
      const duration = track.duration.split(':');
      const minutes = parseInt(duration[0]) * 60 + parseInt(duration[1]);
      return acc + minutes;
    }, 0),
    categories: {
      quran: tracks.filter(t => t.category === 'quran').length,
      dua: tracks.filter(t => t.category === 'dua').length,
      lecture: tracks.filter(t => t.category === 'lecture').length,
      nasheed: tracks.filter(t => t.category === 'nasheed').length,
    },
    qualities: {
      high: tracks.filter(t => t.quality === 'high').length,
      medium: tracks.filter(t => t.quality === 'medium').length,
      low: tracks.filter(t => t.quality === 'low').length,
    }
  };

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quran': return <BookOpen className="w-5 h-5" />;
      case 'dua': return <Heart className="w-5 h-5" />;
      case 'lecture': return <Mic className="w-5 h-5" />;
      case 'nasheed': return <Sparkles className="w-5 h-5" />;
      default: return <Music className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-muted/30 via-background to-muted/20 rounded-2xl border border-border/50 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Collection Statistics</h3>
            <p className="text-sm text-muted-foreground">Your Islamic audio library overview</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{stats.totalTracks}</div>
          <div className="text-xs text-muted-foreground">Total Tracks</div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-background/50 rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-semibold text-foreground">{stats.totalReciters}</div>
          </div>
          <div className="text-sm text-muted-foreground">Reciters</div>
        </div>

        <div className="bg-background/50 rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-xl font-semibold text-foreground">{formatDuration(stats.totalDuration)}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Duration</div>
        </div>

        <div className="bg-background/50 rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-xl font-semibold text-foreground">{favoriteCount}</div>
          </div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </div>

        <div className="bg-background/50 rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl font-semibold text-foreground">HD</div>
          </div>
          <div className="text-sm text-muted-foreground">Quality</div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>Content Categories</span>
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(stats.categories).map(([category, count]) => (
            <div key={category} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/20">
              <div className="text-muted-foreground">
                {getCategoryIcon(category)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground capitalize">{category}</div>
                <div className="text-xs text-muted-foreground">{count} tracks</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Distribution */}
      <div>
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <span>🎧</span>
          <span>Audio Quality</span>
        </h4>
        <div className="space-y-2">
          {Object.entries(stats.qualities).map(([quality, count]) => {
            const percentage = (count / stats.totalTracks) * 100;
            const colorClass = quality === 'high' ? 'bg-green-500' : quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={quality} className="flex items-center gap-3">
                <div className="w-16 text-sm text-muted-foreground capitalize">{quality}</div>
                <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${colorClass} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-muted-foreground text-right">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border/30 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>🌟</span>
            <span>Premium Quality</span>
          </span>
          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
          <span className="flex items-center gap-1">
            <span>🕌</span>
            <span>Islamic Content</span>
          </span>
          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
          <span className="flex items-center gap-1">
            <span>📱</span>
            <span>Mobile Friendly</span>
          </span>
        </div>
      </div>
    </div>
  );
};
