import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { AudioTrack, Reciter, Surah } from "@/types/audio";

interface ReciterJSON {
  desc: {
    id: string;
    name: string;
    arabicName: string;
    biography: string;
    country: string;
    totalRecitations: number;
    style: string;
    image: string;
    featured: boolean;
  };
  surahs: { [key: string]: string };
}

interface SurahJSON {
  id: number;
  name: string;
  arabicName: string;
  transliteration: string;
  meaning: string;
  verses: number;
  revelationType: string;
}

/**
 * Generate Google Drive preview URL for audio playback
 */
const getGoogleDriveAudioUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Generate audio tracks from reciters and surahs data
 */
const generateAudioTracks = (
  reciters: ReciterJSON[],
  surahs: SurahJSON[],
): AudioTrack[] => {
  const tracks: AudioTrack[] = [];

  reciters.forEach((reciter) => {
    Object.entries(reciter.surahs).forEach(([surahId, fileId]) => {
      const surah = surahs.find((s) => s.id === parseInt(surahId));
      if (surah && fileId) {
        tracks.push({
          id:fileId,
          title: surah.name,
          arabicTitle: surah.arabicName,
          reciter: {
            id: reciter.desc.id,
            name: reciter.desc.name,
            arabicName: reciter.desc.arabicName,
          },
          duration: "Unknown",
          url: getGoogleDriveAudioUrl(fileId),
          category: "quran",
          surah: surah.id,
          quality: "high",
          size: "Unknown",
          isOfflineAvailable: false,
        });
      }
    });
  });
  return tracks;
};

/**
 * Transform reciter data for the frontend
 */
const transformReciters = (reciters: ReciterJSON[]): Reciter[] => {
  return reciters.map((reciter) => ({
    id: reciter.desc.id,
    name: reciter.desc.name,
    arabicName: reciter.desc.arabicName,
    biography: reciter.desc.biography,
    country: reciter.desc.country,
    totalRecitations: reciter.desc.totalRecitations,
    style: reciter.desc.style,
    image: reciter.desc.image,
    featured: reciter.desc.featured,
  }));
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reciterFilter = searchParams.get("reciter");
    const surahFilter = searchParams.get("surah");

    // Read the JSON files
    const recitersPath = path.join(
      process.cwd(),
      "public",
      "data",
      "reciters.json",
    );
    const surahsPath = path.join(
      process.cwd(),
      "public",
      "data",
      "surahs.json",
    );

    if (!fs.existsSync(recitersPath) || !fs.existsSync(surahsPath)) {
      return NextResponse.json(
        { error: "Data files not found" },
        { status: 404 },
      );
    }

    const recitersData = JSON.parse(fs.readFileSync(recitersPath, "utf8"));
    const surahsData = JSON.parse(fs.readFileSync(surahsPath, "utf8"));

    let reciters: ReciterJSON[] = recitersData.reciters || [];
    const surahs: SurahJSON[] = surahsData.surahs || [];

    // Apply reciter filter if specified
    if (reciterFilter && reciterFilter !== "all") {
      reciters = reciters.filter((r) => r.desc.id === reciterFilter);
    }

    // Generate audio tracks
    let tracks = generateAudioTracks(reciters, surahs);

    // Apply surah filter if specified
    if (surahFilter && surahFilter !== "all") {
      const surahId = parseInt(surahFilter);
      tracks = tracks.filter((track) => track.surah === surahId);
    }

    // Transform reciters for frontend
    const transformedReciters = transformReciters(recitersData.reciters || []);

    return NextResponse.json({
      tracks,
      reciters: transformedReciters,
      total: tracks.length,
    });
  } catch (error) {
    console.error("Error in audio API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
