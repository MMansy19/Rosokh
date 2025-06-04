/**
 * YouTubeEmbed Component Usage Examples
 *
 * This file demonstrates various ways to use the YouTubeEmbed component
 * with different configurations and use cases.
 */

import React from "react";
import YouTubeEmbed from "./YouTubeEmbed";

// Example 1: Basic Usage
export const BasicExample = () => (
  <YouTubeEmbed
    videoId="dQw4w9WgXcQ"
    title="Never Gonna Give You Up - Rick Astley"
  />
);

// Example 2: Autoplay with Custom Styling
export const AutoplayExample = () => (
  <YouTubeEmbed
    videoId="dQw4w9WgXcQ"
    title="Autoplay Example"
    autoplay={true}
    muted={true} // Required for autoplay in most browsers
    className="max-w-4xl mx-auto shadow-2xl"
  />
);

// Example 3: Looping Video
export const LoopingExample = () => (
  <YouTubeEmbed
    videoId="dQw4w9WgXcQ"
    title="Looping Video Example"
    loop={true}
    autoplay={true}
    muted={true}
  />
);

// Example 4: Time-based Playback
export const TimedExample = () => (
  <YouTubeEmbed
    videoId="dQw4w9WgXcQ"
    title="Timed Playback Example"
    startTime={30} // Start at 30 seconds
    endTime={90} // End at 90 seconds
  />
);

// Example 5: Privacy Mode Disabled (for full features)
export const FullFeaturesExample = () => (
  <YouTubeEmbed
    videoId="dQw4w9WgXcQ"
    title="Full Features Example"
    privacyMode={false}
    showRelated={true}
    showControls={true}
  />
);

// Example 6: Custom Styled for Islamic Content
export const IslamicContentExample = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
    <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4 text-center">
      Quran Recitation
    </h3>
    <YouTubeEmbed
      videoId="your-islamic-video-id"
      title="Beautiful Quran Recitation"
      className="border-2 border-green-200 dark:border-green-700"
      muted={false} // Islamic content often benefits from audio
    />
    <p className="text-sm text-green-700 dark:text-green-300 mt-3 text-center">
      May Allah bless this recitation
    </p>
  </div>
);

// Example 7: Responsive Grid Layout
export const ResponsiveGridExample = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <YouTubeEmbed videoId="video1" title="First Video" className="h-full" />
    <YouTubeEmbed videoId="video2" title="Second Video" className="h-full" />
  </div>
);

// Example 8: Error Handling
export const ErrorHandlingExample = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Valid Video:</h3>
    <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Valid YouTube Video" />

    <h3 className="text-lg font-medium">Invalid Video ID:</h3>
    <YouTubeEmbed videoId="" title="This will show error state" />
  </div>
);

/**
 * Integration with your existing YouTube components
 */
export const IntegrationExample = () => {
  const handleVideoSelect = (videoId: string, title: string) => {
    // You can integrate this with your existing VideoPlayer modal
    console.log("Selected video:", videoId, title);
  };

  return (
    <div className="space-y-6">
      {/* Your existing video list */}
      <div className="grid gap-4">
        {/* Embed component for quick preview */}
        <YouTubeEmbed
          videoId="sample-video-id"
          title="Quick Preview"
          className="max-w-md"
        />

        {/* Button to open full player */}
        <button
          onClick={() => handleVideoSelect("sample-video-id", "Video Title")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open in Full Player
        </button>
      </div>
    </div>
  );
};
