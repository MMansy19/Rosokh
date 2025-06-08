"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { 
  Search, 
  BookOpen, 
  Headphones, 
  Video, 
  Filter,
  Grid,
  List,
  Clock,
  TrendingUp,
  X,
  ArrowRight
} from "lucide-react";
import { getTranslation } from "@/utils/translations";

interface SearchClientProps {
  locale: string;
  messages: any;
}

interface SearchResultItem {
  id: string;
  title: string;
  type: "quran" | "audio" | "youtube";
  description?: string;
  url?: string;
  metadata?: any;
}

const contextIcons = {
  quran: BookOpen,
  audio: Headphones,
  youtube: Video,
  all: Search,
};

export default function SearchClient({ locale, messages }: SearchClientProps) {
  const searchParams = useSearchParams();
  const { state, actions } = useSearch();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const query = searchParams.get("q") || "";
  const context = searchParams.get("context") || "all";

  useEffect(() => {
    if (query) {
      actions.setQuery(query);
      actions.setContext(context as any);
      actions.performSearch(query, context);
    }
  }, [query, context]);

  // Transform search results for display
  const transformResults = (): SearchResultItem[] => {
    if (!state.results || state.results.length === 0) return [];

    return state.results.map((item: any) => ({
      id: item.id || item.fileId,
      title: item.title || item.surahName || item.name,
      type: determineItemType(item),
      description: item.description || item.translation || item.reciterName,
      url: item.url || item.audioUrl || item.videoUrl,
      metadata: item,
    }));
  };

  const determineItemType = (item: any): "quran" | "audio" | "youtube" => {
    if (item.surahName || item.verseNumber) return "quran";
    if (item.audioUrl || item.reciterName) return "audio";
    if (item.videoUrl || item.channelName) return "youtube";
    return "audio"; // default
  };

  const displayResults = transformResults();

  const handleFilterChange = (filterKey: string, value: any) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    actions.setFilters(newFilters);
    actions.performSearch(query, context);
  };

  const clearFilters = () => {
    setActiveFilters({});
    actions.setFilters({});
    actions.performSearch(query, context);
  };

  const ContextIcon = contextIcons[context as keyof typeof contextIcons] || Search;
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ContextIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getTranslation(messages, "search.results.title", "Search Results")}
              </h1>
              {query && (
                <p className="text-muted-foreground">
                  {getTranslation(messages, "search.results.for", "Results for")}{" "}
                  <span className="font-medium text-foreground">"{query}"</span>
                  {context !== "all" && (
                    <>
                      {" "}
                      {getTranslation(messages, "search.in", "in")}{" "}
                      <span className="capitalize text-primary">
                        {getTranslation(messages, `search.context.${context}`, context)}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Search Stats */}
          {!state.isLoading && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {state.totalCount} {getTranslation(messages, "search.results.found", "results found")}
              </span>
              {state.searchTime > 0 && (
                <span>
                  ({(state.searchTime / 1000).toFixed(3)}s)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {Object.keys(activeFilters).length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {getTranslation(messages, "search.activeFilters", "Active filters")}:
                </span>
                {Object.entries(activeFilters).map(([key, value]) => (
                  <span
                    key={key}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleFilterChange(key, null)}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {getTranslation(messages, "search.clearAll", "Clear all")}
                </button>
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {getTranslation(messages, "common.view", "View")}:
            </span>
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
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
              <button
                onClick={() => setViewMode("grid")}
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
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          {state.isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {getTranslation(messages, "search.searching", "Searching...")}
              </p>
            </div>
          ) : state.error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {getTranslation(messages, "search.error.title", "Search Error")}
              </h3>
              <p className="text-muted-foreground mb-4">{state.error}</p>
              <button
                onClick={() => actions.performSearch(query, context)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {getTranslation(messages, "search.retry", "Try Again")}
              </button>
            </div>
          ) : displayResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {getTranslation(messages, "search.noResults", "No results found")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {getTranslation(
                  messages,
                  "search.noResultsDesc",
                  "Try different keywords or check your spelling"
                )}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {displayResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  viewMode={viewMode}
                  locale={locale}
                  messages={messages}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More / Pagination could go here */}
      </div>
    </div>
  );
}

// Search Result Card Component
interface SearchResultCardProps {
  result: SearchResultItem;
  viewMode: "grid" | "list";
  locale: string;
  messages: any;
}

function SearchResultCard({ result, viewMode, locale, messages }: SearchResultCardProps) {
  const Icon = contextIcons[result.type];

  const handleResultClick = () => {
    // Navigate to the appropriate page based on result type
    const baseUrl = `/${locale}`;
    let targetUrl = "";

    switch (result.type) {
      case "quran":
        targetUrl = `${baseUrl}/quran?surah=${result.metadata?.surahNumber}&verse=${result.metadata?.verseNumber}`;
        break;
      case "audio":
        targetUrl = `${baseUrl}/audio?track=${result.id}`;
        break;
      case "youtube":
        targetUrl = `${baseUrl}/youtube?video=${result.id}`;
        break;
      default:
        return;
    }

    window.location.href = targetUrl;
  };

  return (
    <div
      className={`
        bg-surface border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group
        ${viewMode === "list" ? "flex items-center gap-4" : ""}
      `}
      onClick={handleResultClick}
    >
      {/* Icon */}
      <div className={`
        bg-primary/10 rounded-lg flex items-center justify-center
        ${viewMode === "list" ? "w-12 h-12 flex-shrink-0" : "w-10 h-10 mb-3"}
      `}>
        <Icon className="w-5 h-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {result.title}
          </h3>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
        </div>

        {result.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {result.description}
          </p>
        )}

        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium capitalize">
            {getTranslation(messages, `search.context.${result.type}`, result.type)}
          </span>
          
          {/* Additional metadata based on type */}
          {result.type === "quran" && result.metadata?.surahNumber && (
            <span className="text-xs text-muted-foreground">
              {getTranslation(messages, "search.surah", "Surah")} {result.metadata.surahNumber}
              {result.metadata.verseNumber && `:${result.metadata.verseNumber}`}
            </span>
          )}
          
          {result.type === "audio" && result.metadata?.reciterName && (
            <span className="text-xs text-muted-foreground">
              {result.metadata.reciterName}
            </span>
          )}
          
          {result.type === "youtube" && result.metadata?.duration && (
            <span className="text-xs text-muted-foreground">
              {result.metadata.duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
