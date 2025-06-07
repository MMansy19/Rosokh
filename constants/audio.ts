export const AUDIO_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "quran", label: "Quran" },
  { value: "dua", label: "Duas" },
  { value: "lecture", label: "Lectures" },
  { value: "nasheed", label: "Nasheeds" },
];

export const AUDIO_QUALITIES = [
  { value: "all", label: "All Qualities" },
  { value: "high", label: "High Quality" },
  { value: "medium", label: "Medium Quality" },
  { value: "low", label: "Low Quality" },
];

export const AUDIO_RECITERS = [
  { value: "all", label: "All Reciters" },
  { value: "osama-hamed", label: "Osama Hamed" },
  { value: "ahmad-fathy", label: "Ahmad Fathy" },
];

export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const DURATION_ESTIMATES = {
  quran: "45-75 min",
  dua: "5-15 min",
  lecture: "30-90 min",
  nasheed: "3-8 min",
} as const;

export const QUALITY_COLORS = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-red-500",
} as const;

export const API_ENDPOINTS = {
  audio: "/api/audio",
} as const;

export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;
