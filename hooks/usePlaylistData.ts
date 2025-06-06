import { useState, useEffect } from 'react';
import { VideoMetadata, VideoCategory } from '@/hooks/useVideoData';

// Playlist metadata (without videos - for performance)
export interface PlaylistMetadata {
  id: string;
  title: string;
  titleEnglish?: string;
  titleRussian?: string;
  description: string;
  descriptionEnglish?: string;
  descriptionRussian?: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoCount: number;
  totalDuration: number;
  viewCount: number;
  category: VideoCategory;
  dataFile: string; // Reference to the full data file
  channelTitle?: string; // Channel title (optional for backward compatibility)
}

// Full playlist data (with videos - loaded on demand)
export interface PlaylistWithVideos extends Omit<PlaylistMetadata, 'dataFile'> {
  videos: VideoMetadata[];
}

export interface PlaylistVideo extends VideoMetadata {
  playlistIndex: number;
}

interface PlaylistMetadataFile {
  playlists: PlaylistMetadata[];
}

interface PlaylistDataFile {
  playlists: PlaylistWithVideos[];
}

export const usePlaylistData = () => {
  const [playlists, setPlaylists] = useState<PlaylistMetadata[]>([]);
  const [loadedPlaylistVideos, setLoadedPlaylistVideos] = useState<Map<string, VideoMetadata[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());

  // Stage 1: Load only playlist metadata for fast initial load
  useEffect(() => {
    const fetchPlaylistMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/data/youtube-playlists/playlists-metadata.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch playlist metadata: ${response.status}`);
        }
        
        const data: PlaylistMetadataFile = await response.json();
        setPlaylists(data.playlists || []);
      } catch (err) {
        console.error('Error fetching playlist metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistMetadata();
  }, []);

  // Stage 2: Load videos for a specific playlist on demand
  const loadPlaylistVideos = async (playlistId: string): Promise<VideoMetadata[]> => {
    // Check if already loaded
    if (loadedPlaylistVideos.has(playlistId)) {
      return loadedPlaylistVideos.get(playlistId)!;
    }

    // Check if currently loading
    if (loadingVideos.has(playlistId)) {
      // Wait for current loading to complete
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (loadedPlaylistVideos.has(playlistId)) {
            resolve(loadedPlaylistVideos.get(playlistId)!);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    try {
      // Mark as loading
      setLoadingVideos(prev => new Set(prev).add(playlistId));

      // Find the playlist metadata to get the data file name
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) {
        throw new Error(`Playlist with ID ${playlistId} not found`);
      }

      // Fetch the full playlist data file
      const response = await fetch(`/data/youtube-playlists/${playlist.dataFile}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist data: ${response.status}`);
      }

      const data: PlaylistDataFile = await response.json();
      const playlistData = data.playlists.find(p => p.id === playlistId);
      
      if (!playlistData) {
        throw new Error(`Playlist data for ID ${playlistId} not found in ${playlist.dataFile}`);
      }

      // Cache the videos
      setLoadedPlaylistVideos(prev => new Map(prev).set(playlistId, playlistData.videos));
      
      return playlistData.videos;
    } catch (err) {
      console.error(`Error loading videos for playlist ${playlistId}:`, err);
      throw err;
    } finally {
      // Remove from loading set
      setLoadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(playlistId);
        return newSet;
      });
    }
  };

  const getPlaylistById = (playlistId: string): PlaylistMetadata | null => {
    return playlists.find(playlist => playlist.id === playlistId) || null;
  };

  // Get playlist with videos (loads videos if not already loaded)
  const getPlaylistWithVideos = async (playlistId: string): Promise<PlaylistWithVideos | null> => {
    const metadata = getPlaylistById(playlistId);
    if (!metadata) return null;

    try {
      const videos = await loadPlaylistVideos(playlistId);
      const { dataFile, ...metadataWithoutFile } = metadata;
      return {
        ...metadataWithoutFile,
        videos
      };
    } catch (err) {
      console.error(`Failed to load videos for playlist ${playlistId}:`, err);
      return null;
    }
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
        playlist.descriptionRussian?.toLowerCase().includes(lowerQuery)
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

  // Check if videos are loaded for a playlist
  const areVideosLoaded = (playlistId: string): boolean => {
    return loadedPlaylistVideos.has(playlistId);
  };

  // Check if videos are currently loading for a playlist
  const areVideosLoading = (playlistId: string): boolean => {
    return loadingVideos.has(playlistId);
  };

  return {
    // Metadata-only data (always available after initial load)
    playlists,
    loading,
    error,
    
    // Video loading functions
    loadPlaylistVideos,
    getPlaylistWithVideos,
    areVideosLoaded,
    areVideosLoading,
    
    // Utility functions
    getPlaylistById,
    searchPlaylists,
    getPlaylistsByCategory,
    getTotalVideosInPlaylists,
    getTotalPlaylistDuration,
    formatPlaylistDuration,
  };
};
