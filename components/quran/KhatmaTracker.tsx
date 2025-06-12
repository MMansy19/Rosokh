"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Star,
  Flame,
  Trophy,
  Gift,
} from "lucide-react";

interface KhatmaProgress {
  id: string;
  startDate: Date;
  targetDate: Date;
  currentPage: number;
  totalPages: number;
  chaptersCompleted: number[];
  versesCompleted: { [chapterId: number]: number[] };
  pagesCompleted: number[];
  dailyGoal: number;
  streak: number;
  longestStreak: number;
  lastReadDate: Date | null;
  totalMinutesRead: number;
  sessionsCount: number;
  achievements: string[];
  weeklyProgress: number[];
  averageSpeed: number; // pages per hour
  favoriteReadingTime: string;
}

interface Chapter {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  pages: number[];
}

interface KhatmaTrackerProps {
  locale: string;
  messages: any;
}

// Sample chapters data (first 10 surahs)
const chapters: Chapter[] = [
  { id: 1, name: "Al-Fatiha", arabicName: "الفاتحة", verses: 7, pages: [1] },
  {
    id: 2,
    name: "Al-Baqarah",
    arabicName: "البقرة",
    verses: 286,
    pages: Array.from({ length: 20 }, (_, i) => i + 2),
  },
  {
    id: 3,
    name: "Aal-E-Imran",
    arabicName: "آل عمران",
    verses: 200,
    pages: Array.from({ length: 15 }, (_, i) => i + 22),
  },
  {
    id: 4,
    name: "An-Nisa",
    arabicName: "النساء",
    verses: 176,
    pages: Array.from({ length: 13 }, (_, i) => i + 37),
  },
  {
    id: 5,
    name: "Al-Ma'idah",
    arabicName: "المائدة",
    verses: 120,
    pages: Array.from({ length: 10 }, (_, i) => i + 50),
  },
  {
    id: 6,
    name: "Al-An'am",
    arabicName: "الأنعام",
    verses: 165,
    pages: Array.from({ length: 12 }, (_, i) => i + 60),
  },
  {
    id: 7,
    name: "Al-A'raf",
    arabicName: "الأعراف",
    verses: 206,
    pages: Array.from({ length: 14 }, (_, i) => i + 72),
  },
  {
    id: 8,
    name: "Al-Anfal",
    arabicName: "الأنفال",
    verses: 75,
    pages: Array.from({ length: 6 }, (_, i) => i + 86),
  },
  {
    id: 9,
    name: "At-Taubah",
    arabicName: "التوبة",
    verses: 129,
    pages: Array.from({ length: 9 }, (_, i) => i + 92),
  },
  {
    id: 10,
    name: "Yunus",
    arabicName: "يونس",
    verses: 109,
    pages: Array.from({ length: 8 }, (_, i) => i + 101),
  },
];

// Achievement definitions
const achievements = {
  first_page: {
    name: "First Steps",
    icon: "👶",
    description: "Read your first page",
  },
  week_streak: {
    name: "Weekly Warrior",
    icon: "🔥",
    description: "7 days reading streak",
  },
  month_streak: {
    name: "Monthly Master",
    icon: "⭐",
    description: "30 days reading streak",
  },
  early_bird: {
    name: "Early Bird",
    icon: "🌅",
    description: "Read before 9 AM",
  },
  night_owl: { name: "Night Owl", icon: "🌙", description: "Read after 9 PM" },
  speed_reader: {
    name: "Speed Reader",
    icon: "⚡",
    description: "Read 20 pages in one day",
  },
  consistent: {
    name: "Consistency King",
    icon: "👑",
    description: "Meet daily goal for 10 days",
  },
  halfway: {
    name: "Halfway Hero",
    icon: "🎯",
    description: "Complete 50% of Quran",
  },
  completion: {
    name: "Khatma Complete",
    icon: "🏆",
    description: "Complete entire Quran",
  },
  dedicated: {
    name: "Dedicated Reader",
    icon: "📚",
    description: "Read for 100 hours total",
  },
  focused: {
    name: "Focused Mind",
    icon: "🧠",
    description: "Complete 5 chapters in one day",
  },
  reflection: {
    name: "Deep Thinker",
    icon: "💭",
    description: "Add reflection notes to 50 verses",
  },
  audio_lover: {
    name: "Audio Enthusiast",
    icon: "",
    description: "Listen to 100 verses",
  },
  bookworm: {
    name: "Verse Collector",
    icon: "🔖",
    description: "Bookmark 100 verses",
  },
};

