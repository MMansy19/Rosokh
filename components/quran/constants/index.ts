// Available reciters with their API IDs (Al Quran Cloud API compatible)
export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", arabicName: "مشاري راشد العفاسي", altId: "Alafasy_128kbps" },
  { id: "ar.abdulsamad", name: "Abdul Basit Abdul Samad", arabicName: "عبد الباسط عبد الصمد", altId: "Abdul_Basit_Murattal_128kbps" },
  { id: "ar.sudais", name: "Abdul Rahman Al-Sudais", arabicName: "عبد الرحمن السديس", altId: "Sudais_128kbps" },
  { id: "ar.shaatree", name: "Abu Bakr Ash-Shaatree", arabicName: "أبو بكر الشاطري", altId: "Ash-Shaatree_128kbps" },
  { id: "ar.mahermuaiqly", name: "Maher Al Mueaqly", arabicName: "ماهر المعيقلي", altId: "MaherAlMuaiqly128kbps" },
  { id: "ar.saadalghamdi", name: "Saad Al Ghamdi", arabicName: "سعد الغامدي", altId: "Ghamadi_40kbps" },
  { id: "ar.shuraym", name: "Sa'ud Ash-Shuraym", arabicName: "سعود الشريم", altId: "Saud_ash-Shuraym_128kbps" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري", altId: "Husary_128kbps" },
  { id: "ar.minshawi", name: "Mohamed Siddiq El-Minshawi", arabicName: "محمد صديق المنشاوي", altId: "Minshawi_Murattal_128kbps" },
];

// Translation editions by locale (Al Quran Cloud API editions)
export const TRANSLATION_EDITIONS = {
  en: "en.sahih", // Sahih International
  ru: "ru.osmanov", // Russian translation
  ar: "ar.muyassar", // Arabic tafseer
  default: "en.sahih",
};

// Additional translation options
export const AVAILABLE_TRANSLATIONS = {
  "en.sahih": "Sahih International",
  "en.pickthall": "Pickthall",
  "en.yusufali": "Yusuf Ali",
  "en.asad": "Muhammad Asad",
  "ru.osmanov": "Osmanov (Russian)",
  "ru.porokhova": "Porokhova (Russian)",
  "ar.muyassar": "Tafseer Al-Muyassar",
  "quran-uthmani": "Arabic (Uthmani Script)",
};

// Audio bitrate options
export const AUDIO_BITRATES = [128, 64, 32];

// API endpoints (Al Quran Cloud API)
export const API_ENDPOINTS = {
  // Base API URL
  base: "https://api.alquran.cloud/v1",
  
  // Editions endpoints
  editions: "https://api.alquran.cloud/v1/edition",
  audioEditions: "https://api.alquran.cloud/v1/edition?format=audio",
  translationEditions: "https://api.alquran.cloud/v1/edition?type=translation",
  
  // Quran endpoints
  fullQuran: (edition: string) => `https://api.alquran.cloud/v1/quran/${edition}`,
  
  // Surah endpoints
  surahs: "https://api.alquran.cloud/v1/surah",
  surah: (id: number, edition?: string) => 
    edition ? `https://api.alquran.cloud/v1/surah/${id}/${edition}` : `https://api.alquran.cloud/v1/surah/${id}`,
  surahMultipleEditions: (id: number, editions: string[]) =>
    `https://api.alquran.cloud/v1/surah/${id}/editions/${editions.join(',')}`,
  
  // Ayah endpoints
  ayah: (reference: string | number, edition?: string) =>
    edition ? `https://api.alquran.cloud/v1/ayah/${reference}/${edition}` : `https://api.alquran.cloud/v1/ayah/${reference}`,
  ayahMultipleEditions: (reference: string | number, editions: string[]) =>
    `https://api.alquran.cloud/v1/ayah/${reference}/editions/${editions.join(',')}`,
  
  // Juz endpoints
  juz: (number: number, edition?: string) =>
    edition ? `https://api.alquran.cloud/v1/juz/${number}/${edition}` : `https://api.alquran.cloud/v1/juz/${number}`,
  
  // Metadata
  meta: "https://api.alquran.cloud/v1/meta",
  
  // CDN Audio endpoints (multiple sources for better fallback)
  ayahAudio: (bitrate: number, edition: string, ayahNumber: number) =>
    `https://cdn.islamic.network/quran/audio/${bitrate}/${edition}/${ayahNumber}.mp3`,
  surahAudio: (bitrate: number, edition: string, surahNumber: number) =>
    `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${edition}/${surahNumber}.mp3`,
  
  // Alternative audio sources for fallback
  alternativeAyahAudio: (reciter: string, ayahNumber: number) =>
    `https://audio.qurancdn.com/${reciter}/${ayahNumber}.mp3`,
  alternativeSurahAudio: (reciter: string, surahNumber: number) => 
    `https://download.quranicaudio.com/quran/${reciter}/${surahNumber.toString().padStart(3, '0')}.mp3`,
  
  // EveryAyah.com alternative (reliable backup)
  everyAyahAudio: (reciter: string, surahNumber: number, ayahNumber: number) =>
    `https://everyayah.com/data/${reciter}/${surahNumber.toString().padStart(3, '0')}${ayahNumber.toString().padStart(3, '0')}.mp3`,
  
  // Ayah images
  ayahImage: (surah: number, ayah: number) =>
    `https://cdn.islamic.network/quran/images/${surah}_${ayah}.png`,
  ayahImageHD: (surah: number, ayah: number) =>
    `https://cdn.islamic.network/quran/images/high-resolution/${surah}_${ayah}.png`,
};

// Local storage keys
export const STORAGE_KEYS = {
  bookmarks: "quran_bookmarks",
  recentSearches: "quran_recent_searches",
  zoomLevel: "zoomLevel",
  settings: "quran_settings",
};
