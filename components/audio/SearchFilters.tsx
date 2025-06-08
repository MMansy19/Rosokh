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
      <div className='relative' dir={locale === "ar" ? "rtl" : "ltr"}>
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
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Filter Controls */}
        <div className="flex flex-col justify-end items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-3">
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
                ? "bg-error text-white border border-error"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${filters.showFavoritesOnly ? "fill-current" : ""}`}
              />
              <span>
                {getTranslation(messages, "audio.stats.favoriteCount", "Favorites")}{" "}
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
          </div>
          {/* Reciter Filter */}
          <div className="flex flex-col items-center gap-2">
            {locale !== "ar" ? (
            <span className="text-sm font-medium text-muted-foreground">
              {getTranslation(messages, "audio.filters.reciter", "Reciter")}:
            </span>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              {reciters.map((reciter) => (
                <button
                  key={reciter.id}
                  onClick={() => onFilterChange({ ...filters, reciter: reciter.id })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    filters.reciter === reciter.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={locale === "ar" ? reciter.arabicName : reciter.name}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      {locale === "ar" ? reciter.arabicName : reciter.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {locale === "ar" ? (
              <span className="text-sm font-medium text-muted-foreground">
                {getTranslation(messages, "audio.filters.reciter", "Reciter")}:
              </span>
            ) : null} 
          </div>
        </div>{" "}
        <div className="flex gap-2 bg-secondary rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-primary text-white" : "text-foreground"}`}
          >
            <Grid className="lg:w-5 lg:h-5 w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-primary text-white" : "text-foreground"}`}
          >
            <List className="lg:w-5 lg:h-5 w-4 h-4" />
          </button>
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
            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary text-white rounded-full text-xs font-medium">
              <User className="w-3 h-3" />
              <span className="capitalize">
                {(() => {
                  const selectedReciter = reciters.find(r => r.id === filters.reciter);
                  return selectedReciter 
                    ? (locale === "ar" ? selectedReciter.arabicName : selectedReciter.name)
                    : filters.reciter;
                })()}
              </span>
            </div>
          )}
          {filters.showFavoritesOnly && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-error text-white border border-error rounded-full text-xs font-medium">
              <Heart className="w-3 h-3 fill-current" />
              <span>
                {getTranslation(
                  messages,
                  "audio.filters.showFavoritesOnly",
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
