import {
  AudioTrack,
  Reciter,
  Surah,
  AudioData,
  ReciterData,
} from "@/types/audio";
import { DURATION_ESTIMATES } from "../constants/audio";

/**
 * Get Google Drive preview URL for a file
 */
export const getGoogleDrivePreviewUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Get Google Drive download URL for a file
 */
export const getGoogleDriveDownloadUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Generate audio tracks from surahs and reciters data
 */
export const generateAudioTracks = (
  audioData: AudioData,
  recitersData: ReciterData,
): AudioTrack[] => {
  return audioData.surahs.flatMap((surah: Surah) =>
    recitersData.reciters
      .filter((reciter: Reciter) => surah.driveFiles?.[reciter.id])
      .map(
        (reciter: Reciter): AudioTrack => ({
          id: surah.driveFiles[reciter.id],
          title: surah.name,
          arabicTitle: surah.arabicName,
          reciter: {
            id: reciter.id,
            name: reciter.name,
            arabicName: reciter.arabicName,
          },
          duration: "Unknown",
          url: `https://drive.google.com/file/d/${surah.driveFiles[reciter.id]}/view`,
          category: "quran" as const,
          surah: surah.id,
          quality: "high" as const,
          size: "Unknown",
          isOfflineAvailable: false,
        }),
      ),
  );
};

/**
 * Filter audio tracks based on search criteria
 */
export const filterTracks = (
  tracks: AudioTrack[],
  searchTerm: string,
  filters: {
    category: string;
    quality: string;
    showFavoritesOnly: boolean;
  },
  favorites: string[],
): AudioTrack[] => {
  const { category, quality, showFavoritesOnly } = filters;

  return tracks.filter((track) => {
    const matchesCategory = category === "all" || track.category === category;
    const matchesQuality = quality === "all" || track.quality === quality;
    const matchesSearch =
      searchTerm === "" ||
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.arabicTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.reciter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || favorites.includes(track.id);

    return (
      matchesCategory && matchesQuality && matchesSearch && matchesFavorites
    );
  });
};

/**
 * Get estimated duration based on track category
 */
export const getEstimatedDuration = (category: string): string => {
  return (
    DURATION_ESTIMATES[category as keyof typeof DURATION_ESTIMATES] || "Unknown"
  );
};

/**
 * Show notification message
 */
export const showNotification = (
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
): void => {
  const notification = document.createElement("div");
  const colors = {
    info: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600",
  };

  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm`;
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
};

/**
 * Scroll to element smoothly
 */
export const scrollToElement = (
  selector: string,
  delay: number = 100,
): void => {
  setTimeout(() => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, delay);
};
