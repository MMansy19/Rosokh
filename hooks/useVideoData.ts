import { useState, useEffect } from "react";

export interface VideoMetadata {
  id: string;
  youtubeId?: string; // Actual YouTube video ID for playlist videos
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  thumbnailUrl: string;
  category: {
    id: string;
    name: string;
    nameArabic?: string;
    nameRussian?: string;
    icon: string;
  };
  tags: string[];
  language: string;
  quality: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  nameArabic?: string;
  nameRussian?: string;
  icon: string;
  color: string;
}

export interface VideoData {
  videos: VideoMetadata[];
  metadata: {
    totalVideos: number;
    lastUpdated: string;
    version: string;
  };
}

export const VIDEO_CATEGORIES: VideoCategory[] = [
  {
    id: "quran_recitation",
    name: "Quran Recitation",
    nameArabic: "تلاوة القرآن",
    nameRussian: "Чтение Корана",
    icon: "📖",
    color: "emerald"
  },
  {
    id: "quran_tafsir",
    name: "Quran Tafsir",
    nameArabic: "تفسير القرآن الكريم",
    nameRussian: "Тафсир Корана",
    icon: "📚",
    color: "blue"
  },
  {
    id: "islamic_lectures",
    name: "Islamic Lectures",
    nameArabic: "محاضرات إسلامية",
    nameRussian: "Исламские лекции",
    icon: "🎓",
    color: "purple"
  },
  {
    id: "nasheed",
    name: "Islamic Nasheed",
    nameArabic: "أناشيد إسلامية",
    nameRussian: "Исламские нашиды",
    icon: "🎵",
    color: "pink"
  },
  {
    id: "hajj_umrah",
    name: "Hajj & Umrah",
    nameArabic: "الحج والعمرة",
    nameRussian: "Хадж и Умра",
    icon: "🕋",
    color: "orange"
  },
  {
    id: "ramadan",
    name: "Ramadan",
    nameArabic: "رمضان",
    nameRussian: "Рамадан",
    icon: "🌙",
    color: "yellow"
  },
  {
    id: "islamic_history",
    name: "Islamic History",
    nameArabic: "التاريخ الإسلامي",
    nameRussian: "Исламская история",
    icon: "📜",
    color: "amber"
  },
  {
    id: "prophet_stories",
    name: "Prophet Stories",
    nameArabic: "قصص الأنبياء",
    nameRussian: "Истории пророков",
    icon: "👥",
    color: "indigo"
  },
  {
    id: "islamic_knowledge",
    name: "Islamic Knowledge",
    nameArabic: "العلوم الإسلامية",
    nameRussian: "Исламские знания",
    icon: "🧠",
    color: "cyan"
  },
  {
    id: "islamic_education",
    name: "Islamic Education",
    nameArabic: "التربية الإسلامية",
    nameRussian: "Исламское образование",
    icon: "📚",
    color: "teal"
  },
  {
    id: "islamic_reminders",
    name: "Islamic Reminders",
    nameArabic: "تذكير إسلامي",
    nameRussian: "Исламские напоминания",
    icon: "💝",
    color: "red"
  },
  {
    id: "dua_supplications",
    name: "Dua & Supplications",
    nameArabic: "الدعاء والأذكار",
    nameRussian: "Дуа и мольбы",
    icon: "🤲",
    color: "green"
  },
  {
    id: "islamic_guidance",
    name: "Islamic Guidance",
    nameArabic: "الإرشاد الإسلامي",
    nameRussian: "Исламское руководство",
    icon: "🧭",
    color: "slate"
  },
  {
    id: "islamic_youth",
    name: "Islamic Youth",
    nameArabic: "الشباب الإسلامي",
    nameRussian: "Исламская молодежь",
    icon: "👨‍🎓",
    color: "violet"
  },
  {
    id: "islamic_family",
    name: "Islamic Family",
    nameArabic: "الأسرة الإسلامية",
    nameRussian: "Исламская семья",
    icon: "👨‍👩‍👧‍👦",
    color: "rose"
  }
];

export function useVideoData() {
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/video-data?type=videos");

        if (!response.ok) {
          throw new Error(`Failed to fetch video data: ${response.statusText}`);
        }

        const videoData = await response.json();
        setData(videoData);
        setError(null);
      } catch (err) {
        console.error("Error fetching video data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load video data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const searchVideos = (query: string, categoryId?: string) => {
    if (!data) return [];

    let filteredVideos = data.videos;

    // Filter by category
    if (categoryId) {
      filteredVideos = filteredVideos.filter(
        (video) => video.category.id === categoryId,
      );
    }

    // Filter by search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filteredVideos = filteredVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(searchLower) ||
          video.description.toLowerCase().includes(searchLower) ||
          video.channelTitle.toLowerCase().includes(searchLower) ||
          video.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    return filteredVideos;
  };

  const getVideosByCategory = (categoryId: string) => {
    if (!data) return [];
    return data.videos.filter((video) => video.category.id === categoryId);
  };

  const getVideoById = (id: string) => {
    if (!data) return null;
    return data.videos.find((video) => video.id === id) || null;
  };

  return {
    data,
    loading,
    error,
    searchVideos,
    getVideosByCategory,
    getVideoById,
    videos: data?.videos || [],
  };
}
