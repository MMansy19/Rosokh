import React from 'react';
import { BookOpen, Heart, Mic, Sparkles, Music } from 'lucide-react';
import { getTranslation } from '@/utils/translations';

interface CategoriesBreakdownProps {
  categories: {
    quran: number;
    dua: number;
    lecture: number;
    nasheed: number;
  };
  locale: string;
  messages: any;
}

const getCategoryIcon = (category: string) => {
  const iconProps = { className: "w-5 h-5" };
  switch (category) {
    case 'quran': return <BookOpen {...iconProps} />;
    case 'dua': return <Heart {...iconProps} />;
    case 'lecture': return <Mic {...iconProps} />;
    case 'nasheed': return <Sparkles {...iconProps} />;
    default: return <Music {...iconProps} />;
  }
};

export const CategoriesBreakdown: React.FC<CategoriesBreakdownProps> = React.memo(({ 
  categories, 
  locale, 
  messages 
}) => {
  return (
    <section className="mb-6">
      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
        <span role="img" aria-label="Chart">📊</span>
        <span>{getTranslation(messages, 'audio.stats.categoriesTitle', 'Content Categories')}</span>
      </h4>
      <div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        role="region"
        aria-label={getTranslation(messages, 'audio.stats.categoriesLabel', 'Content categories breakdown')}
      >
        {Object.entries(categories).map(([category, count]) => (
          <div 
            key={category} 
            className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/20"
            role="listitem"
            aria-label={`${getTranslation(messages, `audio.categories.${category}`, category)}: ${count} ${getTranslation(messages, 'audio.stats.tracks', 'tracks')}`}
          >
            <div className="text-muted-foreground" aria-hidden="true">
              {getCategoryIcon(category)}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {getTranslation(messages, `audio.categories.${category}`, category)}
              </div>
              <div className="text-xs text-muted-foreground">
                {count} {getTranslation(messages, 'audio.stats.tracks', 'tracks')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

CategoriesBreakdown.displayName = 'CategoriesBreakdown';
