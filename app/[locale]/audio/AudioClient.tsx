"use client";

import { useState, useRef, useEffect } from "react";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Mic,
  Clock,
  Heart,
  Star,
  Search,
} from "lucide-react";

interface AudioTrack {
  id: string;
  title: string;
  arabicTitle?: string;
  reciter: string;
  duration: string;
  url: string;
  category: "quran" | "dua" | "lecture" | "nasheed";
}

interface AudioClientProps {
  locale: string;
  messages: any;
}

export default function AudioClient({ locale, messages }: AudioClientProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isHydrated, setIsHydrated] = useState(false);

  // Generate deterministic waveform heights based on track ID
  const generateWaveformHeights = (trackId: string) => {
    const heights = [];
    for (let i = 0; i < 20; i++) {
      // Use a simple hash function to generate deterministic heights
      const hash = trackId.charCodeAt(0) + i * 37;
      const height = 20 + (hash % 60); // Heights between 20% and 80%
      heights.push(height);
    }
    return heights;
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sample audio tracks - in production, these would come from Google Drive API
  const audioTracks: AudioTrack[] = [
    {
      id: "1",
      title: "Surah Al-Fatiha",
      arabicTitle: "سورة الفاتحة",
      reciter: "Abdul Rahman Al-Sudais",
      duration: "2:30",
      url: "https://server8.mp3quran.net/abd_basit/Almusshaf-Al-Mojawwad/001.mp3",
      category: "quran",
    },
    {
      id: "2",
      title: "Surah Al-Baqarah",
      arabicTitle: "سورة البقرة",
      reciter: "Mishary Al-Afasy",
      duration: "2:30:45",
      url: "https://server8.mp3quran.net/afs/002.mp3",
      category: "quran",
    },
    {
      id: "3",
      title: "Morning Adhkar",
      arabicTitle: "أذكار الصباح",
      reciter: "Saad Al-Ghamdi",
      duration: "15:30",
      url: "#",
      category: "dua",
    },
    {
      id: "4",
      title: "Evening Adhkar",
      arabicTitle: "أذكار المساء",
      reciter: "Saad Al-Ghamdi",
      duration: "12:45",
      url: "#",
      category: "dua",
    },
    {
      id: "5",
      title: "The Life of Prophet Muhammad",
      arabicTitle: "سيرة النبي محمد",
      reciter: "Omar Suleiman",
      duration: "45:20",
      url: "#",
      category: "lecture",
    },
    {
      id: "6",
      title: "Tala al Badru Alayna",
      arabicTitle: "طلع البدر علينا",
      reciter: "Maher Zain",
      duration: "4:15",
      url: "#",
      category: "nasheed",
    },
  ];

  const filteredTracks =
    selectedCategory === "all"
      ? audioTracks
      : audioTracks.filter((track) => track.category === selectedCategory);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack]);

  const playTrack = (track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      audio.src = track.url;
      audio.load();
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.audio?.title || "Islamic Audio Library"}
          </h1>
          <Mic className="mx-auto text-4xl" />
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {messages?.audio?.description ||
              "Listen to Quran recitations, duas, lectures, and nasheeds"}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 bg-surface rounded-lg p-2 shadow-lg border border-border">
            {["all", "quran", "dua", "lecture", "nasheed"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? "bg-primary"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {messages?.audio?.categories?.[category] ||
                  category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Player */}
        {currentTrack && (
          <div className="bg-surface rounded-lg shadow-lg p-6 mb-8 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">
                  {currentTrack.title}
                </h3>
                {currentTrack.arabicTitle && (
                  <p className="text-lg text-muted font-amiri">
                    {currentTrack.arabicTitle}
                  </p>
                )}
                <p className="text-sm text-muted">
                  {messages?.audio?.by || "By"} {currentTrack.reciter}
                </p>
              </div>

              <button
                onClick={() => playTrack(currentTrack)}
                className="w-16 h-16 bg-islamic-500 text-white rounded-full flex items-center justify-center hover:bg-islamic-600 transition-colors duration-200"
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-islamic-200  rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-islamic-600 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <audio ref={audioRef} />
          </div>
        )}

        {/* Audio Tracks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className={`card group rounded-lg shadow-lg p-6 transition-all duration-200 hover:shadow-xl cursor-pointer ${
                currentTrack?.id === track.id ? "ring-2 ring-islamic-500" : ""
              }`}
              onClick={() => playTrack(track)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-islamic-800 mb-1">
                    {track.title}
                  </h3>
                  {track.arabicTitle && (
                    <p className="text-islamic-600 font-amiri mb-2">
                      {track.arabicTitle}
                    </p>
                  )}
                  <p className="text-sm text-islamic-500 mb-1">
                    {track.reciter}
                  </p>
                  <p className="text-xs text-islamic-400">
                    {track.duration}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-islamic-100  rounded-full flex items-center justify-center mb-2">
                    {currentTrack?.id === track.id && isPlaying ? "⏸️" : "▶️"}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      track.category === "quran"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : track.category === "dua"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : track.category === "lecture"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {messages?.audio?.categories?.[track.category] ||
                      track.category}
                  </span>
                </div>
              </div>{" "}
              {/* Waveform placeholder */}
              <div className="flex items-center gap-1 h-8 opacity-30">
                {isHydrated
                  ? generateWaveformHeights(track.id).map((height, i) => (
                      <div
                        key={i}
                        className="bg-islamic-300  rounded-full"
                        style={{
                          width: "2px",
                          height: `${height}%`,
                        }}
                      />
                    ))
                  : // Static placeholder for SSR
                    Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-islamic-300  rounded-full"
                        style={{
                          width: "2px",
                          height: "50%",
                        }}
                      />
                    ))}
              </div>
            </div>
          ))}
        </div>

        {filteredTracks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-islamic-800 mb-4">
              {messages?.audio?.noTracks || "No tracks found"}
            </h2>
            <p className="text-islamic-600">
              {messages?.audio?.tryDifferentCategory ||
                "Try selecting a different category"}
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 card group rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-islamic-800 mb-6 text-center">
            {messages?.audio?.features || "Audio Library Features"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-semibold text-islamic-800 mb-2">
                {messages?.audio?.quranRecitations || "Quran Recitations"}
              </h3>
              <p className="text-sm text-islamic-600">
                {messages?.audio?.quranDesc ||
                  "Beautiful recitations by renowned qaris"}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🤲</div>
              <h3 className="font-semibold text-islamic-800 mb-2">
                {messages?.audio?.duas || "Duas & Adhkar"}
              </h3>
              <p className="text-sm text-islamic-600">
                {messages?.audio?.duasDesc ||
                  "Daily supplications and remembrance"}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-semibold text-islamic-800 mb-2">
                {messages?.audio?.lectures || "Islamic Lectures"}
              </h3>
              <p className="text-sm text-islamic-600">
                {messages?.audio?.lecturesDesc ||
                  "Educational content by scholars"}
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🎵</div>
              <h3 className="font-semibold text-islamic-800 mb-2">
                {messages?.audio?.nasheeds || "Nasheeds"}
              </h3>
              <p className="text-sm text-islamic-600">
                {messages?.audio?.nasheedsDesc ||
                  "Inspiring Islamic songs and chants"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
