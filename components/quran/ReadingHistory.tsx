"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  BookOpen,
  TrendingUp,
  Filter,
  Search,
  BarChart3,
  Activity,
  Target,
  Award,
  ChevronDown,
} from "lucide-react";

interface ReadingSession {
  id: string;
  date: Date;
  surah: number;
  surahName: string;
  surahArabicName: string;
  fromAyah: number;
  toAyah: number;
  duration: number; // in minutes
  pagesRead: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  notes?: string;
  mood?: "focused" | "peaceful" | "reflective" | "inspired" | "distracted";
}

interface ReadingStats {
  totalSessions: number;
  totalMinutes: number;
  totalPages: number;
  averageSessionTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTimeOfDay: string;
  mostReadSurah: string;
  weeklyProgress: number[];
  monthlyProgress: number[];
}

interface ReadingHistoryProps {
  locale: string;
  messages: any;
}

export function ReadingHistory({ locale, messages }: ReadingHistoryProps) {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [filterTimeframe, setFilterTimeframe] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  // New session form state
  const [newSession, setNewSession] = useState({
    surah: 1,
    surahName: "Al-Fatiha",
    surahArabicName: "الفاتحة",
    fromAyah: 1,
    toAyah: 1,
    duration: 15,
    pagesRead: 1,
    timeOfDay: "morning" as const,
    notes: "",
    mood: "peaceful" as const,
  });

  // Sample Surahs data for the form
  const surahs = [
    { number: 1, name: "Al-Fatiha", arabicName: "الفاتحة", verses: 7 },
    { number: 2, name: "Al-Baqarah", arabicName: "البقرة", verses: 286 },
    { number: 3, name: "Aal-E-Imran", arabicName: "آل عمران", verses: 200 },
    { number: 4, name: "An-Nisa", arabicName: "النساء", verses: 176 },
    { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", verses: 120 },
    // Add more as needed
  ];

  // Load reading history from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("reading_history");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        date: new Date(session.date),
      }));
      setSessions(parsedSessions);
      calculateStats(parsedSessions);
    } else {
      // Generate some sample data for demonstration
      generateSampleData();
    }
    setLoading(false);
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("reading_history", JSON.stringify(sessions));
      calculateStats(sessions);
    }
  }, [sessions]);

  const generateSampleData = () => {
    const sampleSessions: ReadingSession[] = [];
    const now = new Date();

    // Generate 30 days of sample reading sessions
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      // Random chance of reading on each day (80% chance)
      if (Math.random() > 0.2) {
        const session: ReadingSession = {
          id: `session_${i}`,
          date,
          surah: Math.floor(Math.random() * 5) + 1,
          surahName: surahs[Math.floor(Math.random() * 5)].name,
          surahArabicName: surahs[Math.floor(Math.random() * 5)].arabicName,
          fromAyah: 1,
          toAyah: Math.floor(Math.random() * 10) + 1,
          duration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
          pagesRead: Math.floor(Math.random() * 5) + 1,
          timeOfDay: ["morning", "afternoon", "evening", "night"][
            Math.floor(Math.random() * 4)
          ] as any,
          mood: ["focused", "peaceful", "reflective", "inspired"][
            Math.floor(Math.random() * 4)
          ] as any,
        };
        sampleSessions.push(session);
      }
    }

    setSessions(sampleSessions);
    calculateStats(sampleSessions);
  };

  const calculateStats = (sessions: ReadingSession[]) => {
    if (sessions.length === 0) {
      setStats({
        totalSessions: 0,
        totalMinutes: 0,
        totalPages: 0,
        averageSessionTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteTimeOfDay: "morning",
        mostReadSurah: "",
        weeklyProgress: [],
        monthlyProgress: [],
      });
      return;
    }

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.duration,
      0,
    );
    const totalPages = sessions.reduce(
      (sum, session) => sum + session.pagesRead,
      0,
    );

    // Calculate streaks
    const sortedSessions = [...sessions].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      const prevSession = sortedSessions[i - 1];

      if (i === 0) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (prevSession.date.getTime() - session.date.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          if (i === 1) currentStreak = 0;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate favorite time of day
    const timeOfDayCounts = sessions.reduce(
      (acc, session) => {
        acc[session.timeOfDay] = (acc[session.timeOfDay] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const favoriteTimeOfDay =
      Object.entries(timeOfDayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "morning";

    // Calculate most read surah
    const surahCounts = sessions.reduce(
      (acc, session) => {
        acc[session.surahName] = (acc[session.surahName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostReadSurah =
      Object.entries(surahCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

    // Calculate weekly and monthly progress
    const weeklyProgress = calculateWeeklyProgress(sessions);
    const monthlyProgress = calculateMonthlyProgress(sessions);

    setStats({
      totalSessions: sessions.length,
      totalMinutes,
      totalPages,
      averageSessionTime: Math.round(totalMinutes / sessions.length),
      currentStreak,
      longestStreak,
      favoriteTimeOfDay,
      mostReadSurah,
      weeklyProgress,
      monthlyProgress,
    });
  };

  const calculateWeeklyProgress = (sessions: ReadingSession[]) => {
    const weeks = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      // Last 12 weeks
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7 - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekSessions = sessions.filter(
        (session) => session.date >= weekStart && session.date <= weekEnd,
      );

      weeks.unshift(
        weekSessions.reduce((sum, session) => sum + session.duration, 0),
      );
    }

    return weeks;
  };

  const calculateMonthlyProgress = (sessions: ReadingSession[]) => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      // Last 6 months
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthSessions = sessions.filter(
        (session) => session.date >= monthStart && session.date <= monthEnd,
      );

      months.unshift(
        monthSessions.reduce((sum, session) => sum + session.duration, 0),
      );
    }

    return months;
  };

  const addSession = () => {
    const session: ReadingSession = {
      id: Date.now().toString(),
      date: new Date(),
      ...newSession,
    };

    setSessions((prev) => [session, ...prev]);
    setShowAddSession(false);

    // Reset form
    setNewSession({
      surah: 1,
      surahName: "Al-Fatiha",
      surahArabicName: "الفاتحة",
      fromAyah: 1,
      toAyah: 1,
      duration: 15,
      pagesRead: 1,
      timeOfDay: "morning",
      notes: "",
      mood: "peaceful",
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.surahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.surahArabicName.includes(searchTerm) ||
      session.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const now = new Date();
    switch (filterTimeframe) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return session.date >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return session.date >= monthAgo;
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return session.date >= yearAgo;
      default:
        return true;
    }
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case "duration":
        return b.duration - a.duration;
      case "pages":
        return b.pagesRead - a.pagesRead;
      case "surah":
        return a.surah - b.surah;
      default:
        return b.date.getTime() - a.date.getTime();
    }
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "focused":
        return "🎯";
      case "peaceful":
        return "☮️";
      case "reflective":
        return "🤔";
      case "inspired":
        return "✨";
      case "distracted":
        return "😵‍💫";
      default:
        return "📖";
    }
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "morning":
        return "🌅";
      case "afternoon":
        return "☀️";
      case "evening":
        return "🌅";
      case "night":
        return "🌙";
      default:
        return "📖";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.history?.title || "Reading History"}
          </h1>
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            {messages?.history?.description ||
              "Track your Quran reading journey and spiritual growth"}
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalSessions}
                  </div>
                  <div className="text-sm text-muted">
                    {messages?.history?.totalSessions || "Total Sessions"}
                  </div>
                </div>
                <BookOpen className="w-8 h-8 text-primary opacity-50" />
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {formatDuration(stats.totalMinutes)}
                  </div>
                  <div className="text-sm text-muted">
                    {messages?.history?.totalTime || "Total Time"}
                  </div>
                </div>
                <Clock className="w-8 h-8 text-accent opacity-50" />
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.currentStreak}
                  </div>
                  <div className="text-sm text-muted">
                    {messages?.history?.currentStreak || "Current Streak"}
                  </div>
                </div>
                <Activity className="w-8 h-8 text-orange-600 opacity-50" />
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {stats.totalPages}
                  </div>
                  <div className="text-sm text-muted">
                    {messages?.history?.totalPages || "Pages Read"}
                  </div>
                </div>
                <Target className="w-8 h-8 text-emerald-600 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Progress Chart */}
            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                {messages?.history?.weeklyProgress || "Weekly Progress"}
              </h3>
              <div className="flex items-end space-x-2 h-32">
                {stats.weeklyProgress.map((minutes, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="bg-primary rounded-t w-full transition-all duration-500"
                      style={{
                        height: `${Math.max((minutes / Math.max(...stats.weeklyProgress)) * 100, 2)}%`,
                      }}
                    ></div>
                    <div className="text-xs text-muted mt-1">W{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Insights */}
            <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                {messages?.history?.insights || "Reading Insights"}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Average Session:</span>
                  <span className="font-medium">
                    {formatDuration(stats.averageSessionTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Favorite Time:</span>
                  <span className="font-medium flex items-center">
                    {getTimeOfDayIcon(stats.favoriteTimeOfDay)}{" "}
                    {stats.favoriteTimeOfDay}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Most Read:</span>
                  <span className="font-medium">{stats.mostReadSurah}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Longest Streak:</span>
                  <span className="font-medium flex items-center">
                    🔥 {stats.longestStreak} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-surface rounded-xl shadow-lg p-6 border border-border mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder={
                    messages?.history?.search || "Search sessions..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Timeframe Filter */}
              <select
                value={filterTimeframe}
                onChange={(e) => setFilterTimeframe(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">
                  {messages?.history?.allTime || "All Time"}
                </option>
                <option value="week">
                  {messages?.history?.thisWeek || "This Week"}
                </option>
                <option value="month">
                  {messages?.history?.thisMonth || "This Month"}
                </option>
                <option value="year">
                  {messages?.history?.thisYear || "This Year"}
                </option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="date">
                  {messages?.history?.sortByDate || "Sort by Date"}
                </option>
                <option value="duration">
                  {messages?.history?.sortByDuration || "Sort by Duration"}
                </option>
                <option value="pages">
                  {messages?.history?.sortByPages || "Sort by Pages"}
                </option>
                <option value="surah">
                  {messages?.history?.sortBySurah || "Sort by Surah"}
                </option>
              </select>
            </div>

            {/* Add Session Button */}
            <button
              onClick={() => setShowAddSession(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {messages?.history?.addSession || "Add Session"}
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-surface rounded-xl shadow-lg border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">
              {messages?.history?.sessions || "Reading Sessions"} (
              {sortedSessions.length})
            </h3>
          </div>

          <div className="divide-y divide-border">
            {sortedSessions.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">
                  {messages?.history?.noSessions || "No reading sessions found"}
                </p>
              </div>
            ) : (
              sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-lg font-medium text-foreground">
                          {session.surah}. {session.surahName}
                        </div>
                        <div className="text-sm font-amiri text-muted">
                          {session.surahArabicName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted">
                          {getTimeOfDayIcon(session.timeOfDay)}
                          {getMoodIcon(session.mood || "")}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted mb-2">
                        <span>
                          Verses {session.fromAyah}-{session.toAyah}
                        </span>
                        <span>{formatDuration(session.duration)}</span>
                        <span>{session.pagesRead} pages</span>
                        <span>{session.date.toLocaleDateString()}</span>
                      </div>

                      {session.notes && (
                        <p className="text-sm text-muted italic">
                          {session.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.duration >= 30
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {session.duration >= 30 ? "Extended" : "Quick"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Session Modal */}
        {showAddSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    {messages?.history?.addNewSession ||
                      "Add New Reading Session"}
                  </h3>
                  <button
                    onClick={() => setShowAddSession(false)}
                    className="text-muted hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.surah || "Surah"}
                    </label>
                    <select
                      value={newSession.surah}
                      onChange={(e) => {
                        const selectedSurah = surahs.find(
                          (s) => s.number === parseInt(e.target.value),
                        );
                        setNewSession((prev) => ({
                          ...prev,
                          surah: parseInt(e.target.value),
                          surahName: selectedSurah?.name || "",
                          surahArabicName: selectedSurah?.arabicName || "",
                        }));
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    >
                      {surahs.map((surah) => (
                        <option key={surah.number} value={surah.number}>
                          {surah.number}. {surah.name} - {surah.arabicName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.duration || "Duration (minutes)"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={newSession.duration}
                      onChange={(e) =>
                        setNewSession((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value),
                        }))
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.fromVerse || "From Verse"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newSession.fromAyah}
                      onChange={(e) =>
                        setNewSession((prev) => ({
                          ...prev,
                          fromAyah: parseInt(e.target.value),
                        }))
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.toVerse || "To Verse"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newSession.toAyah}
                      onChange={(e) =>
                        setNewSession((prev) => ({
                          ...prev,
                          toAyah: parseInt(e.target.value),
                        }))
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.pages || "Pages Read"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newSession.pagesRead}
                      onChange={(e) =>
                        setNewSession((prev) => ({
                          ...prev,
                          pagesRead: parseInt(e.target.value),
                        }))
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.timeOfDay || "Time of Day"}
                    </label>
                    <select
                      value={newSession.timeOfDay}
                      onChange={(e) =>
                        setNewSession((prev) => ({
                          ...prev,
                          timeOfDay: e.target.value as any,
                        }))
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    >
                      <option value="morning">🌅 Morning</option>
                      <option value="afternoon">☀️ Afternoon</option>
                      <option value="evening">🌅 Evening</option>
                      <option value="night">🌙 Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {messages?.history?.mood || "Mood"}
                    </label>
                    <select
                      value={newSession.mood}
                      onChange={(e) =>
                        setNewSession((prev) => ({
                          ...prev,
                          mood: e.target.value as any,
                        }))
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2"
                    >
                      <option value="focused">🎯 Focused</option>
                      <option value="peaceful">☮️ Peaceful</option>
                      <option value="reflective">🤔 Reflective</option>
                      <option value="inspired">✨ Inspired</option>
                      <option value="distracted">😵‍💫 Distracted</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {messages?.history?.notes || "Notes (optional)"}
                  </label>
                  <textarea
                    value={newSession.notes}
                    onChange={(e) =>
                      setNewSession((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder={
                      messages?.history?.notesPlaceholder ||
                      "Any reflections or thoughts..."
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 h-20 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setShowAddSession(false)}
                    className="px-6 py-2 bg-secondary text-foreground rounded-lg bg-hoverButton hover:text-foreground transition-colors"
                  >
                    {messages?.history?.cancel || "Cancel"}
                  </button>
                  <button
                    onClick={addSession}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    {messages?.history?.addSession || "Add Session"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
