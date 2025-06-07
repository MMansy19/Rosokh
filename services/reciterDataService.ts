/**
 * Service for loading and processing reciter-specific surah data
 */
import { AudioTrack, Surah } from "@/types/audio";

export interface ReciterSurahData {
  [surahId: string]: string; // surahId -> fileId
}

export interface ReciterInfo {
  id: string;
  name: string;
  arabicName: string;
  dataFile: string;
}

export const AVAILABLE_RECITERS: ReciterInfo[] = [
  {
    id: "ahmad-fathy",
    name: "Ahmad Fathy",
    arabicName: "أحمد فتحي",
    dataFile: "/data/ahmad-fathy.json",
  },
  {
    id: "osama-hamed",
    name: "Osama Hamed",
    arabicName: "أسامة حامد",
    dataFile: "/data/osama-hamed.json",
  },
];

class ReciterDataService {
  private static instance: ReciterDataService;
  private cache: Map<string, ReciterSurahData> = new Map();
  private surahsCache: Surah[] = [];

  static getInstance(): ReciterDataService {
    if (!ReciterDataService.instance) {
      ReciterDataService.instance = new ReciterDataService();
    }
    return ReciterDataService.instance;
  } /**
   * Load surah metadata from drive-audio.json
   */
  private async loadSurahsData(): Promise<Surah[]> {
    if (this.surahsCache.length > 0) {
      return this.surahsCache;
    }

    try {
      const response = await fetch("/data/drive-audio.json");
      if (!response.ok) {
        throw new Error("Failed to load surahs data");
      }

      const data = await response.json();
      this.surahsCache = data.surahs || [];
      return this.surahsCache;
    } catch (error) {
      console.error("Error loading surahs data:", error);
      this.surahsCache = [];
      return [];
    }
  }

  /**
   * Load data for a specific reciter
   */
  async loadReciterData(reciterId: string): Promise<ReciterSurahData> {
    if (this.cache.has(reciterId)) {
      return this.cache.get(reciterId)!;
    }

    const reciter = AVAILABLE_RECITERS.find((r) => r.id === reciterId);
    if (!reciter) {
      throw new Error(`Reciter ${reciterId} not found`);
    }

    try {
      const response = await fetch(reciter.dataFile);
      if (!response.ok) {
        throw new Error(`Failed to load ${reciter.name} data`);
      }

      const data: ReciterSurahData = await response.json();
      this.cache.set(reciterId, data);
      return data;
    } catch (error) {
      console.error(`Error loading reciter data for ${reciterId}:`, error);
      throw error;
    }
  }

  /**
   * Load data for all available reciters
   */
  async loadAllRecitersData(): Promise<Map<string, ReciterSurahData>> {
    const results = new Map<string, ReciterSurahData>();

    await Promise.all(
      AVAILABLE_RECITERS.map(async (reciter) => {
        try {
          const data = await this.loadReciterData(reciter.id);
          results.set(reciter.id, data);
        } catch (error) {
          console.warn(`Failed to load data for ${reciter.name}:`, error);
        }
      }),
    );

    return results;
  }

  /**
   * Convert reciter data to AudioTrack format
   */
  async convertToAudioTracks(
    reciterId: string,
    data: ReciterSurahData,
  ): Promise<AudioTrack[]> {
    const reciter = AVAILABLE_RECITERS.find((r) => r.id === reciterId);
    if (!reciter) {
      return [];
    }

    // Load surah metadata
    const surahs = await this.loadSurahsData(); // Load surah metadata
    const surahsData = await this.loadSurahsData();

    // Create a map for faster surah lookup
    const surahMap = new Map(
      surahsData.map((surah) => [surah.id.toString(), surah]),
    );
    return Object.entries(data).map(([surahId, fileId]) => {
      const surah = surahMap.get(surahId);
      const surahName = surah ? surah.name : `Surah ${surahId}`;
      const arabicName = surah ? surah.arabicName : `سورة ${surahId}`;

      return {
        id: `${reciterId}-${surahId}`,
        title: surahName,
        arabicTitle: arabicName,
        reciter: {
          id: reciter.id,
          name: reciter.name,
          arabicName: reciter.arabicName,
        },
        duration: "Unknown",
        url: `https://drive.google.com/file/d/${fileId}/view`,
        category: "quran" as const,
        surah: parseInt(surahId),
        quality: "high" as const,
        size: "Unknown",
        isOfflineAvailable: false,
      };
    });
  }

  /**
   * Get all available tracks from all reciters
   */
  async getAllReciterTracks(): Promise<AudioTrack[]> {
    const allData = await this.loadAllRecitersData();
    const tracks: AudioTrack[] = [];

    for (const [reciterId, data] of allData.entries()) {
      const reciterTracks = await this.convertToAudioTracks(reciterId, data);
      tracks.push(...reciterTracks);
    }

    return tracks;
  }
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.surahsCache = [];
  }
}

export default ReciterDataService;
