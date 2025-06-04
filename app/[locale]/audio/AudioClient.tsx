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
  
  // Audio player enhanced state
  const [iframeLoading, setIframeLoading] = useState<boolean>(false);
  const [audioReady, setAudioReady] = useState<boolean>(false);
  const [estimatedDuration, setEstimatedDuration] = useState<string>("Loading...");
  const [audioError, setAudioError] = useState<string | null>(null);


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
      <div className="mt-6 bg-gradient-to-br from-background to-secondary/20 rounded-xl p-6 border border-border shadow-inner relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <pattern id="audioWaves" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 10 Q 5 5 10 10 T 20 10" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#audioWaves)" />
          </svg>
        </div>

        {/* Header with enhanced styling */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🎵</span>
                Audio Player
              </span>
              <span className="text-xs text-muted-foreground">
                Powered by Google Drive
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quality indicator with enhanced styling */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                track.quality === "high" ? "bg-green-500" : 
                track.quality === "medium" ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
              <span className="text-xs font-medium capitalize text-foreground">
                {track.quality} Quality
              </span>
            </div>
            
            {/* Expand/Collapse button with enhanced styling */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedPreview(isExpanded ? null : track.id);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
            >
              <span className="text-sm font-medium">
                {isExpanded ? "Minimize" : "Expand Player"}
              </span>
              <div className={`transform transition-transform duration-200 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </button>
            
            {/* Download button with enhanced styling */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(downloadUrl, "_blank");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
            >
              <Download className="w-4 h-4 group-hover:animate-bounce" />
              <span className="text-sm font-medium">Download</span>
            </button>
          { /* Popup for viewing on Google Drive */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open(track.url, "_blank");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group">
                <span className="text-sm font-medium">View on Google Drive</span>
                <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 16v-4m0-8h4m-8 0H4m16 0h-4m0 8h4m-8 0H4m16 0a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12z" />
                </svg>
              </button>
          </div>
        </div>

        {/* Enhanced iframe container with better styling */}
        <div className="relative mb-4">
          {/* Enhanced background with audio wave pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-xl"></div>
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path 
                d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50" 
                stroke="url(#audioGradient)" 
                strokeWidth="2" 
                fill="none"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
                  <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 0.6}} />
                  <stop offset="100%" style={{stopColor: '#06b6d4', stopOpacity: 0.8}} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            {/* Enhanced Player status bar */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <div className="h-6 w-px bg-gray-600"></div>
                  <span className="text-xs text-gray-300 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Google Drive Audio Player
                  </span>
                </div>
                
                {/* Real-time status indicators */}
                <div className="flex items-center gap-4">
                  {/* Loading status */}
                  {iframeLoading && (
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span>Loading...</span>
                    </div>
                  )}
                  
                  {/* Audio ready status */}
                  {audioReady && !iframeLoading && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Ready to Play</span>
                    </div>
                  )}
                  
                  {/* Error status */}
                  {audioError && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <span>Audio Error</span>
                    </div>
                  )}
                  
                  {/* Duration display */}
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                    <span>{estimatedDuration}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Iframe with enhanced loading overlay */}
            <div className="relative bg-gradient-to-br from-gray-900 to-slate-900">
              {/* Enhanced loading overlay */}
              {iframeLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-slate-900/90 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
                    <div className="text-white text-sm font-medium mb-2">Loading Audio Player</div>
                    <div className="text-gray-400 text-xs">Preparing your audio experience...</div>
                    <div className="mt-3 flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Audio ready overlay (shows briefly when loaded) */}
              {audioReady && !iframeLoading && (
                <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-10 animate-fade-in">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Audio Ready!</span>
                </div>
              )}
              
              <iframe
                src={`${previewUrl}?autoplay=1`}
                width="100%"
                height={isExpanded ? "500" : "180"}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                className={`w-full h-full rounded-lg relative transition-all duration-300 bg-gradient-to-br from-gray-900 to-slate-900 ${iframeLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                title={`${track.title} - ${track.reciter.name}`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
                onLoad={() => {
                  setIframeLoading(false);
                  setTimeout(() => setAudioReady(true), 1000);
                  setAudioError(null);
                  // Estimate duration based on track type
                  const duration = track.category === 'quran' ? '45-75 min' : 
                                 track.category === 'dua' ? '5-15 min' : 
                                 track.category === 'lecture' ? '30-90 min' : '3-8 min';
                  setEstimatedDuration(duration);
                  
                  // Hide ready indicator after 3 seconds
                  setTimeout(() => setAudioReady(false), 4000);
                }}
                onError={() => {
                  setIframeLoading(false);
                  setAudioError('Failed to load audio');
                  setAudioReady(false);
                }}
              />
            
            </div>
            
            {/* Audio Controls Footer */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">●</span>
                    <span>Live Stream</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🎧</span>
                    <span>High Fidelity</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span>Format: MP3</span>
                  <span>•</span>
                  <span>Source: Google Drive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced metadata section with better styling */}
        <div className="space-y-4 relative z-10">
          {/* Track info card with enhanced design */}
          <div className="bg-gradient-to-r from-secondary/30 to-secondary/10 p-4 rounded-lg border border-border/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <span className="text-primary">🎼</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    {track.title}
                  </span>
                  {track.arabicTitle && (
                    <span className="text-xs text-muted-foreground font-amiri block">
                      {track.arabicTitle}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {track.reciter.name}
                </div>
                {track.reciter.arabicName && (
                  <div className="text-xs text-muted-foreground font-amiri">
                    {track.reciter.arabicName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced info cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Duration estimate with enhanced styling */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">⏱</span>
                </div>
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Duration</div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{track.duration || "~45-60 min"}</div>
                </div>
              </div>
            </div>

            {/* File size with enhanced styling */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">📄</span>
                </div>
                <div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Size</div>
                  <div className="text-sm font-bold text-green-700 dark:text-green-300">{track.size || "~50MB"}</div>
                </div>
              </div>
            </div>

            {/* Category with enhanced styling */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400">📚</span>
                </div>
                <div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Category</div>
                  <div className="text-sm font-bold text-purple-700 dark:text-purple-300 capitalize">{track.category}</div>
                </div>
              </div>
            </div>

            {/* Format with enhanced styling */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400">🎵</span>
                </div>
                <div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Format</div>
                  <div className="text-sm font-bold text-orange-700 dark:text-orange-300">MP3/Audio</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced player tips section */}
          {isExpanded && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-500">💡</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span>Player Tips & Controls</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Basic Controls:</h4>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span>Spacebar for play/pause</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span>Click timeline to seek</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span>Volume control available</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audio status indicators */}
          <div className="flex items-center justify-between py-2 px-3 bg-secondary/20 rounded-lg border border-border/20">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Streaming Ready</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>🔊</span>
                High Quality Audio
              </span>
              <span className="flex items-center gap-1">
                <span>☁️</span>
                Cloud Hosted
              </span>
            </div>
          </div>
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
    
    // Reset audio states for new track
    setIframeLoading(true);
    setAudioReady(false);
    setAudioError(null);
    setEstimatedDuration("Loading...");
    
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
