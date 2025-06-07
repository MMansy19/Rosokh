"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Play,
  Clock,
  Eye,
  BookOpen,
  Music,
  GraduationCap,
  Calendar,
  PlaySquare,
  ArrowLeft,
  Heart,
  Headphones,
  Users,
  Star,
  MessageCircle,
} from "lucide-react";
import { VideoInfo } from "@/components/youtube/VideoPlayer";
import YouTubeEmbed from "@/components/youtube/YouTubeEmbed";
import {
  useVideoData,
  VideoMetadata,
  VIDEO_CATEGORIES,
} from "@/hooks/useVideoData";
import { usePlaylistData, PlaylistMetadata } from "@/hooks/usePlaylistData";

// Add error handling for YoutubeClient
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class YouTubeErrorBoundary extends React.Component<
  { children: React.ReactNode; messages: any },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; messages: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("YouTube component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {this.props.messages?.youtube?.error || "YouTube Service Error"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {this.props.messages?.youtube?.errorDesc ||
                "There was an issue loading the YouTube service. Please check your internet connection and API configuration."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {this.props.messages?.common?.retry || "Try Again"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface YoutubeClientProps {
  locale: string;
  messages: any;
}

// Helper functions
const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    quran_recitation: <BookOpen className="w-4 h-4 text-emerald-500" />,
    quran_tafsir: <BookOpen className="w-4 h-4 text-blue-500" />,
    islamic_lectures: <GraduationCap className="w-4 h-4 text-purple-500" />,
    nasheed: <Music className="w-4 h-4 text-pink-500" />,
    hajj_umrah: <Calendar className="w-4 h-4 text-orange-500" />,
    ramadan: <Star className="w-4 h-4 text-yellow-500" />,
    islamic_history: <BookOpen className="w-4 h-4 text-amber-600" />,
    prophet_stories: <Users className="w-4 h-4 text-indigo-500" />,
    islamic_knowledge: <GraduationCap className="w-4 h-4 text-cyan-500" />,
    islamic_education: <BookOpen className="w-4 h-4 text-teal-500" />,
    islamic_reminders: <Heart className="w-4 h-4 text-red-500" />,
    dua_supplications: <Headphones className="w-4 h-4 text-green-500" />,
    islamic_guidance: <MessageCircle className="w-4 h-4 text-slate-500" />,
    islamic_youth: <Users className="w-4 h-4 text-violet-500" />,
    islamic_family: <Heart className="w-4 h-4 text-rose-500" />,
  };

  return iconMap[categoryId] || <Play className="w-4 h-4" />;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function YoutubeClient({
  locale,
  messages,
}: YoutubeClientProps) {
  const { videos, loading, error, searchVideos, getVideosByCategory } =
    useVideoData();

  const {
    playlists,
    loading: playlistLoading,
    error: playlistError,
    getPlaylistById,
    searchPlaylists,
    getPlaylistsByCategory,
    formatPlaylistDuration,
    loadPlaylistVideos,
    areVideosLoaded,
    areVideosLoading,
  } = usePlaylistData();

  const [filteredVideos, setFilteredVideos] = useState<VideoMetadata[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<
    PlaylistMetadata[]
  >([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(
    null,
  );
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistMetadata | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<VideoMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"videos" | "playlists">(
    "playlists",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showVideoDetails, setShowVideoDetails] = useState(false);

  const loadFeaturedContent = useCallback(() => {
    setFilteredVideos(videos);
    setFilteredPlaylists(playlists);
  }, [videos, playlists]);

  // Load featured content when videos and playlists are loaded
  useEffect(() => {
    if (videos.length > 0 || playlists.length > 0) {
      loadFeaturedContent();
    }
  }, [videos, playlists, loadFeaturedContent]);

  const handleSearch = (query: string) => {
    if (activeTab === "playlists") {
      const results = searchPlaylists(query, selectedCategory);
      setFilteredPlaylists(results);
    } else {
      const results = searchVideos(query, selectedCategory);
      setFilteredVideos(results);
    }
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (activeTab === "playlists") {
      if (categoryId === "") {
        setFilteredPlaylists(playlists);
      } else {
        const categoryPlaylists = getPlaylistsByCategory(categoryId);
        setFilteredPlaylists(categoryPlaylists);
      }
    } else {
      if (categoryId === "") {
        setFilteredVideos(videos);
      } else {
        const categoryVideos = getVideosByCategory(categoryId);
        setFilteredVideos(categoryVideos);
      }
    }
  };

  const handleVideoSelect = (video: VideoMetadata) => {
    setSelectedVideo(video);
    setShowVideoDetails(true);

    // Save to watch history
    const watchHistory = JSON.parse(
      localStorage.getItem("youtube_watch_history") || "[]",
    );
    const historyEntry = {
      video,
      watchedAt: new Date().toISOString(),
    };

    // Remove if already exists and add to front
    const filtered = watchHistory.filter(
      (entry: any) => entry.video.id !== video.id,
    );
    const newHistory = [historyEntry, ...filtered].slice(0, 50); // Keep last 50 videos

    localStorage.setItem("youtube_watch_history", JSON.stringify(newHistory));
  };

  const handlePlaylistSelect = async (playlist: PlaylistMetadata) => {
    setSelectedPlaylist(playlist);
    setActiveTab("videos");

    try {
      // Load videos for the selected playlist if not already loaded
      const videos = await loadPlaylistVideos(playlist.id);
      setPlaylistVideos(videos);
      setFilteredVideos(videos);
    } catch (error) {
      console.error("Failed to load playlist videos:", error);
      // Show empty state or error message
      setPlaylistVideos([]);
      setFilteredVideos([]);
    }
  };

  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
    setPlaylistVideos([]);
    setActiveTab("playlists");
    setFilteredPlaylists(playlists);
  };

  const getVideoDisplayTitle = (video: VideoMetadata) => {
    // Use the youtubeId field if available (for playlist videos)
    if (video.youtubeId) {
      return video.youtubeId;
    }

    // Try to extract from thumbnail URL first
    const thumbnailMatch = video.thumbnailUrl.match(/\/vi\/([^\/]+)\//);
    if (thumbnailMatch) {
      return thumbnailMatch[1];
    }

    // If it's a standard YouTube video ID format
    if (video.id && !video.id.includes("&index=")) {
      return video.id;
    }

    // Fallback: return the ID as is
    return video.id;
  };

  return (
    <YouTubeErrorBoundary messages={messages}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Video Player Modal */}
        {selectedVideo && showVideoDetails && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl max-w-5xl w-full max-h-[90vh] mt-auto overflow-y-auto">
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      setShowVideoDetails(false);
                      setSelectedVideo(null);
                    }}
                    className="text-muted hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {/* Video Player */}
                <YouTubeEmbed
                  videoId={getVideoDisplayTitle(selectedVideo)}
                  title={selectedVideo.title}
                  autoplay={true}
                  muted={false}
                  className="mb-6"
                />

                {/* Video Info */}
                <div className="mt-6">
                  <VideoInfo
                    video={selectedVideo}
                    isExpanded={true}
                    locale={locale}
                    messages={messages}
                    playlist={
                      selectedPlaylist
                        ? {
                            id: selectedPlaylist.id,
                            title: selectedPlaylist.title,
                            category: selectedPlaylist.category,
                          }
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {messages?.youtube?.title || "Islamic Videos"}
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              {messages?.youtube?.subtitle ||
                "Discover inspiring Islamic content, Quran recitations, and educational videos"}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSearch(searchTerm)
                  }
                  placeholder={
                    messages?.youtube?.searchPlaceholder ||
                    "Search Islamic videos..."
                  }
                  className="w-full pl-12 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSearch(searchTerm)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                  disabled={loading}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Category Filters */}
              {showFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleCategoryFilter("")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === ""
                        ? "bg-primary text-white"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                    }`}
                  >
                    {messages?.youtube?.search?.allCategories ||
                      "All Categories"}
                  </button>

                  {VIDEO_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                      }`}
                    >
                      {getCategoryIcon(category.id)}
                      {locale === "ar" && category.nameArabic
                        ? category.nameArabic
                        : locale === "ru" && category.nameRussian
                          ? category.nameRussian
                          : category.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Tabs and View Controls */}
              <div className="flex  md:flex-row flex-col gap-2 w-full items-center justify-between">
                <div className="flex gap-2">
                  {["playlists", "videos"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab as typeof activeTab);
                        if (tab === "playlists") {
                          setFilteredPlaylists(playlists);
                          setSelectedPlaylist(null);
                        } else {
                          setFilteredVideos(videos);
                          setSelectedPlaylist(null);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                      }`}
                    >
                      {tab === "playlists" && (
                        <PlaySquare className="w-4 h-4" />
                      )}
                      {tab === "videos" && <Play className="w-4 h-4" />}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      showFilters
                        ? "bg-primary text-white"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-white"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? " ▲" : " ▼"}
                  </button>

                  <div className="flex bg-secondary rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-primary text-white" : "text-foreground"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-primary text-white" : "text-foreground"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto">
            {/* Back to Playlists Button */}
            {selectedPlaylist && activeTab === "videos" && (
              <div className="mb-6">
                <button
                  onClick={handleBackToPlaylists}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-foreground hover:text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Playlists
                </button>
                <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {locale === "ar" && selectedPlaylist.title
                      ? selectedPlaylist.title
                      : locale === "ru" && selectedPlaylist.titleRussian
                        ? selectedPlaylist.titleRussian
                        : selectedPlaylist.titleEnglish ||
                          selectedPlaylist.title}
                  </h2>
                  <p className="text-muted text-sm mb-2">
                    {selectedPlaylist.channelTitle} •{" "}
                    {selectedPlaylist.videoCount} videos •{" "}
                    {formatPlaylistDuration(selectedPlaylist.totalDuration)}
                  </p>
                  <p className="text-muted text-sm">
                    {locale === "ar" && selectedPlaylist.description
                      ? selectedPlaylist.description
                      : locale === "ru" && selectedPlaylist.descriptionRussian
                        ? selectedPlaylist.descriptionRussian
                        : selectedPlaylist.descriptionEnglish ||
                          selectedPlaylist.description}
                  </p>
                </div>
              </div>
            )}

            {loading || playlistLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted">Loading {activeTab}...</p>
              </div>
            ) : activeTab === "playlists" ? (
              <div
                className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}`}
              >
                {filteredPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`bg-surface rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                      viewMode === "list" ? "flex gap-4 p-4" : ""
                    }`}
                    onClick={() => handlePlaylistSelect(playlist)}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative bg-gray-200 ${viewMode === "list" ? "w-48 h-28 flex-shrink-0" : "aspect-video"}`}
                    >
                      <img
                        src={playlist.thumbnailUrl}
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <PlaySquare className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        {playlist.videoCount} videos
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        <PlaySquare className="w-3 h-3 inline mr-1" />
                        Playlist
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`${viewMode === "list" ? "flex-1" : "p-4"}`}
                    >
                      <h3
                        className={`font-semibold text-foreground mb-2 ${viewMode === "list" ? "text-lg" : "text-base"} line-clamp-2`}
                      >
                        {locale === "ar" && playlist.title
                          ? playlist.title
                          : locale === "ru" && playlist.titleRussian
                            ? playlist.titleRussian
                            : playlist.titleEnglish || playlist.title}
                      </h3>

                      <div className="text-sm text-muted mb-2">
                        {playlist.channelTitle}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(playlist.viewCount)}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatPlaylistDuration(playlist.totalDuration)}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {locale === "ar" && playlist.category.nameArabic
                            ? playlist.category.nameArabic
                            : locale === "ru" && playlist.category.nameRussian
                              ? playlist.category.nameRussian
                              : playlist.category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "videos" ? (
              <div
                className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}`}
              >
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`bg-surface rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                      viewMode === "list" ? "flex gap-4 p-4" : ""
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative bg-gray-200 ${viewMode === "list" ? "w-48 h-28 flex-shrink-0" : "aspect-video"}`}
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        {formatDuration(video.duration)}
                      </div>
                      {selectedPlaylist && "playlistIndex" in video && (
                        <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                          {(video as any).playlistIndex}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`${viewMode === "list" ? "flex-1" : "p-4"}`}
                    >
                      <h3
                        className={`font-semibold text-foreground mb-2 ${viewMode === "list" ? "text-lg" : "text-base"} line-clamp-2`}
                      >
                        {video.title}
                      </h3>

                      <div className="text-sm text-muted mb-2">
                        {video.channelTitle}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(video.viewCount)}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(video.publishedAt).toLocaleDateString(
                            locale,
                          )}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {selectedPlaylist
                            ? // If viewing playlist videos, show playlist category
                              locale === "ar" &&
                              selectedPlaylist.category.nameArabic
                              ? selectedPlaylist.category.nameArabic
                              : locale === "ru" &&
                                  selectedPlaylist.category.nameRussian
                                ? selectedPlaylist.category.nameRussian
                                : selectedPlaylist.category.name
                            : // If viewing individual videos, show video category
                              locale === "ar" && video.category.nameArabic
                              ? video.category.nameArabic
                              : locale === "ru" && video.category.nameRussian
                                ? video.category.nameRussian
                                : video.category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Empty State */}
            {!loading && !playlistLoading && (
              <>
                {/* Videos Empty State */}
                {filteredVideos.length === 0 && activeTab === "videos" && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📺</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {messages?.youtube?.noVideos || "No videos found"}
                    </h3>
                    <p className="text-muted">
                      {messages?.youtube?.noVideosDesc ||
                        "Try adjusting your search terms or filters"}
                    </p>
                  </div>
                )}

                {/* Playlists Empty State */}
                {filteredPlaylists.length === 0 &&
                  activeTab === "playlists" && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📺</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No playlists found
                      </h3>
                      <p className="text-muted">
                        Try adjusting your search terms or filters
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </YouTubeErrorBoundary>
  );
}
