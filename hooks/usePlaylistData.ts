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

interface PlaylistManifest {
  files: string[];
}

interface PlaylistDataFile {
  playlists: PlaylistMetadata[];
}

interface PlaylistManifest {
  files: string[];
}

interface PlaylistDataFile {
  playlists: PlaylistMetadata[];
}

export const usePlaylistData = () => {
  const [playlists, setPlaylists] = useState<PlaylistMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);        // First, fetch the manifest to get all available playlist files
        const manifestResponse = await fetch('/data/youtube-playlists/manifest.json');
        if (!manifestResponse.ok) {
          throw new Error(`Failed to fetch manifest: ${manifestResponse.status}`);
        }
        
        const manifest: PlaylistManifest = await manifestResponse.json();
        const playlistFiles = manifest.files || [];

        if (playlistFiles.length === 0) {
          console.warn('No playlist files found in manifest');
          setPlaylists([]);
          return;
        }

        // Fetch all playlist files dynamically
        const playlistResponses = await Promise.all(
          playlistFiles.map((filename: string) => 
            fetch(`/data/youtube-playlists/${filename}`)
          )
        );

        // Check if all responses are successful
        const failedRequests = playlistResponses
          .map((response, index) => ({ response, filename: playlistFiles[index] }))
          .filter(({ response }) => !response.ok);

        if (failedRequests.length > 0) {
          const errorMessages = failedRequests.map(({ response, filename }) => 
            `${filename}: ${response.status}`
          );
          throw new Error(`Failed to fetch playlist files: ${errorMessages.join(', ')}`);
        }

        // Parse all JSON responses
        const playlistDataArray: PlaylistDataFile[] = await Promise.all(
          playlistResponses.map(response => response.json())
        );

        // Combine playlists from all files
        const allPlaylists = playlistDataArray.reduce((acc, data) => {
          return [...acc, ...(data.playlists || [])];
        }, [] as PlaylistMetadata[]);

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
