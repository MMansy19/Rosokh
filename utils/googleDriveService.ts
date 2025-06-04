// Google Drive API Service for Rosokh Audio Platform
// This service handles all Google Drive interactions for audio files

export interface GoogleDriveFile {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  downloadUrl: string;
  webViewLink: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  arabicTitle?: string;
  reciter: string;
  reciterArabic?: string;
  duration: string;
  category: "quran" | "dua" | "lecture" | "nasheed";
  surah?: number;
  verses?: string;
  quality: "high" | "medium" | "low";
  size: string;
  isOfflineAvailable?: boolean;
  driveFileId: string;
  downloadUrl?: string;
  streamUrl?: string;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  biography: string;
  country: string;
  totalRecitations: number;
  style: string;
  image?: string;
  driveFolder: string;
  featured: boolean;
}

class GoogleDriveService {
  private apiKey: string;
  private baseUrl: string = "api/audio-data";

  constructor() {
    // In production, store this in environment variables
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || "";
  }

  /**
   * Generate direct download URL from Google Drive file ID
   */
  getDirectDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  /**
   * Generate streaming URL for audio files
   */
  getStreamingUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId: string): Promise<GoogleDriveFile | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/files/${fileId}?key=${this.apiKey}&fields=id,name,size,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fileData = await response.json();

      return {
        id: fileData.id,
        name: fileData.name,
        size: this.formatFileSize(parseInt(fileData.size || "0")),
        mimeType: fileData.mimeType,
        downloadUrl: this.getDirectDownloadUrl(fileData.id),
        webViewLink: fileData.webViewLink,
        thumbnailLink: fileData.thumbnailLink,
        createdTime: fileData.createdTime,
        modifiedTime: fileData.modifiedTime,
      };
    } catch (error) {
      console.error("Error fetching file metadata:", error);
      return null;
    }
  }

  /**
   * List files in a specific Google Drive folder
   */
  async getFolderContents(folderId: string): Promise<GoogleDriveFile[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/files?key=${this.apiKey}&q='${folderId}'+in+parents&fields=files(id,name,size,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime)`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        size: this.formatFileSize(parseInt(file.size || "0")),
        mimeType: file.mimeType,
        downloadUrl: this.getDirectDownloadUrl(file.id),
        webViewLink: file.webViewLink,
        thumbnailLink: file.thumbnailLink,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
      }));
    } catch (error) {
      console.error("Error fetching folder contents:", error);
      return [];
    }
  }

  /**
   * Load audio tracks data from local JSON files and enhance with Google Drive URLs
   */
  async loadAudioTracks(): Promise<AudioTrack[]> {
    try {
      // Load local data
      const [tracksResponse, recitersResponse] = await Promise.all([
        fetch("/data/drive-audios.json"),
        fetch("/data/reciters.json"),
      ]);

      const tracksData = await tracksResponse.json();
      const recitersData = await recitersResponse.json();

      const tracks: AudioTrack[] = [];

      // Process Quran recitations
      if (tracksData.surahs) {
        for (const surah of tracksData.surahs) {
          for (const reciter of recitersData.reciters) {
            if (surah.driveFiles && surah.driveFiles[reciter.id]) {
              const fileId = surah.driveFiles[reciter.id];
              tracks.push({
                id: `${surah.id}-${reciter.id}`,
                title: surah.name,
                arabicTitle: surah.arabicName,
                reciter: reciter.name,
                reciterArabic: reciter.arabicName,
                duration: this.estimateDuration(surah.verses), // Estimate based on verses
                category: "quran",
                surah: surah.id,
                quality: "high",
                size: "0 MB", // Will be updated when metadata is loaded
                driveFileId: fileId,
                downloadUrl: this.getDirectDownloadUrl(fileId),
                streamUrl: this.getStreamingUrl(fileId),
              });
            }
          }
        }
      }

      // Process special recitations
      if (tracksData.specialRecitations) {
        for (const special of tracksData.specialRecitations) {
          for (const reciter of recitersData.reciters) {
            if (special.driveFiles && special.driveFiles[reciter.id]) {
              const fileId = special.driveFiles[reciter.id];
              tracks.push({
                id: `${special.id}-${reciter.id}`,
                title: special.name,
                arabicTitle: special.arabicName,
                reciter: reciter.name,
                reciterArabic: reciter.arabicName,
                duration: "5:00", // Default duration
                category: special.category as "quran",
                verses: special.verses,
                quality: "high",
                size: "0 MB",
                driveFileId: fileId,
                downloadUrl: this.getDirectDownloadUrl(fileId),
                streamUrl: this.getStreamingUrl(fileId),
              });
            }
          }
        }
      }

      // Process duas
      if (tracksData.duas) {
        for (const dua of tracksData.duas) {
          for (const reciterKey in dua.driveFiles) {
            const reciter = recitersData.reciters.find(
              (r: any) => r.id === reciterKey,
            );
            if (reciter) {
              const fileId = dua.driveFiles[reciterKey];
              tracks.push({
                id: `${dua.id}-${reciterKey}`,
                title: dua.name,
                arabicTitle: dua.arabicName,
                reciter: reciter.name,
                reciterArabic: reciter.arabicName,
                duration: dua.duration,
                category: "dua",
                quality: "high",
                size: "0 MB",
                driveFileId: fileId,
                downloadUrl: this.getDirectDownloadUrl(fileId),
                streamUrl: this.getStreamingUrl(fileId),
              });
            }
          }
        }
      }

      // Process lectures
      if (tracksData.lectures) {
        for (const lecture of tracksData.lectures) {
          for (const langKey in lecture.driveFiles) {
            const fileId = lecture.driveFiles[langKey];
            tracks.push({
              id: `${lecture.id}-${langKey}`,
              title: lecture.name,
              arabicTitle: lecture.arabicName,
              reciter: lecture.speaker,
              duration: lecture.duration,
              category: "lecture",
              quality: "high",
              size: "0 MB",
              driveFileId: fileId,
              downloadUrl: this.getDirectDownloadUrl(fileId),
              streamUrl: this.getStreamingUrl(fileId),
            });
          }
        }
      }

      // Process nasheeds
      if (tracksData.nasheeds) {
        for (const nasheed of tracksData.nasheeds) {
          for (const artistKey in nasheed.driveFiles) {
            const fileId = nasheed.driveFiles[artistKey];
            tracks.push({
              id: `${nasheed.id}-${artistKey}`,
              title: nasheed.name,
              arabicTitle: nasheed.arabicName,
              reciter: nasheed.artist,
              duration: nasheed.duration,
              category: "nasheed",
              quality: "high",
              size: "0 MB",
              driveFileId: fileId,
              downloadUrl: this.getDirectDownloadUrl(fileId),
              streamUrl: this.getStreamingUrl(fileId),
            });
          }
        }
      }

      return tracks;
    } catch (error) {
      console.error("Error loading audio tracks:", error);
      return [];
    }
  }

  /**
   * Load reciters data
   */
  async loadReciters(): Promise<Reciter[]> {
    try {
      const response = await fetch("/data/reciters.json");
      const data = await response.json();
      return data.reciters;
    } catch (error) {
      console.error("Error loading reciters:", error);
      return [];
    }
  }

  /**
   * Download audio file with progress tracking
   */
  async downloadAudioFile(
    fileId: string,
    filename: string,
    onProgress?: (progress: number) => void,
  ): Promise<boolean> {
    try {
      const downloadUrl = this.getDirectDownloadUrl(fileId);

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read response body");
      }

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress && total > 0) {
          onProgress((loaded / total) * 100);
        }
      }

      // Create blob and download
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error downloading file:", error);
      return false;
    }
  }

  /**
   * Estimate duration based on number of verses (rough calculation)
   */
  private estimateDuration(verses: number): string {
    // Average: 1 verse = ~10 seconds
    const totalSeconds = verses * 10;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Format file size in human readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Check if file exists and is accessible
   */
  async validateFileAccess(fileId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      return metadata !== null;
    } catch (error) {
      console.error("Error validating file access:", error);
      return false;
    }
  }

  /**
   * Get audio file stream for web player
   */
  getAudioStreamUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
export default GoogleDriveService;
