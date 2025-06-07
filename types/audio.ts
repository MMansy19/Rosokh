// Audio-related type definitions
export interface AudioTrack {
  id: string;
  title: string;
  arabicTitle?: string;
  reciter: {
    id: string;
    name: string;
    arabicName?: string;
  };
  duration: string;
  url: string;
  category: "quran" | "dua" | "lecture" | "nasheed";
  surah?: number;
  quality: "high" | "medium" | "low";
  size: string;
  isOfflineAvailable?: boolean;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  biography: string;
  country?: string;
  totalRecitations: number;
  featured?: boolean;
}

export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  transliteration: string;
  meaning: string;
  verses: number;
  revelationType: string;
  driveFiles: { [reciter: string]: string };
}

export interface AudioData {
  surahs: Surah[];
}

export interface ReciterData {
  reciters: Reciter[];
}

export interface AudioClientProps {
  locale: string;
  messages: any;
}

export type AudioCategory = "all" | "quran" | "dua" | "lecture" | "nasheed";
export type AudioQuality = "all" | "high" | "medium" | "low";
export type ViewMode = "grid" | "list";

export interface AudioPlayerState {
  iframeLoading: boolean;
  audioReady: boolean;
  estimatedDuration: string;
  audioError: string | null;
}

export interface FilterState {
  category: string;
  quality: string;
  reciter: string;
  showFavoritesOnly: boolean;
}