export function KhatmaTracker({ locale, messages }: KhatmaTrackerProps) {
  const [khatmaProgress, setKhatmaProgress] = useState<KhatmaProgress | null>(
    null,
  );
  const [showNewKhatma, setShowNewKhatma] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAchievements, setShowAchievements] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("khatma_progress");
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      // Convert date strings back to Date objects
      progress.startDate = new Date(progress.startDate);
      progress.targetDate = new Date(progress.targetDate);
      progress.lastReadDate = progress.lastReadDate
        ? new Date(progress.lastReadDate)
        : null;
      setKhatmaProgress(progress);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (khatmaProgress) {
      localStorage.setItem("khatma_progress", JSON.stringify(khatmaProgress));
    }
  }, [khatmaProgress]);

  const startNewKhatma = (targetDays: number) => {
    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(startDate.getDate() + targetDays);
    const newKhatma: KhatmaProgress = {
      id: Date.now().toString(),
      startDate,
      targetDate,
      currentPage: 1,
      totalPages: 604, // Total pages in Mushaf
      chaptersCompleted: [],
      versesCompleted: {},
      pagesCompleted: [],
      dailyGoal: Math.ceil(604 / targetDays),
      streak: 0,
      longestStreak: 0,
      lastReadDate: null,
      totalMinutesRead: 0,
      sessionsCount: 0,
      achievements: [],
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      averageSpeed: 4, // pages per hour default
      favoriteReadingTime: "morning",
    };

    setKhatmaProgress(newKhatma);
    setShowNewKhatma(false);
  };
  const markPageRead = (pageNumber: number) => {
    if (!khatmaProgress) return;

    const today = new Date();
    const isConsecutiveDay =
      khatmaProgress.lastReadDate &&
      Math.abs(today.getTime() - khatmaProgress.lastReadDate.getTime()) <=
        24 * 60 * 60 * 1000;

    const newAchievements = [...khatmaProgress.achievements];

    // Check for new achievements
    if (pageNumber === 1 && !newAchievements.includes("first_page")) {
      newAchievements.push("first_page");
    }

    if (pageNumber >= 302 && !newAchievements.includes("halfway")) {
      newAchievements.push("halfway");
    }

    if (pageNumber >= 604 && !newAchievements.includes("completion")) {
      newAchievements.push("completion");
    }

    const newStreak =
      isConsecutiveDay || !khatmaProgress.lastReadDate
        ? khatmaProgress.streak + 1
        : 1;
    const newLongestStreak = Math.max(newStreak, khatmaProgress.longestStreak);

    if (newStreak >= 7 && !newAchievements.includes("week_streak")) {
      newAchievements.push("week_streak");
    }

    if (newStreak >= 30 && !newAchievements.includes("month_streak")) {
      newAchievements.push("month_streak");
    }

    // Update weekly progress (day of week: 0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    const newWeeklyProgress = [...khatmaProgress.weeklyProgress];
    newWeeklyProgress[dayOfWeek] += 1;

    // Add to pages completed if not already there
    const newPagesCompleted = [...khatmaProgress.pagesCompleted];
    if (!newPagesCompleted.includes(pageNumber)) {
      newPagesCompleted.push(pageNumber);
    }

    // Update reading time detection (simple heuristic based on time of day)
    const hour = today.getHours();
    let timeOfDay = "evening";
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else timeOfDay = "night";

    const updatedProgress = {
      ...khatmaProgress,
      currentPage: Math.max(pageNumber, khatmaProgress.currentPage),
      lastReadDate: today,
      streak: newStreak,
      longestStreak: newLongestStreak,
      totalMinutesRead: khatmaProgress.totalMinutesRead + 15, // Assume 15 minutes per page
      sessionsCount: khatmaProgress.sessionsCount + 1,
      achievements: newAchievements,
      pagesCompleted: newPagesCompleted,
      weeklyProgress: newWeeklyProgress,
      favoriteReadingTime: timeOfDay, // Update based on current reading session
    };

    setKhatmaProgress(updatedProgress);
  };

  const getProgressPercentage = () => {
    if (!khatmaProgress) return 0;
    return Math.round(
      (khatmaProgress.currentPage / khatmaProgress.totalPages) * 100,
    );
  };

  const getDaysRemaining = () => {
    if (!khatmaProgress) return 0;
    const today = new Date();
    const timeDiff = khatmaProgress.targetDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  const getPagesRemaining = () => {
    if (!khatmaProgress) return 604;
    return khatmaProgress.totalPages - khatmaProgress.currentPage;
  };

  const getAveragePages = () => {
    if (!khatmaProgress) return 0;
    const daysElapsed = Math.ceil(
      (new Date().getTime() - khatmaProgress.startDate.getTime()) /
        (1000 * 3600 * 24),
    );
    return daysElapsed > 0
      ? Math.round(khatmaProgress.currentPage / daysElapsed)
      : 0;
  };

  if (!khatmaProgress) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {messages?.khatma?.title || "Khatma Tracker"}
            </h1>
            <div className="text-6xl mb-4">📖</div>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              {messages?.khatma?.description ||
                "Track your journey through the complete Quran"}
            </p>
          </div>

          <div className="bg-surface rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-center mb-6">
              {messages?.khatma?.start_new || "Start Your Khatma Journey"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => startNewKhatma(days)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedDuration === days
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {days}
                    </div>
                    <div className="text-sm text-muted mb-4">
                      {messages?.khatma?.days || "Days"}
                    </div>
                    <div className="text-xs text-muted">
                      {Math.ceil(604 / days)}{" "}
                      {messages?.khatma?.pages_per_day || "pages/day"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowNewKhatma(true)}
                className="text-primary hover:text-primary/80 underline"
              >
                {messages?.khatma?.custom_plan || "Create custom plan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();
  const daysRemaining = getDaysRemaining();
  const pagesRemaining = getPagesRemaining();
  const averagePages = getAveragePages();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {messages?.khatma?.title || "Khatma Tracker"}
          </h1>
          <p className="text-lg text-muted">
            {messages?.khatma?.subtitle || "Your Quran reading journey"}
          </p>
        </div>
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progress Circle */}
          <div className="bg-surface rounded-xl shadow-lg p-6 border border-border text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-secondary"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${progressPercentage * 2.51} 251`}
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {progressPercentage}%
                </span>
              </div>
            </div>
            <p className="text-sm text-muted">
              {messages?.khatma?.completed || "Completed"}
            </p>
          </div>

          {/* Current Page */}
          <div className="bg-surface rounded-xl shadow-lg p-6 border border-border text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {khatmaProgress.currentPage}
            </div>
            <div className="text-sm text-muted mb-1">
              {messages?.khatma?.current_page || "Current Page"}
            </div>
            <div className="text-xs text-muted">
              of {khatmaProgress.totalPages}
            </div>
          </div>

          {/* Days Remaining */}
          <div className="bg-surface rounded-xl shadow-lg p-6 border border-border text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {daysRemaining}
            </div>
            <div className="text-sm text-muted mb-1">
              {messages?.khatma?.days_remaining || "Days Remaining"}
            </div>
            <div className="text-xs text-muted">
              {pagesRemaining} pages left
            </div>
          </div>

          {/* Streak */}
          <div className="bg-surface rounded-xl shadow-lg p-6 border border-border text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2 flex items-center justify-center">
              <Flame className="w-8 h-8 mr-1" />
              {khatmaProgress.streak}
            </div>
            <div className="text-sm text-muted mb-1">
              {messages?.khatma?.day_streak || "Day Streak"}
            </div>
            <div className="text-xs text-muted">
              {averagePages} avg pages/day
            </div>
          </div>
        </div>{" "}
        {/* Actions Row */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            {messages?.khatma?.achievements || "Achievements"} (
            {khatmaProgress.achievements.length})
          </button>

          <button
            onClick={() => {
              setKhatmaProgress(null);
              localStorage.removeItem("khatma_progress");
            }}
            className="px-6 py-3 bg-secondary text-foreground rounded-lg bg-hoverButton hover:text-foreground transition-colors"
          >
            {messages?.khatma?.reset || "Reset Progress"}
          </button>
        </div>
        {/* Statistics Dashboard */}
        <div className="bg-surface rounded-xl shadow-lg p-6 border border-border mb-8">
          <h3 className="text-xl font-bold text-foreground mb-6">
            {messages?.khatma?.statistics || "Reading Statistics"}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {khatmaProgress.streak}
              </div>
              <div className="text-sm text-muted">Current Streak</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {khatmaProgress.longestStreak}
              </div>
              <div className="text-sm text-muted">Longest Streak</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(khatmaProgress.totalMinutesRead / 60)}h
              </div>
              <div className="text-sm text-muted">Total Time</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {khatmaProgress.sessionsCount}
              </div>
              <div className="text-sm text-muted">Sessions</div>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Weekly Reading Pattern</h4>
            <div className="flex gap-2 justify-between">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, index) => (
                  <div key={day} className="flex-1 text-center">
                    <div
                      className="bg-primary/20 rounded mb-1 mx-auto"
                      style={{
                        height: `${Math.max(20, khatmaProgress.weeklyProgress[index] * 4)}px`,
                        width: "20px",
                      }}
                    />
                    <div className="text-xs text-muted">{day}</div>
                    <div className="text-xs font-medium">
                      {khatmaProgress.weeklyProgress[index]}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="text-sm text-muted mb-1">Reading Speed</div>
              <div className="text-lg font-semibold">
                {khatmaProgress.averageSpeed} pages/hour
              </div>
            </div>

            <div className="bg-accent/5 rounded-lg p-4">
              <div className="text-sm text-muted mb-1">Favorite Time</div>
              <div className="text-lg font-semibold capitalize">
                {khatmaProgress.favoriteReadingTime}
              </div>
            </div>

            <div className="bg-secondary/20 rounded-lg p-4">
              <div className="text-sm text-muted mb-1">Pages Completed</div>
              <div className="text-lg font-semibold">
                {khatmaProgress.pagesCompleted.length}
              </div>
            </div>
          </div>
        </div>
        {/* Achievements Modal */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    {messages?.khatma?.achievements || "Achievements"}
                  </h3>
                  <button
                    onClick={() => setShowAchievements(false)}
                    className="text-muted hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(achievements).map(([key, achievement]) => {
                    const isUnlocked =
                      khatmaProgress.achievements.includes(key);
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border transition-all ${
                          isUnlocked
                            ? "border-primary bg-primary/5"
                            : "border-border bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-2xl ${isUnlocked ? "" : "grayscale opacity-50"}`}
                          >
                            {achievement.icon}
                          </div>
                          <div>
                            <div
                              className={`font-semibold ${isUnlocked ? "text-primary" : "text-muted"}`}
                            >
                              {achievement.name}
                            </div>
                            <div className="text-sm text-muted">
                              {achievement.description}
                            </div>
                          </div>
                          {isUnlocked && (
                            <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Quick Page Navigation */}
        <div className="bg-surface rounded-xl shadow-lg p-6 border border-border mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">
            {messages?.khatma?.quick_progress || "Quick Progress Update"}
          </h3>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[...Array(20)].map((_, i) => {
              const pageNum = khatmaProgress.currentPage + i + 1;
              if (pageNum > 604) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => markPageRead(pageNum)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    pageNum <= khatmaProgress.currentPage
                      ? "bg-primary text-white"
                      : "bg-secondary text-foreground bg-hoverButton hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <input
              type="number"
              min="1"
              max="604"
              placeholder="Go to page..."
              className="px-4 py-2 border border-border rounded-lg mr-2 w-32"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const pageNum = parseInt(
                    (e.target as HTMLInputElement).value,
                  );
                  if (pageNum >= 1 && pageNum <= 604) {
                    markPageRead(pageNum);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <span className="text-sm text-muted">
              Press Enter to mark as read
            </span>
          </div>
        </div>
        {/* Chapter Progress */}
        <div className="bg-surface rounded-xl shadow-lg p-6 border border-border">
          <h3 className="text-xl font-bold text-foreground mb-6">
            {messages?.khatma?.chapter_progress || "Chapter Progress"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => {
              const isCompleted = khatmaProgress.chaptersCompleted.includes(
                chapter.id,
              );
              const isInProgress =
                chapter.pages.some(
                  (page) => page <= khatmaProgress.currentPage,
                ) && !isCompleted;

              return (
                <div
                  key={chapter.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? "border-primary bg-primary/5"
                      : isInProgress
                        ? "border-accent bg-accent/5"
                        : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : isInProgress ? (
                      <Circle className="w-6 h-6 text-accent" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted" />
                    )}

                    <div>
                      <div className="font-medium text-foreground">
                        {chapter.id}. {chapter.name}
                      </div>
                      <div className="text-sm font-amiri text-muted">
                        {chapter.arabicName}
                      </div>
                      <div className="text-xs text-muted">
                        {chapter.verses} verses
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
