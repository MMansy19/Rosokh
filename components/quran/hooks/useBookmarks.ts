import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "../constants";
import { AnalyticsService } from "@/services/AnalyticsService";

export const useBookmarks = () => {
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<string>>(new Set());

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(STORAGE_KEYS.bookmarks);
    if (savedBookmarks) {
      setBookmarkedAyahs(new Set(JSON.parse(savedBookmarks)));

      const analytics = AnalyticsService.getInstance();
      analytics.trackEvent("bookmarks_loaded", "user", {
        count: JSON.parse(savedBookmarks).length,
      });
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify([...bookmarkedAyahs]));
  }, [bookmarkedAyahs]);

  const toggleBookmark = (surahNumber: number, ayahNumber: number, messages: any) => {
    const bookmarkId = `${surahNumber}:${ayahNumber}`;
    const newBookmarks = new Set(bookmarkedAyahs);
    const isBookmarked = newBookmarks.has(bookmarkId);

    const analytics = AnalyticsService.getInstance();

    if (isBookmarked) {
      newBookmarks.delete(bookmarkId);
      analytics.trackEvent("bookmark_removed", "user", {
        surahNumber,
        ayahNumber,
        totalBookmarks: newBookmarks.size,
      });
    } else {
      newBookmarks.add(bookmarkId);
      analytics.trackEvent("bookmark_added", "user", {
        surahNumber,
        ayahNumber,
        totalBookmarks: newBookmarks.size,
      });
    }

    setBookmarkedAyahs(newBookmarks);
    return !isBookmarked; // Return new bookmark state
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarkedAyahs.has(`${surahNumber}:${ayahNumber}`);
  };

  return {
    bookmarkedAyahs,
    toggleBookmark,
    isBookmarked,
  };
};
