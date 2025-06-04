import { useMemo } from 'react';
import { AudioTrack } from '@/types/audio';

interface StatsCalculations {
  totalTracks: number;
  totalReciters: number;
  totalDuration: number;
  formattedDuration: string;
  categories: {
    quran: number;
    dua: number;
    lecture: number;
    nasheed: number;
  };
  qualities: {
    high: number;
    medium: number;
    low: number;
  };
}

export const useStatsCalculations = (tracks: AudioTrack[]): StatsCalculations => {
  return useMemo(() => {
    if (!tracks.length) {
      return {
        totalTracks: 0,
        totalReciters: 0,
        totalDuration: 0,
        formattedDuration: '0m',
        categories: { quran: 0, dua: 0, lecture: 0, nasheed: 0 },
        qualities: { high: 0, medium: 0, low: 0 }
      };
    }

    const totalTracks = tracks.length;
    const totalReciters = new Set(tracks.map(track => track.reciter.id)).size;
    
    const totalDuration = tracks.reduce((acc, track) => {
      const duration = track.duration.split(':');
      const minutes = parseInt(duration[0]) * 60 + parseInt(duration[1]);
      return acc + minutes;
    }, 0);

    const formatDuration = (totalMinutes: number) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    const categories = {
      quran: tracks.filter(t => t.category === 'quran').length,
      dua: tracks.filter(t => t.category === 'dua').length,
      lecture: tracks.filter(t => t.category === 'lecture').length,
      nasheed: tracks.filter(t => t.category === 'nasheed').length,
    };

    const qualities = {
      high: tracks.filter(t => t.quality === 'high').length,
      medium: tracks.filter(t => t.quality === 'medium').length,
      low: tracks.filter(t => t.quality === 'low').length,
    };

    return {
      totalTracks,
      totalReciters,
      totalDuration,
      formattedDuration: formatDuration(totalDuration),
      categories,
      qualities
    };
  }, [tracks]);
};
