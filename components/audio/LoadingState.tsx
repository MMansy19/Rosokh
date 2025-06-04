import React from 'react';
import { Loader2, Music, Sparkles, Heart, BookOpen } from 'lucide-react';
import { getTranslation } from '../../utils/translations';

interface LoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
  locale: string;
  messages: any;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  showSkeleton = false,
  locale,
  messages
}) => {
  const loadingMessage = message || getTranslation(messages, 'audio.loading.audioTracks', 'Loading audio tracks...');
  if (showSkeleton) {
    return (
      <div className="space-y-6">
        {/* Search Bar Skeleton */}
        <div className="h-14 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl animate-pulse"></div>
        
        {/* Filters Skeleton */}
        <div className="flex flex-wrap gap-4">
          <div className="h-8 w-32 bg-muted/50 rounded-lg animate-pulse"></div>
          <div className="h-8 w-28 bg-muted/50 rounded-lg animate-pulse"></div>
          <div className="h-8 w-24 bg-muted/50 rounded-lg animate-pulse"></div>
        </div>

        {/* Track Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border border-border/50 p-6 animate-pulse"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-16 bg-muted/50 rounded-full"></div>
                <div className="h-6 w-6 bg-muted/50 rounded-full"></div>
              </div>

              {/* Title */}
              <div className="space-y-2 mb-4">
                <div className="h-5 w-full bg-muted/50 rounded"></div>
                <div className="h-4 w-3/4 bg-muted/30 rounded"></div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-6">
                <div className="h-4 w-2/3 bg-muted/50 rounded"></div>
                <div className="h-4 w-1/2 bg-muted/50 rounded"></div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-muted/50 rounded-lg"></div>
                <div className="h-10 w-10 bg-muted/50 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated Icons */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="relative">
            <Music className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-secondary animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          <div className="relative">
            <BookOpen className="w-8 h-8 text-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute -top-1 -right-1">
              <Heart className="w-4 h-4 text-red-500 animate-bounce" style={{ animationDelay: '0.7s' }} />
            </div>
          </div>
        </div>

        {/* Central Loading Spinner */}
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>

      {/* Loading Message */}      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {loadingMessage}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
          {getTranslation(messages, 'audio.loading.message', 'We\'re preparing your Islamic audio collection with beautiful recitations and spiritual content.')}
        </p>

        {/* Loading Progress Dots */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};
