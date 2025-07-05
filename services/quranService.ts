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
    const shortId = reciter?.shortId || 'afs';
    
    const urls: string[] = [];
    
    // Priority 1: Direct CDN URLs (these work best for individual ayahs)
    urls.push(this.getAyahAudioUrl(ayahNumber, reciterEdition, 128));
    urls.push(this.getAyahAudioUrl(ayahNumber, reciterEdition, 64));
    
    // Priority 2: EveryAyah.com (only if we have valid mapping and surah number)
    if (surahNumber && altReciterId) {
      urls.push(API_ENDPOINTS.everyAyahAudio(altReciterId, surahNumber, ayahNumber));
    }
    
    // Priority 3: MP3Quran.net alternative sources
    urls.push(API_ENDPOINTS.mp3QuranAyah(shortId, ayahNumber));
    
    // Priority 4: Use proxy URLs as backup (for CORS issues)
    urls.push(API_ENDPOINTS.proxyAyahAudio(128, reciterEdition, ayahNumber));
    urls.push(API_ENDPOINTS.proxyAyahAudio(64, reciterEdition, ayahNumber));
    
    // Priority 5: Alternative audio sources
    urls.push(API_ENDPOINTS.alternativeAyahAudio(reciterEdition.replace('ar.', ''), ayahNumber));
    
    // Priority 6: Always fallback to Alafasy (guaranteed to work)
    if (reciterEdition !== 'ar.alafasy') {
      urls.push(this.getAyahAudioUrl(ayahNumber, 'ar.alafasy', 128));
      urls.push(API_ENDPOINTS.mp3QuranAyah('afs', ayahNumber));
      if (surahNumber) {
        urls.push(API_ENDPOINTS.everyAyahAudio('Alafasy_128kbps', surahNumber, ayahNumber));
      }
    }
    
    return urls;
  }

  // Get multiple surah audio URL options with fallbacks
  getSurahAudioUrls(surahNumber: number, reciterEdition: string = 'ar.alafasy'): string[] {
    const reciter = RECITERS.find(r => r.id === reciterEdition);
    const altReciterId = reciter?.altId || 'Alafasy_128kbps';
    const shortId = reciter?.shortId || 'afs';
    
    const urls: string[] = [];
    
    // Priority 1: MP3Quran.net sources (these work best for full surahs)
    urls.push(API_ENDPOINTS.mp3QuranSurah(shortId, surahNumber));
    
    // Priority 2: Alternative download sources (working ones from test)
    if (reciterEdition === 'ar.alafasy') {
      urls.push(`https://server8.mp3quran.net/afs/${surahNumber.toString().padStart(3, '0')}.mp3`);
    }
    
    // Priority 3: Use proxy URLs as backup
    urls.push(API_ENDPOINTS.proxySurahAudio(128, reciterEdition, surahNumber));
    urls.push(API_ENDPOINTS.proxySurahAudio(64, reciterEdition, surahNumber));
    
    // Priority 4: Direct CDN URLs (usually don't work but worth trying)
    urls.push(this.getSurahAudioUrl(surahNumber, reciterEdition, 128));
    urls.push(this.getSurahAudioUrl(surahNumber, reciterEdition, 64));
    
    // Priority 5: Alternative sources with different naming conventions
    urls.push(API_ENDPOINTS.alternativeSurahAudio(altReciterId, surahNumber));
    urls.push(API_ENDPOINTS.alternativeSurahAudio(reciterEdition.replace('ar.', ''), surahNumber));
    
    // Priority 6: Always fallback to Alafasy (guaranteed to work)
    if (reciterEdition !== 'ar.alafasy') {
      urls.push(API_ENDPOINTS.mp3QuranSurah('afs', surahNumber));
      urls.push(`https://server8.mp3quran.net/afs/${surahNumber.toString().padStart(3, '0')}.mp3`);
      urls.push(this.getSurahAudioUrl(surahNumber, 'ar.alafasy', 128));
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
        audio.remove();
        resolve(false);
      }, 5000); // Increased timeout to 5 seconds for better reliability

      const cleanup = () => {
        clearTimeout(timeout);
        audio.src = '';
        audio.remove();
      };

      audio.addEventListener('loadstart', () => {
        cleanup();
        resolve(true);
      }, { once: true });

      audio.addEventListener('canplay', () => {
        cleanup();
        resolve(true);
      }, { once: true });

      audio.addEventListener('canplaythrough', () => {
        cleanup();
        resolve(true);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.warn(`Audio availability check failed for ${url}:`, e);
        cleanup();
        resolve(false);
      }, { once: true });

      audio.addEventListener('abort', () => {
        cleanup();
        resolve(false);
      }, { once: true });

      try {
        audio.preload = 'metadata';
        audio.volume = 0; // Mute during testing
        audio.src = url;
        audio.load(); // Explicitly load the audio
      } catch (error) {
        console.warn(`Error setting audio source ${url}:`, error);
        cleanup();
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

  // Validate reciter availability
  async validateReciter(reciterId: string): Promise<boolean> {
    try {
      const audioEditions = await this.getEditions('audio');
      const availableReciters = audioEditions
        .filter(edition => edition.type === 'versebyverse')
        .map(edition => edition.identifier);
      
      return availableReciters.includes(reciterId);
    } catch (error) {
      console.warn(`Failed to validate reciter ${reciterId}:`, error);
      return reciterId === 'ar.alafasy'; // Default to true for Alafasy
    }
  }

  // Get working reciter ID with fallback
  async getWorkingReciter(preferredReciter: string): Promise<string> {
    const isValid = await this.validateReciter(preferredReciter);
    if (isValid) {
      return preferredReciter;
    }
    
    // Try common alternatives
    const alternatives = [
      'ar.alafasy',
      'ar.abdulbasit',
      'ar.sudais',
      'ar.husary'
    ];
    
    for (const alt of alternatives) {
      const isAltValid = await this.validateReciter(alt);
      if (isAltValid) {
        console.log(`Falling back from ${preferredReciter} to ${alt}`);
        return alt;
      }
    }
    
    return 'ar.alafasy'; // Ultimate fallback
  }
}

// Export singleton instance
export const quranService = new QuranService();
export default quranService;
