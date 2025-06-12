// Shared types for Quran components
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: number;
}

export interface Translation {
  id: number;
  text: string;
  language_name: string;
  resource_name: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentAyah: number | null;
  currentSurah: number;
  volume: number;
  speed: number;
  isMuted: boolean;
  reciter: string;
}

export interface SearchResult {
  id: string;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
  relevanceScore: number;
}

export interface QuranClientProps {
  locale: string;
  messages: any;
}

export type TabType = "read" | "search" | "mushaf";
export type RepeatMode = "none" | "verse" | "surah";

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
}
