// Available reciters with their API IDs
export const RECITERS = [
  { id: "7", name: "Abdul Rahman Al-Sudais", arabicName: "عبد الرحمن السديس" },
  {
    id: "3",
    name: "Abdul Basit Abdul Samad",
    arabicName: "عبد الباسط عبد الصمد",
  },
  { id: "1", name: "Alafasy", arabicName: "العفاسي" },
  { id: "6", name: "Abu Bakr Ash-Shaatree", arabicName: "أبو بكر الشاطري" },
  { id: "11", name: "Maher Al Mueaqly", arabicName: "ماهر المعيقلي" },
  { id: "4", name: "Saad Al Ghamdi", arabicName: "سعد الغامدي" },
  { id: "8", name: "Mishary Rashid Alafasy", arabicName: "مشاري راشد العفاسي" },
  { id: "5", name: "Sa'ud Ash-Shuraym", arabicName: "سعود الشريم" },
  { id: "9", name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي" },
];

// Translation editions by locale
export const TRANSLATION_EDITIONS = {
  en: "en.sahih", // Sahih International
  ru: "ru.osmanov", // Russian translation
  ar: "ar.muyassar", // Arabic tafseer
  default: "en.sahih",
};

// API endpoints
export const API_ENDPOINTS = {
  surahs: "https://api.alquran.cloud/v1/surah",
  surah: (id: number) => `https://api.alquran.cloud/v1/surah/${id}`,
  surahWithTranslation: (id: number, edition: string) =>
    `https://api.alquran.cloud/v1/surah/${id}/${edition}`,
  audio: (reciter: string, surah: string, ayah: string) =>
    `https://verses.quran.com/${reciter}/${surah}${ayah}.mp3`,
};

// Local storage keys
export const STORAGE_KEYS = {
  bookmarks: "quran_bookmarks",
  recentSearches: "quran_recent_searches",
  zoomLevel: "zoomLevel",
  settings: "quran_settings",
};
