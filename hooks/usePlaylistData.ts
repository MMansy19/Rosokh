import { useState, useEffect } from 'react';
import { VideoMetadata, VideoCategory } from '@/hooks/useVideoData';

export interface PlaylistMetadata {
  id: string;
  title: string;
  titleEnglish?: string;
  titleRussian?: string;
  description: string;
  descriptionEnglish?: string;
  descriptionRussian?: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoCount: number;
  totalDuration: number;
  viewCount: number;
  category: VideoCategory;
  tags: string[];
  language: string;
  videos: VideoMetadata[];
}

export interface PlaylistVideo extends VideoMetadata {
  playlistIndex: number;
}

export const usePlaylistData = () => {
  const [playlists, setPlaylists] = useState<PlaylistMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch playlist files from the new folder structure
        const [hudaResponse, quranTafsirResponse] = await Promise.all([
          fetch('/data/youtube-playlists/huda-lilnas.json'),
          fetch('/data/youtube-playlists/quran-tafsir.json')
        ]);

        if (!hudaResponse.ok || !quranTafsirResponse.ok) {
          throw new Error(`HTTP error! Huda: ${hudaResponse.status}, Quran Tafsir: ${quranTafsirResponse.status}`);
        }

        const [hudaData, quranTafsirData] = await Promise.all([
          hudaResponse.json(),
          quranTafsirResponse.json()
        ]);        // Combine playlists from both files
        const allPlaylists = [
          ...(hudaData.playlists || []),
          ...(quranTafsirData.playlists || [])
        ];

        setPlaylists(allPlaylists);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError(err instanceof Error ? err.message : 'Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const getPlaylistById = (playlistId: string): PlaylistMetadata | null => {
    return playlists.find(playlist => playlist.id === playlistId) || null;
  };

  const searchPlaylists = (query: string, categoryId?: string): PlaylistMetadata[] => {
    let filteredPlaylists = playlists;

    // Filter by category if specified
    if (categoryId) {
      filteredPlaylists = filteredPlaylists.filter(
        playlist => playlist.category.id === categoryId
      );
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filteredPlaylists = filteredPlaylists.filter(playlist =>
        playlist.title.toLowerCase().includes(lowerQuery) ||
        playlist.titleEnglish?.toLowerCase().includes(lowerQuery) ||
        playlist.titleRussian?.toLowerCase().includes(lowerQuery) ||
        playlist.description.toLowerCase().includes(lowerQuery) ||
        playlist.descriptionEnglish?.toLowerCase().includes(lowerQuery) ||
        playlist.descriptionRussian?.toLowerCase().includes(lowerQuery) ||
        playlist.channelTitle.toLowerCase().includes(lowerQuery) ||
        playlist.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filteredPlaylists;
  };

  const getPlaylistsByCategory = (categoryId: string): PlaylistMetadata[] => {
    return playlists.filter(playlist => playlist.category.id === categoryId);
  };

  const getTotalVideosInPlaylists = (): number => {
    return playlists.reduce((total, playlist) => total + playlist.videoCount, 0);
  };

  const getTotalPlaylistDuration = (): number => {
    return playlists.reduce((total, playlist) => total + playlist.totalDuration, 0);
  };

  const formatPlaylistDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    playlists,
    loading,
    error,
    getPlaylistById,
    searchPlaylists,
    getPlaylistsByCategory,
    getTotalVideosInPlaylists,
    getTotalPlaylistDuration,
    formatPlaylistDuration,
  };
};
