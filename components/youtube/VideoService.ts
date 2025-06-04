export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  viewCount: number;
  publishedAt: Date;
  channelId: string;
  channelTitle: string;
  category: VideoCategory;
  tags: string[];
  language: string;
  quality: VideoQuality[];
}

export interface VideoCategory {
  id: string;
  name: string;
  nameArabic?: string;
  nameRussian?: string;
  icon: string;
  description: string;
}

export interface VideoQuality {
  resolution: string;
  url: string;
  fileSize?: number;
}

export interface VideoPlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  videos: VideoMetadata[];
  category: VideoCategory;
  isOfficial: boolean;
  creator: string;
  language: string;
}

export interface SearchFilters {
  category?: string;
  language?: string;
  duration?: "short" | "medium" | "long";
  uploadDate?: "hour" | "today" | "week" | "month" | "year";
  quality?: string;
  channel?: string;
}

// Predefined Islamic video categories
export const VIDEO_CATEGORIES: VideoCategory[] = [
  {
    id: "quran_recitation",
    name: "Quran Recitation",
    nameArabic: "تلاوة القرآن",
    nameRussian: "Чтение Корана",
    icon: "📖",
    description: "Beautiful Quran recitations from renowned reciters",
  },
  {
    id: "islamic_lectures",
    name: "Islamic Lectures",
    nameArabic: "المحاضرات الإسلامية",
    nameRussian: "Исламские лекции",
    icon: "🎓",
    description: "Educational talks and lectures on Islamic topics",
  },
  {
    id: "nasheed",
    name: "Islamic Nasheed",
    nameArabic: "الأناشيد الإسلامية",
    nameRussian: "Исламские нашиды",
    icon: "🎵",
    description: "Beautiful Islamic songs and nasheeds",
  },
  {
    id: "hajj_umrah",
    name: "Hajj & Umrah",
    nameArabic: "الحج والعمرة",
    nameRussian: "Хадж и Умра",
    icon: "🕋",
    description: "Guidance and experiences from Hajj and Umrah",
  },
  {
    id: "ramadan",
    name: "Ramadan",
    nameArabic: "رمضان",
    nameRussian: "Рамадан",
    icon: "🌙",
    description: "Ramadan-related content and reflections",
  },
  {
    id: "islamic_history",
    name: "Islamic History",
    nameArabic: "التاريخ الإسلامي",
    nameRussian: "Исламская история",
    icon: "📚",
    description: "Stories and lessons from Islamic history",
  },
  {
    id: "prophet_stories",
    name: "Prophet Stories",
    nameArabic: "قصص الأنبياء",
    nameRussian: "Истории пророков",
    icon: "✨",
    description: "Stories of the prophets and their teachings",
  },
  {
    id: "islamic_knowledge",
    name: "Islamic Knowledge",
    nameArabic: "المعرفة الإسلامية",
    nameRussian: "Исламские знания",
    icon: "🧠",
    description: "Educational content about Islamic principles",
  },
];

// Curated Islamic YouTube channels
export const FEATURED_CHANNELS = [
  {
    id: "UCPaEaGx0l0qtCTlm53dn5zg",
    name: "Quran.com",
    description: "Official Quran recitations and translations",
    subscriberCount: "2.5M",
    isVerified: true,
    language: "multiple",
  },
  {
    id: "UC12345678901234567890",
    name: "Islamic Guidance",
    description: "Contemporary Islamic lectures and guidance",
    subscriberCount: "1.8M",
    isVerified: true,
    language: "en",
  },
  {
    id: "UC98765432109876543210",
    name: "القرآن الكريم",
    description: "Arabic Quran recitations and Islamic content",
    subscriberCount: "3.2M",
    isVerified: true,
    language: "ar",
  },
];

