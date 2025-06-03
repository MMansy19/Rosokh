"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Play, 
  Clock, 
  Eye,
  TrendingUp,
  BookOpen,
  Music,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { VideoService, VideoMetadata, VideoPlaylist, VIDEO_CATEGORIES, SearchFilters } from '../../../components/youtube/VideoService';
import { VideoPlayer, VideoInfo } from '../../../components/youtube/VideoPlayer';

interface YoutubeClientProps {
  locale: string;
  messages: any;
}

export default function YoutubeClient({ locale, messages }: YoutubeClientProps) {
  const [videoService] = useState(() => new VideoService(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''));
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [playlists, setPlaylists] = useState<VideoPlaylist[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'playlists' | 'trending'>('videos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showVideoDetails, setShowVideoDetails] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  // Load featured content on mount
  useEffect(() => {
    loadFeaturedContent();
  }, [locale]);

  const loadFeaturedContent = async () => {
    setIsLoading(true);
    try {
      const [featuredVideos, featuredPlaylists] = await Promise.all([
        videoService.searchVideos('islamic quran recitation', {}, 12),
        videoService.getFeaturedPlaylists(locale)
      ]);
      
      setVideos(featuredVideos);
      setPlaylists(featuredPlaylists);
    } catch (error) {
      console.error('Failed to load featured content:', error);
      // Show fallback content
      setVideos([]);
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadFeaturedContent();
      return;
    }

    setIsLoading(true);
    try {
      const results = await videoService.searchVideos(query, filters, 20);
      setVideos(results);
    } catch (error) {
      console.error('Search failed:', error);
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    
    try {
      if (categoryId === '') {
        loadFeaturedContent();
      } else {
        const categoryVideos = await videoService.getVideosByCategory(categoryId, 20);
        setVideos(categoryVideos);
      }
    } catch (error) {
      console.error('Category filter failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingVideos = async () => {
    setIsLoading(true);
    try {
      const trending = await videoService.getTrendingVideos();
      setVideos(trending);
    } catch (error) {
      console.error('Failed to load trending videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = (video: VideoMetadata) => {
    setSelectedVideo(video);
    setShowVideoDetails(true);
    
    // Save to watch history
    const watchHistory = JSON.parse(localStorage.getItem('youtube_watch_history') || '[]');
    const historyEntry = {
      video,
      watchedAt: new Date().toISOString()
    };
    
    // Remove if already exists and add to front
    const filtered = watchHistory.filter((entry: any) => entry.video.id !== video.id);
    const newHistory = [historyEntry, ...filtered].slice(0, 50); // Keep last 50 videos
    
    localStorage.setItem('youtube_watch_history', JSON.stringify(newHistory));
  };

  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'quran_recitation': <BookOpen className="w-5 h-5" />,
      'islamic_lectures': <GraduationCap className="w-5 h-5" />,
      'nasheed': <Music className="w-5 h-5" />,
      'hajj_umrah': <Calendar className="w-5 h-5" />,
      'ramadan': <Calendar className="w-5 h-5" />,
      'islamic_history': <BookOpen className="w-5 h-5" />,
      'prophet_stories': <BookOpen className="w-5 h-5" />,
      'islamic_knowledge': <GraduationCap className="w-5 h-5" />
    };
    
    return iconMap[categoryId] || <Play className="w-5 h-5" />;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player Modal */}
      {selectedVideo && showVideoDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
              <VideoPlayer
                video={selectedVideo}
                autoplay={true}
                showControls={true}
                showInfo={false}
                locale={locale}
                messages={messages}
              />

              {/* Video Info */}
              <div className="mt-6">
                <VideoInfo
                  video={selectedVideo}
                  isExpanded={true}
                  locale={locale}
                  messages={messages}
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
            {messages?.youtube?.subtitle || "Discover inspiring Islamic content, Quran recitations, and educational videos"}
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                placeholder={messages?.youtube?.searchPlaceholder || "Search Islamic videos..."}
                className="w-full pl-12 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSearch(searchTerm)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                disabled={isLoading}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-foreground hover:bg-accent hover:text-white'
                }`}
              >
                All Categories
              </button>
              
              {VIDEO_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground hover:bg-accent hover:text-white'
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  {locale === 'ar' && category.nameArabic ? category.nameArabic :
                   locale === 'ru' && category.nameRussian ? category.nameRussian :
                   category.name}
                </button>
              ))}
            </div>

            {/* Tabs and View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['videos', 'playlists', 'trending'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab as typeof activeTab);
                      if (tab === 'trending') loadTrendingVideos();
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-foreground hover:bg-accent hover:text-white'
                    }`}
                  >
                    {tab === 'trending' && <TrendingUp className="w-4 h-4 inline mr-1" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-accent hover:text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <div className="flex bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-foreground'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-foreground'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-semibold mb-3">Advanced Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration</label>
                    <select
                      value={filters.duration || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-border rounded bg-background"
                    >
                      <option value="">Any Duration</option>
                      <option value="short">Short (&lt; 4 min)</option>
                      <option value="medium">Medium (4-20 min)</option>
                      <option value="long">Long (&gt; 20 min)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Date</label>
                    <select
                      value={filters.uploadDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, uploadDate: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-border rounded bg-background"
                    >
                      <option value="">Any Time</option>
                      <option value="hour">Last Hour</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={filters.language || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded bg-background"
                    >
                      <option value="">Any Language</option>
                      <option value="ar">Arabic</option>
                      <option value="en">English</option>
                      <option value="ru">Russian</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Loading videos...</p>
            </div>
          ) : activeTab === 'videos' ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`bg-surface rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : ''
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  {/* Thumbnail */}
                  <div className={`relative bg-gray-200 ${viewMode === 'list' ? 'w-48 h-28 flex-shrink-0' : 'aspect-video'}`}>
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
                  </div>

                  {/* Content */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                    <h3 className={`font-semibold text-foreground mb-2 ${viewMode === 'list' ? 'text-lg' : 'text-base'} line-clamp-2`}>
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
                        {video.publishedAt.toLocaleDateString(locale)}
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {locale === 'ar' && video.category.nameArabic ? video.category.nameArabic :
                         locale === 'ru' && video.category.nameRussian ? video.category.nameRussian :
                         video.category.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'playlists' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-surface rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="relative aspect-video bg-gray-200">
                    <img
                      src={playlist.thumbnailUrl}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-sm">{playlist.videoCount} videos</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {playlist.title}
                    </h3>
                    
                    <div className="text-sm text-muted mb-2">
                      {playlist.creator}
                    </div>
                    
                    <p className="text-xs text-muted line-clamp-2">
                      {playlist.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-block px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                        {playlist.category.name}
                      </span>
                      {playlist.isOfficial && (
                        <span className="text-xs text-primary">✓ Official</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Trending Islamic Videos
              </h3>
              <p className="text-muted">
                Popular Islamic content trending now
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && videos.length === 0 && activeTab === 'videos' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {messages?.youtube?.noVideos || "No videos found"}
              </h3>
              <p className="text-muted">
                {messages?.youtube?.noVideosDesc || "Try adjusting your search terms or filters"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
