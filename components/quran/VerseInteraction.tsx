"use client";

import { useState, useEffect } from "react";
import {
  BookmarkPlus,
  Play,
  Share2,
  Copy,
  Heart,
  MoreHorizontal,
  Clock,
  Target,
  CheckCircle2,
} from "lucide-react";

interface VerseInteractionProps {
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  translation?: string;
  onPlayAudio: (ayahNumber: number) => void;
  onBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: boolean;
  locale: string;
  messages: any;
}

interface VerseActivity {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  timestamp: Date;
  action: "read" | "listened" | "bookmarked" | "memorized" | "reflected";
  duration?: number; // seconds spent on verse
  notes?: string;
}

export function VerseInteraction({
  surahNumber,
  ayahNumber,
  ayahText,
  translation,
  onPlayAudio,
  onBookmark,
  isBookmarked,
  locale,
  messages,
}: VerseInteractionProps) {
  const [showActions, setShowActions] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isMemorized, setIsMemorized] = useState(false);
  const [verseActivities, setVerseActivities] = useState<VerseActivity[]>([]);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // Load verse activities from localStorage
  useEffect(() => {
    const savedActivities = localStorage.getItem(
      `verse_activities_${surahNumber}_${ayahNumber}`,
    );
    if (savedActivities) {
      const activities = JSON.parse(savedActivities).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
      setVerseActivities(activities);

      // Check if verse is memorized
      const memorizedActivity = activities.find(
        (a: VerseActivity) => a.action === "memorized",
      );
      setIsMemorized(!!memorizedActivity);
    }
  }, [surahNumber, ayahNumber]);



  

  const logVerseActivity = (
    action: VerseActivity["action"],
    duration?: number,
    notes?: string,
  ) => {
    const activity: VerseActivity = {
      id: `${Date.now()}-${action}`,
      surahNumber,
      ayahNumber,
      timestamp: new Date(),
      action,
      duration,
      notes,
    };

    const newActivities = [...verseActivities, activity];
    setVerseActivities(newActivities);
    localStorage.setItem(
      `verse_activities_${surahNumber}_${ayahNumber}`,
      JSON.stringify(newActivities),
    );

    // Update global reading history
    const globalHistory = JSON.parse(
      localStorage.getItem("verse_reading_history") || "[]",
    );
    globalHistory.push(activity);
    localStorage.setItem(
      "verse_reading_history",
      JSON.stringify(globalHistory.slice(-1000)),
    ); // Keep last 1000 activities
  };

  const handlePlayAudio = () => {
    onPlayAudio(ayahNumber);
    logVerseActivity("listened");
  };

  const handleBookmark = () => {
    onBookmark(surahNumber, ayahNumber);
    if (!isBookmarked) {
      logVerseActivity("bookmarked");
    }
  };

  const toggleMemorized = () => {
    setIsMemorized(!isMemorized);
    if (!isMemorized) {
      logVerseActivity("memorized");
    }
  };

  const handleShare = async () => {
    const shareText = `${ayahText}\n\n— Quran ${surahNumber}:${ayahNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quran ${surahNumber}:${ayahNumber}`,
          text: shareText,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // Could show a toast notification here
      } catch (error) {
        console.log("Error copying to clipboard:", error);
      }
    }
  };

  const saveNotes = () => {
    if (notes.trim()) {
      logVerseActivity("reflected", undefined, notes.trim());
      setNotes("");
      setShowNotes(false);
    }
  };

  const getActivitySummary = () => {
    const readCount = verseActivities.filter((a) => a.action === "read").length;
    const listenCount = verseActivities.filter(
      (a) => a.action === "listened",
    ).length;
    const totalReadingTime = verseActivities
      .filter((a) => a.action === "read")
      .reduce((sum, a) => sum + (a.duration || 0), 0);

    return { readCount, listenCount, totalReadingTime };
  };

  const { readCount, listenCount, totalReadingTime } = getActivitySummary();

  return (
    <div
      id={`verse-${surahNumber}-${ayahNumber}`}
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Verse Activity Indicators */}
      <div className="absolute -left-2 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {readCount > 0 && (
          <div
            className="w-2 h-2 bg-blue-500 rounded-full"
            title={`Read ${readCount} times`}
          />
        )}
        {listenCount > 0 && (
          <div
            className="w-2 h-2 bg-green-500 rounded-full"
            title={`Listened ${listenCount} times`}
          />
        )}
        {isMemorized && (
          <div
            className="w-2 h-2 bg-yellow-500 rounded-full"
            title="Memorized"
          />
        )}
        {verseActivities.some((a) => a.action === "reflected") && (
          <div
            className="w-2 h-2 bg-purple-500 rounded-full"
            title="Has reflection notes"
          />
        )}
      </div>

      {/* Quick Action Buttons */}
      {showActions && (
        <div className="absolute right-0 top-0 flex gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-border">
          <button
            onClick={handlePlayAudio}
            className="p-1 hover:bg-primary/10 rounded"
            title="Play Audio"
          >
            <Play className="w-3 h-3" />
          </button>

          <button
            onClick={handleBookmark}
            className={`p-1 rounded ${isBookmarked ? "text-yellow-500" : "hover:bg-primary/10"}`}
            title="Bookmark"
          >
            <BookmarkPlus className="w-3 h-3" />
          </button>

          <button
            onClick={toggleMemorized}
            className={`p-1 rounded ${isMemorized ? "text-green-500" : "hover:bg-primary/10"}`}
            title="Mark as Memorized"
          >
            <CheckCircle2 className="w-3 h-3" />
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-1 hover:bg-primary/10 rounded"
            title="Add Notes"
          >
            <Target className="w-3 h-3" />
          </button>

          <button
            onClick={handleShare}
            className="p-1 hover:bg-primary/10 rounded"
            title="Share"
          >
            <Share2 className="w-3 h-3" />
          </button>
        </div>
      )}

      

      {/* Notes Input */}
      {showNotes && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-border rounded-lg p-3 shadow-lg z-10">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              locale === "ar"
                ? "أضف ملاحظاتك حول هذه الآية..."
                : locale === "en"
                  ? "Add your reflection on this verse..."
                  : "Добавьте свои размышления об этом аяте..."
            }
            className="w-full p-2 border border-border rounded text-sm resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowNotes(false)}
              className="px-3 py-1 text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={saveNotes}
              disabled={!notes.trim()}
              className="px-3 py-1 text-xs bg-primary text-white rounded disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

    
    </div>
  );
}
