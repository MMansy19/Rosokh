import React from 'react';
import { getTranslation } from '@/utils/translations';

interface StatsFooterProps {
  locale: string;
  messages: any;
}

export const StatsFooter: React.FC<StatsFooterProps> = React.memo(({ 
  locale, 
  messages 
}) => {
  const features = [
    {
      emoji: '🌟',
      text: getTranslation(messages, 'audio.stats.premiumQuality', 'Premium Quality')
    },
    {
      emoji: '🕌',
      text: getTranslation(messages, 'audio.stats.islamicContent', 'Islamic Content')
    },
    {
      emoji: '📱',
      text: getTranslation(messages, 'audio.stats.mobileFriendly', 'Mobile Friendly')
    }
  ];

  return (
    <footer className="mt-6 pt-4 border-t border-border/30 text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {features.map((feature, index) => (
          <React.Fragment key={index}>
            <span className="flex items-center gap-1">
              <span role="img" aria-hidden="true">{feature.emoji}</span>
              <span>{feature.text}</span>
            </span>
            {index < features.length - 1 && (
              <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
});

StatsFooter.displayName = 'StatsFooter';
