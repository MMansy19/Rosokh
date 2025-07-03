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

    return this.fetchWithCache<Edition[]>(url, `editions_${format}_${language}_${type}`);
  }

  // Get Quran metadata (list of all surahs)
  async getQuranMeta(): Promise<QuranMeta> {
    return this.fetchWithCache<QuranMeta>(API_ENDPOINTS.meta, 'quran_meta');
  }

  // Get full Quran in specific edition
  async getFullQuran(edition: string = 'quran-uthmani'): Promise<{ surahs: Surah[] }> {
    const url = API_ENDPOINTS.fullQuran(edition);
    return this.fetchWithCache<{ surahs: Surah[] }>(url, `full_quran_${edition}`);
  }

  // Get specific surah
  async getSurah(surahNumber: number, edition?: string): Promise<Surah> {
    const url = API_ENDPOINTS.surah(surahNumber, edition);
    return this.fetchWithCache<Surah>(url, `surah_${surahNumber}_${edition || 'default'}`);
  }

  // Get surah with multiple editions (Arabic + translations)
  async getSurahWithMultipleEditions(
    surahNumber: number, 
    editions: string[] = ['quran-uthmani', 'en.sahih']
  ): Promise<Surah[]> {
    const url = API_ENDPOINTS.surahMultipleEditions(surahNumber, editions);
    return this.fetchWithCache<Surah[]>(url, `surah_multi_${surahNumber}_${editions.join('_')}`);
  }

  // Get specific ayah
  async getAyah(reference: string | number, edition?: string): Promise<Ayah> {
    const url = API_ENDPOINTS.ayah(reference, edition);
    return this.fetchWithCache<Ayah>(url, `ayah_${reference}_${edition || 'default'}`);
  }

  // Get ayah with multiple editions
  async getAyahWithMultipleEditions(
    reference: string | number,
    editions: string[] = ['quran-uthmani', 'en.sahih']
  ): Promise<Ayah[]> {
    const url = API_ENDPOINTS.ayahMultipleEditions(reference, editions);
    return this.fetchWithCache<Ayah[]>(url, `ayah_multi_${reference}_${editions.join('_')}`);
  }

  // Get specific juz
  async getJuz(juzNumber: number, edition?: string): Promise<{ ayahs: Ayah[] }> {
    const url = API_ENDPOINTS.juz(juzNumber, edition);
    return this.fetchWithCache<{ ayahs: Ayah[] }>(url, `juz_${juzNumber}_${edition || 'default'}`);
  }

  // Get audio URL for specific ayah
  getAyahAudioUrl(ayahNumber: number, reciterEdition: string = 'ar.alafasy', bitrate: number = 128): string {
    return API_ENDPOINTS.ayahAudio(bitrate, reciterEdition, ayahNumber);
  }

  // Get audio URL for full surah
  getSurahAudioUrl(surahNumber: number, reciterEdition: string = 'ar.alafasy', bitrate: number = 128): string {
    return API_ENDPOINTS.surahAudio(bitrate, reciterEdition, surahNumber);
  }

  // Get ayah image URL
  getAyahImageUrl(surahNumber: number, ayahNumber: number, highRes: boolean = false): string {
    return highRes 
      ? API_ENDPOINTS.ayahImageHD(surahNumber, ayahNumber)
      : API_ENDPOINTS.ayahImage(surahNumber, ayahNumber);
  }

  // Check if audio URL is available
  async checkAudioAvailability(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      // Accept 200 (OK), 206 (Partial Content), and 416 (Range Not Satisfiable) as valid for audio files
      const validStatuses = [200, 206, 416];
      const isValid = validStatuses.includes(response.status);
      
      if (!isValid) {
        console.warn(`Audio URL check failed for ${url}: Status ${response.status}`);
      }
      
      return isValid;
    } catch (error) {
      console.error(`Error checking audio availability for ${url}:`, error);
      return false;
    }
  }

  // Get available reciters
  getReciters(): typeof RECITERS {
    return RECITERS;
  }

  // Get translation for current locale
  getTranslationEdition(locale: string = 'en'): string {
    return TRANSLATION_EDITIONS[locale as keyof typeof TRANSLATION_EDITIONS] || TRANSLATION_EDITIONS.default;
  }

  // Search functionality (basic implementation)
  async searchQuran(query: string, edition: string = 'en.sahih'): Promise<Ayah[]> {
    try {
      // Get full Quran and search in memory (for basic implementation)
      const quran = await this.getFullQuran(edition);
      const results: Ayah[] = [];
      
      const searchTerm = query.toLowerCase();
      
      quran.surahs.forEach(surah => {
        surah.ayahs.forEach(ayah => {
          if (ayah.text.toLowerCase().includes(searchTerm)) {
            results.push({
              ...ayah,
              // Add surah context
              text: `${surah.englishName} (${surah.number}:${ayah.numberInSurah}) - ${ayah.text}`
            });
          }
        });
      });
      
      return results.slice(0, 50); // Limit results
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Utility: Convert surah:ayah format to absolute ayah number
  convertToAbsoluteAyahNumber(surahNumber: number, ayahInSurah: number): number {
    // This is a simplified calculation - you might want to use the actual mapping
    // For now, we'll use the API's surah:ayah format directly
    return parseInt(`${surahNumber}${ayahInSurah.toString().padStart(3, '0')}`);
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
