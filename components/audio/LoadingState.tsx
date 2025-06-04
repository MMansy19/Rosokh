import React from "react";
import { Music, Sparkles, Heart, BookOpen } from "lucide-react";
import { getTranslation } from "@/utils/translations";
import {
  EnhancedLoadingState,
  SkeletonLoader,
} from "@/components/common/EnhancedLoadingState";

interface LoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
  locale: string;
  messages: any;
  showProgress?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  showSkeleton = false,
  locale,
  messages,
  showProgress = false,
  showCancel = false,
  onCancel,
}) => {
  const loadingMessage =
    message ||
    getTranslation(
      messages,
      "audio.loading.audioTracks",
      "Loading audio tracks...",
    );

  if (showSkeleton) {
    return (
      <div className="space-y-6">
        {/* Search Bar Skeleton */}
        <SkeletonLoader lines={1} className="h-14" />

        {/* Filters Skeleton */}
        <div className="flex flex-wrap gap-4">
          <div className="h-8 w-32 bg-muted/50 rounded-lg animate-pulse"></div>
          <div className="h-8 w-28 bg-muted/50 rounded-lg animate-pulse"></div>
          <div className="h-8 w-24 bg-muted/50 rounded-lg animate-pulse"></div>
        </div>

        {/* Track Cards Skeleton - Using audio-specific layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border border-border/50 p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <SkeletonLoader lines={1} className="h-4 w-16" />
                <div className="h-6 w-6 bg-muted/50 rounded-full animate-pulse"></div>
              </div>

              {/* Title */}
              <div className="space-y-2 mb-4">
                <SkeletonLoader lines={2} />
              </div>

              {/* Info */}
              <div className="space-y-2 mb-6">
                <SkeletonLoader lines={2} />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-muted/50 rounded-lg animate-pulse"></div>
                <div className="h-10 w-10 bg-muted/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use common loading component with audio-specific styling and icons
  return (
    <div className="relative">
      <EnhancedLoadingState
        message={loadingMessage}
        variant="spinner"
        size="large"
        showProgress={showProgress}
        showCancel={showCancel}
        onCancel={onCancel}
        className="py-16"
      />

      {/* Audio-specific decorative elements */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4 mb-4">
        <div className="relative">
          <Music className="w-8 h-8 text-primary animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Sparkles
              className="w-4 h-4 text-secondary animate-bounce"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </div>
        <div className="relative">
          <BookOpen
            className="w-8 h-8 text-muted-foreground animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <div className="absolute -top-1 -right-1">
            <Heart
              className="w-4 h-4 text-red-500 animate-bounce"
              style={{ animationDelay: "0.7s" }}
            />
          </div>
        </div>
      </div>

      {/* Additional description for audio context */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center max-w-md">
        <p className="text-muted-foreground leading-relaxed">
          {getTranslation(
            messages,
            "audio.loading.message",
            "We're preparing your Islamic audio collection with beautiful recitations and spiritual content.",
          )}
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
};
