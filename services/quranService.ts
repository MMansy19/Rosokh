import { API_ENDPOINTS, RECITERS, TRANSLATION_EDITIONS, AUDIO_BITRATES } from '@/components/quran/constants';

// Types for Al Quran Cloud API responses
export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda?: boolean | { id: number; recommended: boolean; obligatory: boolean };
  audio?: string;
  audioSecondary?: string[];
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Ayah[];
}

export interface QuranMeta {
  surahs: {
    references: Array<{
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
      revelationType: 'Meccan' | 'Medinan';
    }>;
  };
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'text' | 'audio';
  type: 'versebyverse' | 'translation' | 'tafsir' | 'transliteration';
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

class QuranService {
  private baseUrl = API_ENDPOINTS.base;
  private cache = new Map<string, any>();
  private readonly cacheTTL = 1000 * 60 * 60; // 1 hour

  private async fetchWithCache<T>(url: string, cacheKey?: string): Promise<T> {
    const key = cacheKey || url;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (result.code !== 200) {
        throw new Error(`API error: ${result.status}`);
      }

      // Cache the result
      this.cache.set(key, {
        data: result.data,
        timestamp: Date.now()
      });

      return result.data;
    } catch (error) {
      console.error('Quran API Error:', error);
      throw error;
    }
  }

  // Get all available editions
  async getEditions(format?: 'text' | 'audio', language?: string, type?: string): Promise<Edition[]> {
    let url = API_ENDPOINTS.editions;
    const params = new URLSearchParams();
    
    if (format) params.append('format', format);
    if (language) params.append('language', language);
    if (type) params.append('type', type);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.fetchWithCache<Edition[]>(url);
  }

  // Get all surahs (chapters)
  async getSurahs(): Promise<QuranMeta['surahs']['references']> {
    const response = await this.fetchWithCache<QuranMeta>(API_ENDPOINTS.meta);
    return response.surahs.references;
  }

  // Get specific surah with optional edition
  async getSurah(surahNumber: number, edition?: string): Promise<Surah> {
    const url = API_ENDPOINTS.surah(surahNumber, edition);
    return this.fetchWithCache<Surah>(url);
  }

  // Get surah with multiple editions (e.g., Arabic + translation)
  async getSurahMultipleEditions(surahNumber: number, editions: string[]): Promise<Surah[]> {
    const url = API_ENDPOINTS.surahMultipleEditions(surahNumber, editions);
    return this.fetchWithCache<Surah[]>(url);
  }

  // Get specific ayah
  async getAyah(reference: string | number, edition?: string): Promise<Ayah> {
    const url = API_ENDPOINTS.ayah(reference, edition);
    const response = await this.fetchWithCache<{ ayah: Ayah }>(url);
    return response.ayah;
  }

  // Search in Quran
  async search(query: string, surah?: number, lang?: string): Promise<any[]> {
    if (!query.trim()) return [];
    
    try {
      let searchUrl = `${this.baseUrl}/search/${encodeURIComponent(query)}`;
      
      const params = new URLSearchParams();
      if (surah) params.append('surah', surah.toString());
      if (lang) params.append('lang', lang);
      
      if (params.toString()) {
        searchUrl += `?${params.toString()}`;
      }

      const response = await this.fetchWithCache<any>(searchUrl);
      return response.matches || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Get audio URL for single ayah
  getAyahAudioUrl(ayahNumber: number, reciterEdition: string = 'ar.alafasy', bitrate: number = 128): string {
    return API_ENDPOINTS.ayahAudio(bitrate, reciterEdition, ayahNumber);
  }

  // Get audio URL for full surah
  getSurahAudioUrl(surahNumber: number, reciterEdition: string = 'ar.alafasy', bitrate: number = 128): string {
    return API_ENDPOINTS.surahAudio(bitrate, reciterEdition, surahNumber);
  }

  // Get multiple audio URL options for an ayah with fallbacks
  getAyahAudioUrls(ayahNumber: number, reciterEdition: string = 'ar.alafasy', surahNumber?: number): string[] {
    const reciter = RECITERS.find(r => r.id === reciterEdition);
    const altReciterId = reciter?.altId || 'Alafasy_128kbps';
    
    const urls: string[] = [];
    
    // Primary source - Islamic Network CDN
    urls.push(this.getAyahAudioUrl(ayahNumber, reciterEdition, 128));
    urls.push(this.getAyahAudioUrl(ayahNumber, reciterEdition, 64));
    
    // Alternative sources
    if (surahNumber) {
      urls.push(API_ENDPOINTS.everyAyahAudio(altReciterId, surahNumber, ayahNumber));
    }
    
    // QuranCDN alternative
    urls.push(API_ENDPOINTS.alternativeAyahAudio(reciterEdition, ayahNumber));
    
    // Fallback to default reciter
    if (reciterEdition !== 'ar.alafasy') {
      urls.push(this.getAyahAudioUrl(ayahNumber, 'ar.alafasy', 128));
      urls.push(this.getAyahAudioUrl(ayahNumber, 'ar.alafasy', 64));
    }
    
    return urls;
  }

  // Get multiple surah audio URL options with fallbacks
  getSurahAudioUrls(surahNumber: number, reciterEdition: string = 'ar.alafasy'): string[] {
    const reciter = RECITERS.find(r => r.id === reciterEdition);
    const altReciterId = reciter?.altId || 'Alafasy_128kbps';
    
    const urls: string[] = [];
    
    // Primary source - Islamic Network CDN
    urls.push(this.getSurahAudioUrl(surahNumber, reciterEdition, 128));
    urls.push(this.getSurahAudioUrl(surahNumber, reciterEdition, 64));
    
    // Alternative sources
    urls.push(API_ENDPOINTS.alternativeSurahAudio(altReciterId, surahNumber));
    
    // Fallback to default reciter
    if (reciterEdition !== 'ar.alafasy') {
      urls.push(this.getSurahAudioUrl(surahNumber, 'ar.alafasy', 128));
      urls.push(this.getSurahAudioUrl(surahNumber, 'ar.alafasy', 64));
    }
    
    return urls;
  }

  // Get ayah image URL
  getAyahImageUrl(surahNumber: number, ayahNumber: number, highRes: boolean = false): string {
    return highRes 
      ? API_ENDPOINTS.ayahImageHD(surahNumber, ayahNumber)
      : API_ENDPOINTS.ayahImage(surahNumber, ayahNumber);
  }

  // Check if audio URL is available using audio element to avoid CORS issues
  async checkAudioAvailability(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const timeout = setTimeout(() => {
        audio.src = '';
        resolve(false);
      }, 5000); // 5 second timeout

      audio.addEventListener('loadstart', () => {
        clearTimeout(timeout);
        resolve(true);
      }, { once: true });

      audio.addEventListener('error', () => {
        clearTimeout(timeout);
        resolve(false);
      }, { once: true });

      audio.addEventListener('abort', () => {
        clearTimeout(timeout);
        resolve(false);
      }, { once: true });

      try {
        audio.preload = 'metadata';
        audio.src = url;
      } catch (error) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  // Get available reciters
  getReciters(): typeof RECITERS {
    return RECITERS;
  }

  // Get translation for current locale
  getTranslationEdition(locale: string = 'en'): string {
    return TRANSLATION_EDITIONS[locale as keyof typeof TRANSLATION_EDITIONS] || TRANSLATION_EDITIONS.default;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const quranService = new QuranService();
export default quranService;
