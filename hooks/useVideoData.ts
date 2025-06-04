import { useState, useEffect } from 'react';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  thumbnailUrl: string;
  category: {
    id: string;
    name: string;
    nameArabic?: string;
    nameRussian?: string;
    icon: string;
  };
  tags: string[];
  language: string;
  quality: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  nameArabic?: string;
  nameRussian?: string;
  icon: string;
  color: string;
}

export interface VideoData {
  videos: VideoMetadata[];
  categories: VideoCategory[];
  metadata: {
    totalVideos: number;
    lastUpdated: string;
    version: string;
  };
}

export function useVideoData() {
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/video-data?type=videos');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video data: ${response.statusText}`);
        }
        
        const videoData = await response.json();
        setData(videoData);
        setError(null);
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load video data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const searchVideos = (query: string, categoryId?: string) => {
    if (!data) return [];
    
    let filteredVideos = data.videos;
    
    // Filter by category
    if (categoryId) {
      filteredVideos = filteredVideos.filter(video => video.category.id === categoryId);
    }
    
    // Filter by search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filteredVideos = filteredVideos.filter(video =>
        video.title.toLowerCase().includes(searchLower) ||
        video.description.toLowerCase().includes(searchLower) ||
        video.channelTitle.toLowerCase().includes(searchLower) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filteredVideos;
  };

  const getVideosByCategory = (categoryId: string) => {
    if (!data) return [];
    return data.videos.filter(video => video.category.id === categoryId);
  };

  const getVideoById = (id: string) => {
    if (!data) return null;
    return data.videos.find(video => video.id === id) || null;
  };

  return {
    data,
    loading,
    error,
    searchVideos,
    getVideosByCategory,
    getVideoById,
    videos: data?.videos || [],
    categories: data?.categories || [],
  };
}
