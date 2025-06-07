import React from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  Sparkles,
  BookOpen,
  Heart,
  Mic,
  User,
} from "lucide-react";
import { FilterState, ViewMode, Reciter } from "@/types/audio";
import { AUDIO_CATEGORIES, AUDIO_QUALITIES } from "@/constants/audio";
import { getTranslation } from "@/utils/translations";

interface SearchFiltersProps {
  searchTerm: string;
  filters: FilterState;
  viewMode: ViewMode;
  favoriteCount: number;
  reciters?: Reciter[];
  onSearchChange: (term: string) => void;
  onFilterChange: (filters: FilterState) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onClearFilters: () => void;
  locale: string;
  messages: any;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  filters,
  viewMode,
  favoriteCount,
  reciters = [],
  onSearchChange,
  onFilterChange,
  onViewModeChange,
  onClearFilters,
  locale,
  messages,
}) => {
  const hasActiveFilters =
    filters.category !== "all" ||
    filters.quality !== "all" ||
    filters.reciter !== "all" ||
    filters.showFavoritesOnly;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "quran":
        return <BookOpen className="w-4 h-4" />;
      case "dua":
        return <Heart className="w-4 h-4" />;
      case "lecture":
        return <Mic className="w-4 h-4" />;
      case "nasheed":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>{" "}
        <input
          type="text"
          placeholder={getTranslation(
            messages,
            "audio.search.placeholder",
            "Search tracks, reciters, or surahs...",
          )}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-background to-muted/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground text-lg"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {/* Filters and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {" "}
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {getTranslation(messages, "audio.filters.category", "Category")}:
            </span>
            <select
              value={filters.category}
              onChange={(e) =>
                onFilterChange({ ...filters, category: e.target.value as any })
              }
              className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="all">
                {getTranslation(
                  messages,
                  "audio.categories.all",
                  "All Categories",
                )}
              </option>
              {AUDIO_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {getTranslation(
                    messages,
                    `audio.categories.${category.value}`,
                    category.label,
                  )}
                </option>
              ))}
            </select>
          </div>
          {/* Quality Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {getTranslation(messages, "audio.filters.quality", "Quality")}:
            </span>
            <select
              value={filters.quality}
              onChange={(e) =>
                onFilterChange({ ...filters, quality: e.target.value as any })
              }
              className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="all">
                {getTranslation(messages, "audio.quality.all", "All Qualities")}
              </option>
              {AUDIO_QUALITIES.map((quality) => (
                <option key={quality.value} value={quality.value}>
                  {getTranslation(
                    messages,
                    `audio.quality.${quality.value}`,
                    quality.label,
                  )}
                </option>
              ))}
            </select>
          </div>
          {/* Reciter Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {getTranslation(messages, "audio.filters.reciter", "Reciter")}:
            </span>
            <select
              value={filters.reciter}
              onChange={(e) =>
                onFilterChange({ ...filters, reciter: e.target.value as any })
              }
              className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="all">
                {getTranslation(messages, "audio.reciters.all", "All Reciters")}
              </option>
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>
          {/* Favorites Filter */}
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                showFavoritesOnly: !filters.showFavoritesOnly,
              })
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              filters.showFavoritesOnly
                ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            }`}
          >
            {" "}
            <Heart
              className={`w-4 h-4 ${filters.showFavoritesOnly ? "fill-current" : ""}`}
            />
            <span>
              {getTranslation(messages, "common.favorites", "Favorites")}{" "}
              {favoriteCount > 0 && `(${favoriteCount})`}
            </span>
          </button>
          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 text-secondary-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              <X className="w-4 h-4" />
              <span>
                {getTranslation(
                  messages,
                  "audio.filters.clearFilters",
                  "Clear",
                )}
              </span>
            </button>
          )}
        </div>{" "}
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            {getTranslation(messages, "common.view", "View")}:
          </span>
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">
                {getTranslation(messages, "common.grid", "Grid")}
              </span>
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">
                {getTranslation(messages, "common.list", "List")}
              </span>
            </button>
          </div>
        </div>
      </div>{" "}
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {getTranslation(
              messages,
              "audio.filters.activeFilters",
              "Active filters",
            )}
            :
          </span>
          {filters.category !== "all" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {getCategoryIcon(filters.category)}
              <span className="capitalize">
                {getTranslation(
                  messages,
                  `audio.categories.${filters.category}`,
                  filters.category,
                )}
              </span>
            </div>
          )}
          {filters.quality !== "all" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize">
                {getTranslation(
                  messages,
                  `audio.quality.${filters.quality}`,
                  filters.quality,
                )}{" "}
                {getTranslation(messages, "audio.filters.quality", "Quality")}
              </span>
            </div>
          )}
          {filters.reciter !== "all" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium dark:bg-blue-950 dark:text-blue-300">
              <User className="w-3 h-3" />
              <span className="capitalize">
                {getTranslation(
                  messages,
                  `audio.reciters.${filters.reciter}`,
                  filters.reciter,
                )}
              </span>
            </div>
          )}
          {filters.showFavoritesOnly && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium dark:bg-red-950 dark:text-red-300">
              <Heart className="w-3 h-3 fill-current" />
              <span>
                {getTranslation(
                  messages,
                  "common.favoritesOnly",
                  "Favorites Only",
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
