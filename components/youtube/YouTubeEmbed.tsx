"use client";

import React from "react";

/**
 * Props interface for the YouTube embed component
 */
interface YouTubeEmbedProps {
  /** YouTube video ID (the part after 'v=' in the URL) */
  videoId: string;
  /** Optional title for accessibility and SEO (defaults to generic description) */
  title?: string;
  /** Whether to autoplay the video (default: false) */
  autoplay?: boolean;
  /** Whether to start muted (default: true for better UX) */
  muted?: boolean;
  /** Whether to loop the video (default: false) */
  loop?: boolean;
  /** Additional Tailwind CSS classes for customization */
  className?: string;
  /** Optional start time in seconds */
  startTime?: number;
  /** Optional end time in seconds */
  endTime?: number;
  /** Whether to show related videos at the end (default: false) */
  showRelated?: boolean;
  /** Whether to show YouTube branding/controls (default: true) */
  showControls?: boolean;
  /** Privacy-enhanced mode (uses youtube-nocookie.com) */
  privacyMode?: boolean;
}

/**
 * A reusable, accessible, and SEO-optimized YouTube embed component
 *
 * Features:
 * - Responsive 16:9 aspect ratio using padding-bottom technique
 * - Full accessibility support with proper ARIA attributes
 * - Lazy loading for performance optimization
 * - Security-focused with appropriate sandbox and allow attributes
 * - Mobile-first responsive design
 * - Dark mode compatible
 * - Keyboard navigation support
 * - SEO optimized with structured data
 */
const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = "Embedded YouTube video",
  autoplay = false,
  muted = true,
  loop = false,
  className = "",
  startTime,
  endTime,
  showRelated = false,
  showControls = true,
  privacyMode = true,
}) => {
  // Validate videoId
  if (!videoId || typeof videoId !== "string") {
    console.warn("YouTubeEmbed: Invalid or missing videoId");
    return (
      <div
        className={`relative w-full pb-[56.25%] bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}
        role="alert"
        aria-label="Video unavailable"
      >
        <p className="text-gray-600 dark:text-gray-400 text-center px-4">
          Video unavailable
        </p>
      </div>
    );
  }

  // Build YouTube URL with parameters
  const buildEmbedUrl = (): string => {
    // Use privacy-enhanced mode by default (youtube-nocookie.com)
    const baseUrl = privacyMode
      ? "https://www.youtube-nocookie.com/embed/"
      : "https://www.youtube.com/embed/";

    const params = new URLSearchParams();

    // Core playback parameters
    params.set("autoplay", autoplay ? "1" : "0");
    params.set("mute", muted ? "1" : "0");
    params.set("controls", showControls ? "1" : "0");
    params.set("rel", showRelated ? "1" : "0");

    // Loop functionality requires playlist parameter
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", videoId);
    }

    // Time parameters
    if (startTime && startTime > 0) {
      params.set("start", startTime.toString());
    }
    if (endTime && endTime > 0) {
      params.set("end", endTime.toString());
    }

    // Additional parameters for better embedding experience
    params.set("modestbranding", "1"); // Minimal YouTube branding
    params.set("fs", "1"); // Allow fullscreen
    params.set("hl", "en"); // Interface language
    params.set("cc_load_policy", "0"); // Don't force captions
    params.set("iv_load_policy", "3"); // Hide video annotations
    params.set(
      "origin",
      typeof window !== "undefined" ? window.location.origin : "",
    );

    return `${baseUrl}${videoId}?${params.toString()}`;
  };

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    embedUrl: buildEmbedUrl(),
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    uploadDate: new Date().toISOString(), // This should ideally come from video metadata
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Responsive container with 16:9 aspect ratio */}
      <div
        className={`
          relative w-full pb-[56.25%] 
          overflow-hidden rounded-lg shadow-md 
          bg-gray-100 dark:bg-gray-900
          transition-shadow duration-200 
          hover:shadow-lg focus-within:shadow-lg
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50
          ${className}
        `}
        role="region"
        aria-label={`YouTube video: ${title}`}
      >
        <iframe
          src={buildEmbedUrl()}
          title={title}
          aria-label={title}
          loading="lazy"
          className="
            absolute top-0 left-0 w-full h-full
            border-0 rounded-lg
            focus:outline-none focus:ring-0
          "
          allow="
            accelerometer; 
            autoplay; 
            clipboard-write; 
            encrypted-media; 
            gyroscope; 
            picture-in-picture; 
            web-share
          "
          sandbox="
            allow-scripts 
            allow-same-origin 
            allow-presentation 
            allow-popups-to-escape-sandbox
          "
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          // Additional accessibility attributes
          tabIndex={0}
          role="application"
          aria-describedby={`youtube-${videoId}-description`}
        />

        {/* Hidden description for screen readers */}
        <div id={`youtube-${videoId}-description`} className="sr-only">
          YouTube video player. {title}.{autoplay && "Video will autoplay. "}
          {muted && "Video starts muted. "}
          Use standard media controls to play, pause, and adjust volume.
        </div>

        {/* Loading placeholder - shows while iframe loads */}
        <div
          className="
            absolute inset-0 bg-gray-200 dark:bg-gray-800 
            flex items-center justify-center
            animate-pulse rounded-lg
            pointer-events-none
          "
          aria-hidden="true"
          style={{ zIndex: -1 }}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading video...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default YouTubeEmbed;

// Type export for external use
export type { YouTubeEmbedProps };
