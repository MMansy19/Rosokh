import React from 'react';
import { AudioTrack } from '@/types/audio';
import { useGlobalError } from '@/contexts/GlobalContext';
import { 
  StatsHeader, 
  MainStatsGrid, 
  CategoriesBreakdown, 
  QualityDistribution, 
  StatsFooter,
  useStatsCalculations 
} from './stats';

interface StatsSectionProps {
  tracks: AudioTrack[];
  favoriteCount: number;
  isVisible?: boolean;
  locale: string;
  messages: any;
}

export const StatsSection: React.FC<StatsSectionProps> = React.memo(({ 
  tracks, 
  favoriteCount, 
  isVisible = true,
  locale,
  messages
}) => {
  const { setError } = useGlobalError();
  const stats = useStatsCalculations(tracks);

  // Early return for empty state
  if (!isVisible || tracks.length === 0) return null;

  try {
    return (
      <article 
        className="bg-gradient-to-br from-muted/30 via-background to-muted/20 rounded-2xl border border-border/50 p-6 backdrop-blur-sm"
        role="region"
        aria-label="Audio collection statistics"
      >
        <StatsHeader 
          totalTracks={stats.totalTracks}
          locale={locale}
          messages={messages}
        />
        
        <MainStatsGrid 
          totalReciters={stats.totalReciters}
          formattedDuration={stats.formattedDuration}
          favoriteCount={favoriteCount}
          locale={locale}
          messages={messages}
        />
        
        <CategoriesBreakdown 
          categories={stats.categories}
          locale={locale}
          messages={messages}
        />
        
        <QualityDistribution 
          qualities={stats.qualities}
          totalTracks={stats.totalTracks}
          locale={locale}
          messages={messages}
        />
        
        <StatsFooter 
          locale={locale}
          messages={messages}
        />
      </article>
    );
  } catch (error) {
    setError('Failed to render stats section');
    console.error('StatsSection rendering error:', error);
    return null;
  }
});

StatsSection.displayName = 'StatsSection';
