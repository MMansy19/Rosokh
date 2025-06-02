"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  totalReadingTime: number;
  totalPagesRead: number;
  completedKhatmas: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  favoriteReadingTime: string;
  weeklyProgress: number[];
  monthlyProgress: number[];
  surahProgress: { [key: number]: number };
}

interface AnalyticsClientProps {
  locale: string;
  messages: any;
}

export default function AnalyticsClient({
  locale,
  messages,
}: AnalyticsClientProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage and calculate analytics
    const calculateAnalytics = () => {
      const sessions = JSON.parse(
        localStorage.getItem("khatma_sessions") || "[]",
      );
      const entries = JSON.parse(
        localStorage.getItem("reading_entries") || "[]",
      );

      const analytics: AnalyticsData = {
        totalReadingTime: entries.reduce(
          (sum: number, entry: any) => sum + entry.duration,
          0,
        ),
        totalPagesRead: entries.reduce(
          (sum: number, entry: any) => sum + entry.pagesRead,
          0,
        ),
        completedKhatmas: sessions.filter((s: any) => s.status === "completed")
          .length,
        currentStreak: calculateCurrentStreak(entries),
        longestStreak: calculateLongestStreak(entries),
        averageSessionTime:
          entries.length > 0
            ? Math.round(
                entries.reduce(
                  (sum: number, entry: any) => sum + entry.duration,
                  0,
                ) / entries.length,
              )
            : 0,
        favoriteReadingTime: getFavoriteReadingTime(entries),
        weeklyProgress: getWeeklyProgress(entries),
        monthlyProgress: getMonthlyProgress(entries),
        surahProgress: getSurahProgress(entries),
      };

      setAnalyticsData(analytics);
      setLoading(false);
    };

    calculateAnalytics();
  }, []);

  const calculateCurrentStreak = (entries: any[]) => {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestStreak = (entries: any[]) => {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i].date);
      const previousDate = new Date(sortedEntries[i - 1].date);

      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  };

  const getFavoriteReadingTime = (entries: any[]) => {
    if (entries.length === 0) return "Morning";

    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    entries.forEach((entry: any) => {
      const hour = new Date(entry.date).getHours();
      if (hour >= 5 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 21) timeSlots.evening++;
      else timeSlots.night++;
    });

    return Object.keys(timeSlots).reduce((a, b) =>
      timeSlots[a as keyof typeof timeSlots] >
      timeSlots[b as keyof typeof timeSlots]
        ? a
        : b,
    );
  };

  const getWeeklyProgress = (entries: any[]) => {
    const weekData = new Array(7).fill(0);
    const today = new Date();

    entries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 7) {
        weekData[6 - diffDays] += entry.pagesRead;
      }
    });

    return weekData;
  };

  const getMonthlyProgress = (entries: any[]) => {
    const monthData = new Array(30).fill(0);
    const today = new Date();

    entries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      const diffTime = today.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 30) {
        monthData[29 - diffDays] += entry.pagesRead;
      }
    });

    return monthData;
  };

  const getSurahProgress = (entries: any[]) => {
    const surahData: { [key: number]: number } = {};

    entries.forEach((entry: any) => {
      for (let surah = entry.surahFrom; surah <= entry.surahTo; surah++) {
        surahData[surah] = (surahData[surah] || 0) + 1;
      }
    });

    return surahData;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const chartData =
    selectedPeriod === "week"
      ? analyticsData?.weeklyProgress || []
      : analyticsData?.monthlyProgress || [];

  const maxValue = Math.max(...chartData, 1);
  if (loading) {
    return (
      <div className="min-h-screen text-foreground transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">
            {messages?.analytics?.loading || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.analytics?.title || "Analytics"}
          </h1>
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {messages?.analytics?.description || "Track your reading progress"}
          </p>
        </div>

        {analyticsData ? (
          <>
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-surface rounded-lg shadow-lg p-6 text-center border border-border">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-2xl font-bold text-foreground">
                  {formatDuration(analyticsData.totalReadingTime)}
                </div>
                <div className="text-muted">
                  {messages?.analytics?.totalReadingTime ||
                    "Total Reading Time"}
                </div>
              </div>

              <div className="bg-surface rounded-lg shadow-lg p-6 text-center border border-border">
                <div className="text-3xl mb-2">📖</div>
                <div className="text-2xl font-bold text-foreground">
                  {analyticsData.totalPagesRead}
                </div>
                <div className="text-muted">
                  {messages?.analytics?.totalPagesRead || "Total Pages Read"}
                </div>
              </div>

              <div className="bg-surface rounded-lg shadow-lg p-6 text-center border border-border">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-foreground">
                  {analyticsData.currentStreak}
                </div>
                <div className="text-muted">
                  {messages?.analytics?.currentStreak || "Current Streak"}
                </div>
              </div>

              <div className="bg-surface rounded-lg shadow-lg p-6 text-center border border-border">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-foreground">
                  {analyticsData.completedKhatmas}
                </div>
                <div className="text-muted">
                  {messages?.analytics?.completedKhatmas || "Completed Khatmas"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Reading Progress Chart */}
              <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-foreground">
                    {messages?.analytics?.readingProgress || "Reading Progress"}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPeriod("week")}
                      className={`text-muted px-3 py-1 rounded text-sm transition-colors duration-200 ${
                        selectedPeriod === "week"
                          ? "bg-primary text-white"
                          : "hover:bg-hoverButton hover:text-foreground"
                      }`}
                    >
                      {messages?.analytics?.week || "Week"}
                    </button>
                    <button
                      onClick={() => setSelectedPeriod("month")}
                      className={`text-muted px-3 py-1 rounded text-sm transition-colors duration-200 ${
                        selectedPeriod === "month"
                          ? "bg-primary text-white"
                          : "hover:bg-hoverButton hover:text-foreground"
                      }`}
                    >
                      {messages?.analytics?.month || "Month"}
                    </button>
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end gap-1 h-48">
                  {chartData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-surface rounded-t flex flex-col justify-end relative group"
                    >
                      <div
                        className="bg-gradient-to-t from-primary to-secondary rounded-t transition-all duration-300"
                        style={{ height: `${(value / maxValue) * 100}%` }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-surface text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-border shadow-lg">
                        {value} {messages?.analytics?.pages || "pages"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>
                    {selectedPeriod === "week"
                      ? messages?.analytics?.["7DaysAgo"] || "7 days ago"
                      : messages?.analytics?.["30DaysAgo"] || "30 days ago"}
                  </span>
                  <span>{messages?.analytics?.today || "Today"}</span>
                </div>
              </div>

              {/* Additional Statistics */}
              <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-6">
                  {messages?.analytics?.additionalStats ||
                    "Additional Statistics"}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">
                      {messages?.analytics?.longestStreak || "Longest Streak"}
                    </span>
                    <span className="font-bold text-foreground">
                      {analyticsData.longestStreak}{" "}
                      {messages?.analytics?.days || "days"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted">
                      {messages?.analytics?.averageSession || "Average Session"}
                    </span>
                    <span className="font-bold text-foreground">
                      {formatDuration(analyticsData.averageSessionTime)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted">
                      {messages?.analytics?.favoriteTime || "Favorite Time"}
                    </span>
                    <span className="font-bold text-foreground capitalize">
                      {messages?.analytics?.[
                        analyticsData.favoriteReadingTime.toLowerCase()
                      ] || analyticsData.favoriteReadingTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Read Surahs */}
            <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">
                {messages?.analytics?.mostReadSurahs || "Most Read Surahs"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analyticsData.surahProgress)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([surah, count]) => (
                    <div
                      key={surah}
                      className="p-4 bg-surfaceChild rounded-lg border border-border"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-foreground">
                            {messages?.analytics?.surah || "Surah"} {surah}
                          </div>
                          <div className="text-sm text-muted">
                            {count}{" "}
                            {messages?.analytics?.sessions || "sessions"}
                          </div>
                        </div>
                        <div className="text-2xl">📖</div>
                      </div>
                    </div>
                  ))}
              </div>

              {Object.keys(analyticsData.surahProgress).length === 0 && (
                <div className="text-center py-8 text-muted">
                  {messages?.analytics?.noSurahData ||
                    "No surah data available yet"}
                </div>
              )}
            </div>

            {/* Motivational Section */}
            <div className="mt-8 p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                {messages?.analytics?.keepGoing || "Keep Going!"}
              </h3>
              <div className="text-4xl font-amiri mb-4">
                وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
              </div>
              <p className="text-lg opacity-90 mb-4">
                "And whoever fears Allah - He will make for him a way out."
              </p>
              <p className="text-sm opacity-75">Quran 65:2</p>

              {analyticsData.currentStreak > 0 && (
                <div className="mt-6 p-4 bg-surfaceChild rounded-lg border border-border">
                  <p className="text-lg">
                    {`You've been reading for ${analyticsData.currentStreak} days straight! Keep it up!`}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {messages?.analytics?.noDataYet || "No Data Yet"}
            </h2>
            <p className="text-muted mb-6">
              {messages?.analytics?.startReading ||
                "Start reading to see your analytics"}
            </p>
            <a
              href="/quran"
              className="inline-block px-8 py-4 bg-primary text-white rounded-lg hover:bg-hoverButton transition-colors duration-200 text-lg"
            >
              {messages?.analytics?.startReadingQuran || "Start Reading Quran"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
