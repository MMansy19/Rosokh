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
    <div className="space-y-2 sm:space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={getTranslation(
            messages,
            "audio.search.placeholder",
            "Search tracks, reciters, or surahs...",
          )}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-10 py-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 bg-secondary/50 p-4 rounded-lg shadow-sm">
        {/* Top Row: Favorites and Clear Filters + View Toggle */}
        <div className="flex flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Favorites Filter */}
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  showFavoritesOnly: !filters.showFavoritesOnly,
                })
              }
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                filters.showFavoritesOnly
                  ? "bg-error text-white border border-error"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              <Heart
                className={`w-3 h-3 sm:w-4 sm:h-4 ${filters.showFavoritesOnly ? "fill-current" : ""}`}
              />
              <span className="hidden sm:inline">
                {getTranslation(
                  messages,
                  "audio.stats.favoriteCount",
                  "Favorites",
                )}{" "}
                {favoriteCount > 0 && `(${favoriteCount})`}
              </span>
              <span className="sm:hidden">
                {favoriteCount > 0 ? favoriteCount : "♡"}
              </span>
            </button>
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-secondary/50 text-secondary-foreground hover:bg-secondary rounded-lg text-xs sm:text-sm font-medium transition-all duration-200"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {getTranslation(
                    messages,
                    "audio.filters.clearFilters",
                    "Clear",
                  )}
                </span>
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex gap-1 bg-secondary rounded-lg p-1 ml-auto sm:ml-0">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 sm:p-2 rounded transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-foreground"}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 sm:p-2 rounded transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-foreground"}`}
              title="List View"
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        {/* Reciter Filter Section */}
        {reciters.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Reciter Label */}
            {locale !== "ar" ? (
              <div className="flex justify-start">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {getTranslation(messages, "audio.filters.reciter", "Reciter")}
                  :
                </span>
              </div>
            ) : null}

            {/* Reciters Grid - Mobile: Column, Desktop: Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {reciters.map((reciter) => (
                <button
                  key={reciter.id}
                  onClick={() =>
                    onFilterChange({ ...filters, reciter: reciter.id })
                  }
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border border-border hover:bg-hoverButton ${
                    filters.reciter === reciter.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={locale === "ar" ? reciter.arabicName : reciter.name}
                >
                  <div className="flex items-center gap-2 justify-start">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate leading-tight">
                      {locale === "ar" ? reciter.arabicName : reciter.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {locale === "ar" ? (
              <div className="sm:flex hidden justify-end">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {getTranslation(messages, "audio.filters.reciter", "Reciter")}
                  :
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {getTranslation(
              messages,
              "audio.filters.activeFilters",
              "Active filters",
            )}
            :
          </span>
          {filters.category !== "all" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {getCategoryIcon(filters.category)}
              <span className="capitalize truncate">
                {getTranslation(
                  messages,
                  `audio.categories.${filters.category}`,
                  filters.category,
                )}
              </span>
            </div>
          )}
          {filters.quality !== "all" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize truncate">
                {getTranslation(
                  messages,
                  `audio.quality.${filters.quality}`,
                  filters.quality,
                )}
                <span className="hidden sm:inline">
                  {" "}
                  {getTranslation(messages, "audio.filters.quality", "Quality")}
                </span>
              </span>
            </div>
          )}
          {filters.reciter !== "all" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-full text-xs font-medium max-w-[120px] sm:max-w-none">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="capitalize truncate">
                {(() => {
                  const selectedReciter = reciters.find(
                    (r) => r.id === filters.reciter,
                  );
                  return selectedReciter
                    ? locale === "ar"
                      ? selectedReciter.arabicName
                      : selectedReciter.name
                    : filters.reciter;
                })()}
              </span>
            </div>
          )}
          {filters.showFavoritesOnly && (
            <div className="flex items-center gap-1 px-2 py-1 bg-error text-foreground border border-error rounded-full text-xs font-medium">
              <Heart className="w-3 h-3 fill-current flex-shrink-0" />
              <span className="hidden sm:inline">
                {getTranslation(
                  messages,
                  "audio.filters.showFavoritesOnly",
                  "Favorites Only",
                )}
              </span>
              <span className="sm:hidden">Favs</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
