import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Mock search implementation using local data files
export async function POST(request: NextRequest) {
  try {
    const {
      query,
      filters = {},
      pagination = { page: 1, limit: 20 },
    } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        tracks: [],
        totalCount: 0,
        facets: { categories: [], reciters: [], languages: [], durations: [] },
        suggestions: [],
        searchTime: 0,
      });
    }

    // Load data files
    const [audioData, surahsData, youtubeData] = await Promise.all([
      loadDataFile("audio-categories.json"),
      loadDataFile("surahs.json"),
      loadDataFile("youtube-videos.json"),
    ]);

    const searchResults = [];
    const searchQuery = query.toLowerCase();

    // Search in Quran data
    if (
      !filters.type ||
      filters.type === "quran" ||
      filters.category === "quran"
    ) {
      const quranResults = searchInQuran(surahsData, searchQuery);
      searchResults.push(...quranResults);
    }

    // Search in audio data
    if (!filters.type || filters.type === "audio") {
      const audioResults = searchInAudio(audioData, searchQuery, filters);
      searchResults.push(...audioResults);
    }

    // Search in YouTube data
    if (
      !filters.type ||
      filters.type === "video" ||
      filters.source === "youtube"
    ) {
      const youtubeResults = searchInYoutube(youtubeData, searchQuery);
      searchResults.push(...youtubeResults);
    }

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedResults = searchResults.slice(
      startIndex,
      startIndex + pagination.limit,
    );

    // Generate facets
    const facets = generateFacets(searchResults);

    // Generate suggestions
    const suggestions = generateSuggestions(searchQuery, searchResults);

    return NextResponse.json({
      tracks: paginatedResults,
      totalCount: searchResults.length,
      facets,
      suggestions,
      searchTime: 0, // Will be calculated by the service
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function loadDataFile(filename: string) {
  try {
    const filePath = path.join(process.cwd(), "public", "data", filename);
    const fileContent = await readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn(`Failed to load ${filename}:`, error);
    return null;
  }
}

function searchInQuran(surahsData: any, query: string) {
  if (!surahsData) return [];

  const results = [];
  const surahs = surahsData.surahs || surahsData;

  for (const surah of surahs) {
    const matchesName =
      surah.englishName?.toLowerCase().includes(query) ||
      surah.arabicName?.toLowerCase().includes(query) ||
      surah.name?.toLowerCase().includes(query);

    if (matchesName) {
      results.push({
        id: `quran-${surah.number}`,
        title: surah.englishName || surah.name,
        arabicTitle: surah.arabicName,
        type: "quran",
        category: "quran",
        description: `Surah ${surah.number} - ${surah.numberOfAyahs} verses`,
        metadata: {
          surahNumber: surah.number,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType,
        },
        url: `/quran?surah=${surah.number}`,
      });
    }
  }

  return results;
}

function searchInAudio(audioData: any, query: string, filters: any) {
  if (!audioData) return [];

  const results = [];

  // Search through audio categories
  for (const [categoryName, categoryData] of Object.entries(audioData)) {
    if (typeof categoryData !== "object" || !categoryData) continue;

    const tracks = (categoryData as any).tracks || [];

    for (const track of tracks) {
      const matchesQuery =
        track.title?.toLowerCase().includes(query) ||
        track.arabicTitle?.toLowerCase().includes(query) ||
        track.reciter?.toLowerCase().includes(query) ||
        track.description?.toLowerCase().includes(query);

      const matchesFilters = applyAudioFilters(track, filters);

      if (matchesQuery && matchesFilters) {
        results.push({
          id: track.id || `audio-${Math.random()}`,
          title: track.title,
          arabicTitle: track.arabicTitle,
          type: "audio",
          category: categoryName,
          description: track.description,
          reciterName: track.reciter,
          duration: track.duration,
          audioUrl: track.url,
          metadata: {
            reciter: track.reciter,
            category: categoryName,
            duration: track.duration,
            quality: track.quality || "high",
          },
          url: `/audio?track=${track.id}`,
        });
      }
    }
  }

  return results;
}

function searchInYoutube(youtubeData: any, query: string) {
  if (!youtubeData || !youtubeData.videos) return [];

  const results = [];

  for (const video of youtubeData.videos) {
    const matchesQuery =
      video.title?.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query) ||
      video.channelTitle?.toLowerCase().includes(query);

    if (matchesQuery) {
      results.push({
        id: video.id,
        title: video.title,
        type: "youtube",
        category: "video",
        description: video.description,
        channelName: video.channelTitle,
        duration: video.duration,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.thumbnail,
        metadata: {
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          duration: video.duration,
          viewCount: video.viewCount,
        },
        url: `/youtube?video=${video.id}`,
      });
    }
  }

  return results;
}

function applyAudioFilters(track: any, filters: any): boolean {
  if (filters.reciter && track.reciter !== filters.reciter) {
    return false;
  }

  if (filters.quality && track.quality !== filters.quality) {
    return false;
  }

  if (filters.duration) {
    const trackDuration = parseDuration(track.duration);
    if (filters.duration.min && trackDuration < filters.duration.min) {
      return false;
    }
    if (filters.duration.max && trackDuration > filters.duration.max) {
      return false;
    }
  }

  return true;
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // minutes:seconds
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hours:minutes:seconds
  }
  return 0;
}

function generateFacets(results: any[]) {
  const categories = new Map<string, number>();
  const reciters = new Map<string, number>();
  const languages = new Map<string, number>();
  const durations = new Map<string, number>();

  for (const result of results) {
    // Categories
    if (result.category) {
      categories.set(
        result.category,
        (categories.get(result.category) || 0) + 1,
      );
    }

    // Reciters
    if (result.reciterName) {
      reciters.set(
        result.reciterName,
        (reciters.get(result.reciterName) || 0) + 1,
      );
    }

    // Duration ranges
    if (result.duration) {
      const durationMinutes = parseDuration(result.duration) / 60;
      let durationRange = "0-5 min";
      if (durationMinutes > 5) durationRange = "5-15 min";
      if (durationMinutes > 15) durationRange = "15-30 min";
      if (durationMinutes > 30) durationRange = "30+ min";

      durations.set(durationRange, (durations.get(durationRange) || 0) + 1);
    }
  }

  return {
    categories: Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    reciters: Array.from(reciters.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    languages: Array.from(languages.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    durations: Array.from(durations.entries()).map(([range, count]) => ({
      range,
      count,
    })),
  };
}

function generateSuggestions(query: string, results: any[]): string[] {
  const suggestions = new Set<string>();

  // Add suggestions based on matching results
  for (const result of results.slice(0, 5)) {
    if (result.title && !result.title.toLowerCase().includes(query)) {
      suggestions.add(result.title);
    }
    if (
      result.reciterName &&
      !result.reciterName.toLowerCase().includes(query)
    ) {
      suggestions.add(result.reciterName);
    }
  }

  // Add common search suggestions
  const commonSuggestions = [
    "Quran recitation",
    "Islamic lectures",
    "Nasheed",
    "Duas",
    "Tafsir",
    "Hadith",
  ];

  for (const suggestion of commonSuggestions) {
    if (suggestion.toLowerCase().includes(query)) {
      suggestions.add(suggestion);
    }
  }

  return Array.from(suggestions).slice(0, 10);
}
