import React from 'react';
import { Music } from 'lucide-react';
import { getTranslation } from '@/utils/translations';

interface StatsHeaderProps {
  totalTracks: number;
  locale: string;
  messages: any;
}

export const StatsHeader: React.FC<StatsHeaderProps> = React.memo(({ 
  totalTracks, 
  locale, 
  messages 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center"
          role="img"
          aria-label={getTranslation(messages, 'audio.stats.iconAlt', 'Music collection icon')}
        >
          <Music className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {getTranslation(messages, 'audio.stats.title', 'Collection Statistics')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getTranslation(messages, 'audio.stats.subtitle', 'Your Islamic audio library overview')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div 
          className="text-2xl font-bold text-primary"
          aria-label={`${totalTracks} ${getTranslation(messages, 'audio.stats.totalTracks', 'Total Tracks')}`}
        >
          {totalTracks}
        </div>
        <div className="text-xs text-muted-foreground">
          {getTranslation(messages, 'audio.stats.totalTracks', 'Total Tracks')}
        </div>
      </div>
    </div>
  );
});

StatsHeader.displayName = 'StatsHeader';
