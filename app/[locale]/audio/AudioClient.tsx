"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Mic,
  Heart,
  Search,
  Download,
  List,
  Grid,
  Filter,
} from "lucide-react";

interface AudioTrack {
  id: string;
  title: string;
  arabicTitle?: string;
  reciter: {
    id: string;
    name: string;
    arabicName?: string;
  }
  duration: string;
  url: string;
  category: "quran" | "dua" | "lecture" | "nasheed";
  surah?: number;
  quality: "high" | "medium" | "low";
  size: string;
  isOfflineAvailable?: boolean;
}

interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  biography: string;
  country?: string;
  totalRecitations: number;
  style: string;
  image?: string;
  driveFolder?: string;
  featured?: boolean;
}

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  transliteration: string;
  meaning: string;
  verses: number;
  revelationType: string;
  driveFiles: { [reciter: string]: string };
}

interface AudioData {
  surahs: Surah[];
}

interface ReciterData {
  reciters: Reciter[];
}

interface AudioClientProps {
  locale: string;
  messages: any;
}

export default function AudioClient({ locale, messages }: AudioClientProps) {
  // Removed audioRef since we only use Google Drive preview
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Removed currentTime and duration since we only use Google Drive preview
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedReciter, setSelectedReciter] = useState<string>("all");
  const [selectedQuality, setSelectedQuality] = useState<string>("high");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Data loading states
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Google Drive preview mode state - always enabled
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);


    useEffect(() => {
      const abortController = new AbortController();

      const loadData = async () => {
        setIsDataLoading(true);
        setDataError(null);      try {
        // Use absolute paths to avoid locale prefix issues
        const [audioResponse, recitersResponse] = await Promise.all([
          fetch('/data/audio-tracks.json', { signal: abortController.signal }),
          fetch('/data/reciters.json', { signal: abortController.signal })
        ]);

          if (!audioResponse.ok || !recitersResponse.ok) {
            throw new Error("Failed to load data");
          }

          const [audioData, recitersData] = await Promise.all([
            audioResponse.json(),
            recitersResponse.json()
          ]);
          console.log("Audio Data:", audioData);
          console.log("Reciters Data:", recitersData);
          // Generate tracks
          const generatedTracks: AudioTrack[] = audioData.surahs.flatMap((surah: Surah) =>
            recitersData.reciters
              .filter((reciter: Reciter) => surah.driveFiles?.[reciter.id])
              .map((reciter: Reciter): AudioTrack => ({
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
              }))
          );
          console.log("Generated Tracks:", generatedTracks);

          setSurahs(audioData.surahs);
          setReciters(recitersData.reciters);
          setAudioTracks(generatedTracks);
        } catch (error) {
          if (!abortController.signal.aborted) {
            console.error("Error loading audio data:", error);
            setDataError(error instanceof Error ? error.message : "Failed to load data");
          }
        } finally {
          if (!abortController.signal.aborted) {
            setIsDataLoading(false);
          }
        }
      };

      loadData();

      return () => {
        abortController.abort();
      };
    }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("audio_favorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("audio_favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  // Enhanced filtering
  const filteredTracks = audioTracks.filter((track) => {
    const matchesCategory =
      selectedCategory === "all" || track.category === selectedCategory;
    const matchesReciter =
      selectedReciter === "all" ||
      track.reciter.id.toLowerCase().includes(selectedReciter.toLowerCase());
    const matchesSearch =
      searchTerm === "" ||
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.arabicTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.reciter.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesReciter && matchesSearch;
  });

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  // Google Drive preview functions
  const getGoogleDrivePreviewUrl = (fileId: string) => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const getGoogleDriveDownloadUrl = (fileId: string) => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

  // Removed togglePreviewMode function since we always use Google Drive preview

  const renderGoogleDrivePreview = (track: AudioTrack) => {
    // Only render preview for the current track to enhance performance
    if (!currentTrack || currentTrack.id !== track.id) {
      return null;
    }

    // Use the track ID as Google Drive file ID (already set with real IDs from the JSON data)
    const fileId = track.id;
    const previewUrl = getGoogleDrivePreviewUrl(fileId);
    const downloadUrl = getGoogleDriveDownloadUrl(fileId);
    const isExpanded = expandedPreview === track.id;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Google Drive Preview:
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedPreview(isExpanded ? null : track.id);
              }}
              className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(downloadUrl, "_blank");
              }}
              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>
        <iframe
          src={previewUrl}
          width="100%"
          height={isExpanded ? "400" : "120"}
          allow="autoplay"
          className="border rounded-lg bg-gray-100 dark:bg-gray-800"
          title={`${track.title} - ${track.reciter.name}`}
          loading="lazy"
        />
        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
          <span>🎵 Audio Preview via Google Drive</span>
          <span>•</span>
          <span>{track.size}</span>
          <span>•</span>
          <span>{track.quality} quality</span>
        </div>
      </div>
    );
  };

  // Removed native audio player useEffect since we only use Google Drive preview

  const playTrack = (track: AudioTrack) => {
    // Reset expanded preview when switching tracks for better performance
    setExpandedPreview(null);
    setCurrentTrack(track);
    // No longer using native audio player - only Google Drive preview
    setIsPlaying(true);
    
    // Scroll to current player section smoothly
    setTimeout(() => {
      const currentPlayerElement = document.querySelector('[data-current-player]');
      if (currentPlayerElement) {
        currentPlayerElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  // Removed formatTime and handleSeek functions since we only use Google Drive preview

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.audio?.title || "Islamic Audio Library"}
          </h1>
          <Mic className="mx-auto text-4xl" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {messages?.audio?.description ||
              "Listen to Quran recitations, duas, lectures, and nasheeds"}
          </p>
        </div>

        {/* Loading State */}
        {isDataLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading audio tracks...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {dataError && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-foreground mb-2">Failed to load audio data</p>
              <p className="text-muted-foreground text-sm">{dataError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Only show when data is loaded and no error */}
        {!isDataLoading && !dataError && (
          <>
            {/* Category Filter */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2 bg-background rounded-lg p-2 shadow-lg border border-border">
                {["all", "quran", "dua", "lecture", "nasheed"].map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        selectedCategory === category
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {messages?.audio?.categories?.[category] ||
                        category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Data Summary */}
            <div className="mb-8">
              <div className="bg-background rounded-lg shadow-lg p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Audio Library Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {audioTracks.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Audio Tracks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {reciters.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Reciters
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {surahs.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Surahs Available
                    </div>
                  </div>
                </div>

                {/* Featured Reciters */}
                {reciters.filter((r) => r.featured).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Featured Reciters
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {reciters
                        .filter((r) => r.featured)
                        .map((reciter) => (
                          <div
                            key={reciter.id}
                            className="bg-secondary rounded-lg p-3 text-center"
                          >
                            <div className="font-medium text-foreground">
                              {reciter.name}
                            </div>
                            <div className="text-sm text-muted-foreground font-amiri">
                              {reciter.arabicName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {reciter.style} • {reciter.country}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

         

            {/* Current Player */}
            {currentTrack && (
              <div 
                data-current-player
                className="bg-background rounded-lg shadow-lg p-6 mb-8 border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">
                      {currentTrack.title}
                    </h3>
                    {currentTrack.arabicTitle && (
                      <p className="text-lg text-muted-foreground font-amiri">
                        {currentTrack.arabicTitle}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {messages?.audio?.by || "By"} {currentTrack.reciter.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isExpanded = expandedPreview === currentTrack.id;
                        setExpandedPreview(isExpanded ? null : currentTrack.id);
                      }}
                      className="px-4 py-2 bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors"
                    >
                      {expandedPreview === currentTrack.id ? "Collapse" : "Expand"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const downloadUrl = getGoogleDriveDownloadUrl(currentTrack.id);
                        window.open(downloadUrl, "_blank");
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Google Drive Preview - Always render for current track */}
                {renderGoogleDrivePreview(currentTrack)}
              </div>
            )}

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="bg-background rounded-lg shadow-lg p-6 border border-border">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by title, reciter name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-lg transition-colors ${
                        showFilters
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reciter Filter */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Filter by Reciter
                      </label>
                      <select
                        value={selectedReciter}
                        onChange={(e) => setSelectedReciter(e.target.value)}
                        className="w-full p-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Reciters</option>
                        {reciters.map((reciter) => (
                          <option key={reciter.id} value={reciter.id}>
                            {reciter.name} ({reciter.arabicName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Filter */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Audio Quality
                      </label>
                      <select
                        value={selectedQuality}
                        onChange={(e) => setSelectedQuality(e.target.value)}
                        className="w-full p-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Qualities</option>
                        <option value="high">High Quality</option>
                        <option value="medium">Medium Quality</option>
                        <option value="low">Low Quality</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredTracks.length} of {audioTracks.length} audio
                tracks
                {searchTerm && ` for "${searchTerm}"`}
                {selectedReciter !== "all" &&
                  ` by ${reciters.find((r) => r.id === selectedReciter)?.name}`}
              </div>
            </div>

            {/* Audio Tracks List */}
            <div
              className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}`}
            >
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className={`card group rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer ${
                    currentTrack?.id === track.id ? "ring-2 ring-primary" : ""
                  } ${viewMode === "grid" ? "p-6" : "p-4 flex items-center gap-4"}`}
                  onClick={() => playTrack(track)}
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground mb-1">
                            {track.title}
                          </h3>
                          {track.arabicTitle && (
                            <p className="text-muted-foreground font-amiri mb-2">
                              {track.arabicTitle}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {messages?.audio?.by || "By"} {track.reciter.name}
                          </p>
                          {track.reciter.arabicName && (
                            <p className="text-xs text-muted-foreground font-amiri">
                              {track.reciter.arabicName}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track.id);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              favorites.has(track.id)
                                ? "text-red-500 hover:text-red-600"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${favorites.has(track.id) ? "fill-current" : ""}`}
                            />
                          </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const fileId =
                                  track.url.match(
                                    /\/d\/([a-zA-Z0-9_-]+)/,
                                  )?.[1] || track.id;
                                const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                                window.open(downloadUrl, "_blank");
                              }}
                              className="p-2 rounded-full text-gray-400 hover:text-green-500 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playTrack(track);
                              }}
                              className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                            >
                              {currentTrack?.id === track.id && isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="bg-secondary px-2 py-1 rounded-full text-xs">
                          {track.category.charAt(0).toUpperCase() +
                            track.category.slice(1)}
                        </span>
                        <span>{track.duration}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              track.quality === "high"
                                ? "bg-green-500"
                                : track.quality === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></span>
                          <span className="text-muted-foreground">
                            {track.quality} • {track.size}
                          </span>
                        </div>

                        {track.isOfflineAvailable && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Offline
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View Layout */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-foreground">
                            {track.title}
                          </h3>
                          {track.arabicTitle && (
                            <span className="text-muted-foreground font-amiri text-sm">
                              ({track.arabicTitle})
                            </span>
                          )}
                          <span className="bg-secondary px-2 py-1 rounded-full text-xs">
                            {track.category.charAt(0).toUpperCase() +
                              track.category.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{track.reciter.name}</span>
                          <span>•</span>
                          <span>{track.duration}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                track.quality === "high"
                                  ? "bg-green-500"
                                  : track.quality === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            ></span>
                            {track.quality}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            favorites.has(track.id)
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${favorites.has(track.id) ? "fill-current" : ""}`}
                          />
                        </button>

                        <button
                          onClick={() => playTrack(track)}
                          className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎵</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {messages?.audio?.noTracks || "No tracks found"}
                </h2>
                <p className="text-muted-foreground">
                  {messages?.audio?.tryDifferentCategory ||
                    "Try selecting a different category"}
                </p>
              </div>
            )}

            {/* Features Section */}
            <div className="mt-12 card group rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                {messages?.audio?.features || "Audio Library Features"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">📖</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {messages?.audio?.quranRecitations || "Quran Recitations"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages?.audio?.quranDesc ||
                      "Beautiful recitations by renowned qaris"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-3">🤲</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {messages?.audio?.duas || "Duas & Adhkar"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages?.audio?.duasDesc ||
                      "Daily supplications and remembrance"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-3">🎓</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {messages?.audio?.lectures || "Islamic Lectures"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages?.audio?.lecturesDesc ||
                      "Educational content by scholars"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl mb-3">🎵</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {messages?.audio?.nasheeds || "Nasheeds"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages?.audio?.nasheedsDesc ||
                      "Inspiring Islamic songs and chants"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