export class VideoService {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "YouTube API key not found. Video features will be limited.",
      );
    }
  }

  /**
   * Search for Islamic videos based on query and filters
   */
  async searchVideos(
    query: string,
    filters: SearchFilters = {},
    maxResults: number = 20,
  ): Promise<VideoMetadata[]> {
    try {
      // Check if API key is available
      if (!this.apiKey) {
        console.warn("YouTube API key not configured. Returning mock data.");
        return this.getMockVideos(query, maxResults);
      }

      // Build search parameters
      const params = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        q: this.buildSearchQuery(query, filters),
        type: "video",
        maxResults: maxResults.toString(),
        order: "relevance",
        key: this.apiKey,
        safeSearch: "strict",
        regionCode: "US",
      });

      // Add duration filter
      if (filters.duration) {
        params.append(
          "videoDuration",
          this.mapDurationFilter(filters.duration),
        );
      }

      // Add upload date filter
      if (filters.uploadDate) {
        const publishedAfter = this.getUploadDateFilter(filters.uploadDate);
        params.append("publishedAfter", publishedAfter);
      }

      const response = await fetch(`${this.baseUrl}/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `YouTube API error: ${errorData.error?.message || `HTTP ${response.status}`}`,
        );
      }

      const data = await response.json();

      // Transform YouTube API response to our VideoMetadata format
      return this.transformSearchResults(data.items || []);
    } catch (error) {
      console.error("Video search failed:", error);
      return this.getFallbackVideos(query);
    }
  }

  /**
   * Get videos from a specific category
   */
  async getVideosByCategory(
    categoryId: string,
    maxResults: number = 20,
  ): Promise<VideoMetadata[]> {
    const category = VIDEO_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) {
      return [];
    }

    // Use category-specific search terms
    const searchTerms = this.getCategorySearchTerms(categoryId);
    return this.searchVideos(searchTerms, { category: categoryId }, maxResults);
  }

  /**
   * Get featured playlists for Islamic content
   */
  async getFeaturedPlaylists(
    language: string = "en",
  ): Promise<VideoPlaylist[]> {
    try {
      // In a real implementation, this would fetch from YouTube API
      // For now, return curated playlists
      return this.getCuratedPlaylists(language);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      return this.getCuratedPlaylists(language);
    }
  }

  /**
   * Get trending Islamic videos
   */
  async getTrendingVideos(region: string = "US"): Promise<VideoMetadata[]> {
    try {
      const params = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        chart: "mostPopular",
        regionCode: region,
        maxResults: "20",
        key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/videos?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `YouTube API error: ${data.error?.message || "Unknown error"}`,
        );
      }

      // Filter for Islamic content
      const islamicVideos =
        data.items?.filter((item: any) =>
          this.isIslamicContent(item.snippet),
        ) || [];

      return this.transformSearchResults(islamicVideos);
    } catch (error) {
      console.error("Failed to fetch trending videos:", error);
      return this.getFallbackTrendingVideos();
    }
  }

  /**
   * Get video details by ID
   */
  async getVideoById(videoId: string): Promise<VideoMetadata | null> {
    try {
      const params = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        id: videoId,
        key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/videos?${params}`);
      const data = await response.json();

      if (!response.ok || !data.items?.length) {
        return null;
      }

      const transformedVideos = this.transformSearchResults(data.items);
      return transformedVideos[0] || null;
    } catch (error) {
      console.error("Failed to fetch video details:", error);
      return null;
    }
  }

  // Private helper methods

  private buildSearchQuery(query: string, filters: SearchFilters): string {
    let searchTerms = [query];

    // Add Islamic context to search
    searchTerms.push("Islamic", "Islam", "Muslim");

    // Add language-specific terms
    if (filters.language === "ar") {
      searchTerms.push("إسلامي", "القرآن", "الإسلام");
    } else if (filters.language === "ru") {
      searchTerms.push("исламский", "Коран", "ислам");
    }

    // Add category-specific terms
    if (filters.category) {
      const categoryTerms = this.getCategorySearchTerms(filters.category);
      searchTerms.push(categoryTerms);
    }

    return searchTerms.join(" ");
  }

  private getCategorySearchTerms(categoryId: string): string {
    const categoryTermsMap: Record<string, string> = {
      quran_recitation: "Quran recitation تلاوة القرآن",
      islamic_lectures: "Islamic lecture sermon خطبة محاضرة",
      nasheed: "nasheed أناشيد Islamic song",
      hajj_umrah: "Hajj Umrah حج عمرة pilgrimage",
      ramadan: "Ramadan رمضان fasting",
      islamic_history: "Islamic history تاريخ إسلامي",
      prophet_stories: "Prophet stories قصص الأنبياء",
      islamic_knowledge: "Islamic knowledge علم إسلامي",
    };

    return categoryTermsMap[categoryId] || "";
  }

  private mapDurationFilter(duration: string): string {
    const durationMap: Record<string, string> = {
      short: "short", // < 4 minutes
      medium: "medium", // 4-20 minutes
      long: "long", // > 20 minutes
    };

    return durationMap[duration] || "any";
  }

  private getUploadDateFilter(uploadDate: string): string {
    const now = new Date();
    const filterMap: Record<string, number> = {
      hour: 1,
      today: 24,
      week: 24 * 7,
      month: 24 * 30,
      year: 24 * 365,
    };

    const hours = filterMap[uploadDate] || 24 * 365;
    const publishedAfter = new Date(now.getTime() - hours * 60 * 60 * 1000);

    return publishedAfter.toISOString();
  }

  private transformSearchResults(items: any[]): VideoMetadata[] {
    return items.map((item) => ({
      id: item.id.videoId || item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url,
      duration: this.parseDuration(item.contentDetails?.duration || "PT0S"),
      viewCount: parseInt(item.statistics?.viewCount || "0"),
      publishedAt: new Date(item.snippet.publishedAt),
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      category: this.detectCategory(item.snippet),
      tags: item.snippet.tags || [],
      language: this.detectLanguage(item.snippet),
      quality: [
        {
          resolution: "720p",
          url: `https://www.youtube.com/watch?v=${item.id.videoId || item.id}`,
        },
      ],
    }));
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (PT15M33S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    return hours * 3600 + minutes * 60 + seconds;
  }

  private detectCategory(snippet: any): VideoCategory {
    const title = snippet.title.toLowerCase();
    const description = snippet.description.toLowerCase();
    const text = `${title} ${description}`;

    // Simple keyword-based category detection
    for (const category of VIDEO_CATEGORIES) {
      const keywords = this.getCategoryKeywords(category.id);
      if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
        return category;
      }
    }

    return VIDEO_CATEGORIES[0]; // Default to Quran recitation
  }

  private getCategoryKeywords(categoryId: string): string[] {
    const keywordsMap: Record<string, string[]> = {
      quran_recitation: ["quran", "recitation", "تلاوة", "قرآن", "recite"],
      islamic_lectures: ["lecture", "sermon", "khutbah", "محاضرة", "خطبة"],
      nasheed: ["nasheed", "أناشيد", "song", "music"],
      hajj_umrah: ["hajj", "umrah", "حج", "عمرة", "pilgrimage"],
      ramadan: ["ramadan", "رمضان", "fasting", "iftar"],
      islamic_history: ["history", "تاريخ", "historical", "story"],
      prophet_stories: ["prophet", "نبي", "messenger", "قصص"],
      islamic_knowledge: ["knowledge", "education", "learn", "علم"],
    };

    return keywordsMap[categoryId] || [];
  }

  private detectLanguage(snippet: any): string {
    const text = `${snippet.title} ${snippet.description}`;

    // Simple language detection based on script
    if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic script
    if (/[\u0400-\u04FF]/.test(text)) return "ru"; // Cyrillic script

    return "en"; // Default to English
  }

  private isIslamicContent(snippet: any): boolean {
    const text = `${snippet.title} ${snippet.description}`.toLowerCase();
    const islamicKeywords = [
      "islam",
      "islamic",
      "muslim",
      "quran",
      "allah",
      "prophet",
      "muhammad",
      "إسلام",
      "مسلم",
      "قرآن",
      "الله",
      "محمد",
      "نبي",
      "ислам",
      "мусульманский",
      "коран",
      "аллах",
      "пророк",
    ];

    return islamicKeywords.some((keyword) => text.includes(keyword));
  }

  private getCuratedPlaylists(language: string): VideoPlaylist[] {
    // Return curated playlists based on language
    const playlists: VideoPlaylist[] = [
      {
        id: "pl_quran_complete",
        title:
          language === "ar"
            ? "القرآن الكريم كاملاً"
            : language === "ru"
              ? "Полный Коран"
              : "Complete Quran Recitation",
        description: "Complete Quran recitation by renowned reciters",
        thumbnailUrl: "https://example.com/quran-playlist.jpg",
        videoCount: 114,
        videos: [],
        category: VIDEO_CATEGORIES[0],
        isOfficial: true,
        creator: "Quran.com",
        language,
      },
      {
        id: "pl_ramadan_lectures",
        title:
          language === "ar"
            ? "محاضرات رمضان"
            : language === "ru"
              ? "Лекции Рамадана"
              : "Ramadan Lectures",
        description: "Special Ramadan lectures and reflections",
        thumbnailUrl: "https://example.com/ramadan-playlist.jpg",
        videoCount: 30,
        videos: [],
        category: VIDEO_CATEGORIES.find((c) => c.id === "ramadan")!,
        isOfficial: false,
        creator: "Islamic Center",
        language,
      },
    ];

    return playlists;
  }

  private getFallbackVideos(query: string): VideoMetadata[] {
    // Return mock/cached videos when API fails
    return [
      {
        id: "fallback_1",
        title: "Beautiful Quran Recitation - Surah Al-Fatiha",
        description: "Peaceful recitation of the opening chapter of the Quran",
        thumbnailUrl: "https://example.com/fallback1.jpg",
        duration: 180,
        viewCount: 1000000,
        publishedAt: new Date("2024-01-01"),
        channelId: "fallback_channel",
        channelTitle: "Islamic Audio",
        category: VIDEO_CATEGORIES[0],
        tags: ["quran", "recitation", "fatiha"],
        language: "ar",
        quality: [{ resolution: "720p", url: "#" }],
      },
    ];
  }

  private getMockVideos(query: string, maxResults: number): VideoMetadata[] {
    // Return mock videos when API key is not available
    const mockVideos: VideoMetadata[] = [
      {
        id: "mock_1",
        title: "Beautiful Quran Recitation - Surah Al-Baqarah",
        description:
          "Peaceful recitation of Surah Al-Baqarah with English translation",
        thumbnailUrl:
          "https://via.placeholder.com/320x180/10B981/FFFFFF?text=Quran+Recitation",
        duration: 3600,
        viewCount: 2500000,
        publishedAt: new Date("2024-01-15"),
        channelId: "mock_channel_1",
        channelTitle: "Peaceful Recitations",
        category:
          VIDEO_CATEGORIES.find((c) => c.id === "quran_recitation") ||
          VIDEO_CATEGORIES[0],
        tags: ["quran", "recitation", "baqarah", "arabic"],
        language: "ar",
        quality: [{ resolution: "720p", url: "#" }],
      },
      {
        id: "mock_2",
        title: "Islamic Lecture - The Importance of Prayer",
        description:
          "Educational lecture about the significance of daily prayers in Islam",
        thumbnailUrl:
          "https://via.placeholder.com/320x180/059669/FFFFFF?text=Islamic+Lecture",
        duration: 2400,
        viewCount: 1800000,
        publishedAt: new Date("2024-01-10"),
        channelId: "mock_channel_2",
        channelTitle: "Islamic Knowledge",
        category:
          VIDEO_CATEGORIES.find((c) => c.id === "lectures") ||
          VIDEO_CATEGORIES[1],
        tags: ["islam", "prayer", "salah", "education"],
        language: "en",
        quality: [{ resolution: "720p", url: "#" }],
      },
      {
        id: "mock_3",
        title: "Story of Prophet Muhammad (PBUH) - Part 1",
        description:
          "The life and teachings of Prophet Muhammad (Peace be upon him)",
        thumbnailUrl:
          "https://via.placeholder.com/320x180/7C3AED/FFFFFF?text=Prophet+Stories",
        duration: 1800,
        viewCount: 3200000,
        publishedAt: new Date("2024-01-05"),
        channelId: "mock_channel_3",
        channelTitle: "Prophet Stories",
        category:
          VIDEO_CATEGORIES.find((c) => c.id === "prophet_stories") ||
          VIDEO_CATEGORIES[2],
        tags: ["prophet", "muhammad", "seerah", "biography"],
        language: "en",
        quality: [{ resolution: "720p", url: "#" }],
      },
    ];

    return mockVideos.slice(0, maxResults);
  }

  private getFallbackTrendingVideos(): VideoMetadata[] {
    return this.getFallbackVideos("trending");
  }
}

// Utility functions for video formatting
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const getVideoEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
};
