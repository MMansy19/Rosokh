"use client";
import { useState, useEffect } from "react";

interface UseFavoritesReturn {
  favorites: Set<string>;
  toggleFavorite: (trackId: string) => void;
}

/**
 * Custom hook for managing favorite tracks
 */
export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("audio_favorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("audio_favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  return {
    favorites,
    toggleFavorite,
  };
};
