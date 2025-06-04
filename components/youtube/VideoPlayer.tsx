"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2,
  Heart,
  Bookmark,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { VideoMetadata, formatDuration, formatViewCount } from "./VideoService";

interface VideoPlayerProps {
  video: VideoMetadata;
  autoplay?: boolean;
  showControls?: boolean;
  showInfo?: boolean;
  onVideoEnd?: () => void;
  onVideoProgress?: (progress: number) => void;
  locale: string;
  messages: any;
}

interface PlaybackSettings {
  quality: string;
  speed: number;
  autoplay: boolean;
  subtitles: boolean;
}

export function VideoPlayer({
  video,
  autoplay = false,
  showControls = true,
  showInfo = true,
  onVideoEnd,
  onVideoProgress,
  locale,
  messages,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>({
    quality: "720p",
    speed: 1,
    autoplay: false,
    subtitles: false,
  });

  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Initialize player
  useEffect(() => {
    // Load video metadata from localStorage if available
    const savedData = localStorage.getItem(`video_${video.id}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setIsLiked(data.isLiked || false);
      setIsBookmarked(data.isBookmarked || false);
    }

    // Set up progress tracking
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          onVideoProgress?.(newTime);

          // Auto-pause at end
          if (newTime >= duration) {
            setIsPlaying(false);
            onVideoEnd?.();
            return duration;
          }

          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, video.id, onVideoProgress, onVideoEnd]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!playerRef.current?.contains(document.activeElement)) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          event.preventDefault();
          skipBackward();
          break;
        case "ArrowRight":
          event.preventDefault();
          skipForward();
          break;
        case "ArrowUp":
          event.preventDefault();
          adjustVolume(0.1);
          break;
        case "ArrowDown":
          event.preventDefault();
          adjustVolume(-0.1);
          break;
        case "KeyM":
          event.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          event.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressWidth = rect.width;
    const clickProgress = (clickX / progressWidth) * duration;

    setCurrentTime(Math.max(0, Math.min(duration, clickProgress)));
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    saveVideoData();
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    saveVideoData();
  };

  const saveVideoData = () => {
    const data = {
      isLiked,
      isBookmarked,
      lastWatched: new Date().toISOString(),
      watchTime: currentTime,
    };
    localStorage.setItem(`video_${video.id}`, JSON.stringify(data));
  };

  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: video.description,
      url: `https://youtube.com/watch?v=${video.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareData.url);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={playerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      tabIndex={0}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <iframe
          ref={videoRef}
          src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}`}
          className="w-full h-full"
          allowFullScreen
          title={video.title}
        />

        {/* Custom Video Overlay (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Play className="w-8 h-8 text-black ml-1" />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isPlaying && currentTime === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Custom Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-1 bg-white/30 rounded cursor-pointer mb-3"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-red-600 rounded transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={skipBackward}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={skipForward}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    setIsMuted(newVolume === 0);
                  }}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="text-white text-sm ml-3">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Menu */}
      {showSettings && (
        <div className="absolute bottom-16 right-4 bg-black/90 text-white rounded-lg p-4 min-w-48">
          <h4 className="font-semibold mb-3">Settings</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Quality</label>
              <select
                value={playbackSettings.quality}
                onChange={(e) =>
                  setPlaybackSettings((prev) => ({
                    ...prev,
                    quality: e.target.value,
                  }))
                }
                className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="1080p">1080p HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Speed</label>
              <select
                value={playbackSettings.speed}
                onChange={(e) =>
                  setPlaybackSettings((prev) => ({
                    ...prev,
                    speed: parseFloat(e.target.value),
                  }))
                }
                className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">Normal</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Autoplay</span>
              <input
                type="checkbox"
                checked={playbackSettings.autoplay}
                onChange={(e) =>
                  setPlaybackSettings((prev) => ({
                    ...prev,
                    autoplay: e.target.checked,
                  }))
                }
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Subtitles</span>
              <input
                type="checkbox"
                checked={playbackSettings.subtitles}
                onChange={(e) =>
                  setPlaybackSettings((prev) => ({
                    ...prev,
                    subtitles: e.target.checked,
                  }))
                }
                className="rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Info Component
interface VideoInfoProps {
  video: VideoMetadata;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  locale: string;
  messages: any;
}

export function VideoInfo({
  video,
  isExpanded = false,
  onToggleExpand,
  locale,
  messages,
}: VideoInfoProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(`video_${video.id}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setIsLiked(data.isLiked || false);
      setIsBookmarked(data.isBookmarked || false);
    }
  }, [video.id]);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    const data = JSON.parse(localStorage.getItem(`video_${video.id}`) || "{}");
    data.isLiked = !isLiked;
    localStorage.setItem(`video_${video.id}`, JSON.stringify(data));
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    const data = JSON.parse(localStorage.getItem(`video_${video.id}`) || "{}");
    data.isBookmarked = !isBookmarked;
    localStorage.setItem(`video_${video.id}`, JSON.stringify(data));
  };

  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: video.description,
      url: `https://youtube.com/watch?v=${video.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  };

  return (
    <div className="bg-surface rounded-lg p-6 border border-border">
      {/* Video Title */}
      <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
        {video.title}
      </h2>

      {/* Video Meta */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-muted">
          <span>{formatViewCount(video.viewCount)} views</span>
          <span>•</span>
          <span>{video.publishedAt.toLocaleDateString(locale)}</span>
          <span>•</span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
            {video.category.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              isLiked
                ? "bg-red-100 text-red-600"
                : "bg-secondary text-foreground hover:bg-accent hover:text-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </button>

          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              isBookmarked
                ? "bg-blue-100 text-blue-600"
                : "bg-secondary text-foreground hover:bg-accent hover:text-white"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
            />
            {isBookmarked ? "Saved" : "Save"}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1 bg-secondary text-foreground rounded-full text-sm hover:bg-accent hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button className="p-2 text-muted hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Channel Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {video.channelTitle.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground">
              {video.channelTitle}
            </div>
            <div className="text-sm text-muted">Islamic Content Creator</div>
          </div>
        </div>

        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
          Subscribe
        </button>
      </div>

      {/* Description */}
      <div className="text-muted">
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 mb-2 text-foreground hover:text-primary transition-colors"
        >
          <span className="font-medium">Description</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded ? (
          <div className="space-y-2">
            <p className="leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>

            {video.tags.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="text-sm font-medium mb-2">Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent/10 text-accent rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="line-clamp-2 leading-relaxed">{video.description}</p>
        )}
      </div>
    </div>
  );
}
