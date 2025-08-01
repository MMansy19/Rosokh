// Available reciters with their API IDs (Al Quran Cloud API compatible)
// These are confirmed working reciters from the Al Quran Cloud API
export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", arabicName: "مشاري راشد العفاسي", altId: "Alafasy_128kbps", shortId: "afs" },
  { id: "ar.abdulsamad", name: "Abdul Basit Abdul Samad", arabicName: "عبد الباسط عبد الصمد", altId: "Abdul_Basit_Murattal_128kbps", shortId: "basit_warsh" },
  { id: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais", arabicName: "عبد الرحمن السديس", altId: "Sudais_128kbps", shortId: "sudais" },
  { id: "ar.shaatree", name: "Abu Bakr Ash-Shaatree", arabicName: "أبو بكر الشاطري", altId: "Ash-Shaatree_128kbps", shortId: "shatri" },
  { id: "ar.mahermuaiqly", name: "Maher Al Mueaqly", arabicName: "ماهر المعيقلي", altId: "MaherAlMuaiqly128kbps", shortId: "maher" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري", altId: "Husary_128kbps", shortId: "husary" },
  { id: "ar.saoodshuraym", name: "Sa'ud Ash-Shuraym", arabicName: "سعود الشريم", altId: "Saud_ash-Shuraym_128kbps", shortId: "shuraym" },
  { id: "ar.hanirifai", name: "Hani Rifai", arabicName: "هاني الرفاعي", altId: "Hani_Rifai_128kbps", shortId: "rifai" },
  { id: "ar.ahmedajamy", name: "Ahmed Al-Ajamy", arabicName: "أحمد بن علي العجمي", altId: "Ahmed_Ajamy_128kbps", shortId: "ajamy" },
  { id: "ar.abdullahbasfar", name: "Abdullah Basfar", arabicName: "عبد الله بصفر", altId: "Abdullah_Basfar_128kbps", shortId: "basfar" },
  { id: "ar.husarymujawwad", name: "Husary (Mujawwad)", arabicName: "محمود خليل الحصري (المجود)", altId: "Husary_Mujawwad_128kbps", shortId: "husary_mujawwad" },
  { id: "ar.hudhaify", name: "Ali Hudhaify", arabicName: "علي بن عبدالرحمن الحذيفي", altId: "Hudhaify_128kbps", shortId: "hudhaify" },
  { id: "ar.muhammadayyoub", name: "Muhammad Ayyoub", arabicName: "محمد أيوب", altId: "Muhammad_Ayyoub_128kbps", shortId: "ayyoub" },
  { id: "ar.muhammadjibreel", name: "Muhammad Jibreel", arabicName: "محمد جبريل", altId: "Muhammad_Jibreel_128kbps", shortId: "jibreel" },
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
    `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${edition}/${surahNumber.toString().padStart(3, '0')}.mp3`,
  
  // Alternative audio sources for fallback (CORS-friendly)
  alternativeAyahAudio: (reciter: string, ayahNumber: number) =>
    `https://audio.qurancdn.com/${reciter}/${ayahNumber}.mp3`,
  alternativeSurahAudio: (reciter: string, surahNumber: number) => 
    `https://download.quranicaudio.com/quran/${reciter}/${surahNumber.toString().padStart(3, '0')}.mp3`,
  
  // Mp3Quran.net alternative sources (reliable backup)
  mp3QuranAyah: (reciterShortId: string, ayahNumber: number) =>
    `https://server8.mp3quran.net/${reciterShortId}/${ayahNumber}.mp3`,
  mp3QuranSurah: (reciterShortId: string, surahNumber: number) => 
    `https://server8.mp3quran.net/${reciterShortId}/${surahNumber.toString().padStart(3, '0')}.mp3`,
  
  // EveryAyah.com alternative (reliable backup)
  everyAyahAudio: (reciter: string, surahNumber: number, ayahNumber: number) =>
    `https://everyayah.com/data/${reciter}/${surahNumber.toString().padStart(3, '0')}${ayahNumber.toString().padStart(3, '0')}.mp3`,
  
  // Proxy endpoints for CORS issues
  proxyAyahAudio: (bitrate: number, edition: string, ayahNumber: number) =>
    `/api/audio/proxy?url=${encodeURIComponent(`https://cdn.islamic.network/quran/audio/${bitrate}/${edition}/${ayahNumber}.mp3`)}`,
  proxySurahAudio: (bitrate: number, edition: string, surahNumber: number) =>
    `/api/audio/proxy?url=${encodeURIComponent(`https://cdn.islamic.network/quran/audio-surah/${bitrate}/${edition}/${surahNumber.toString().padStart(3, '0')}.mp3`)}`,
  
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
