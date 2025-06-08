"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  Headphones,
  Video,
  Calendar,
  Filter,
  Loader2,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { searchService } from "@/services/SearchService";
import { getTranslation } from "@/utils/translations";

interface SearchContext {
  type: "quran" | "audio" | "youtube" | "all";
  icon: React.ComponentType<any>;
  label: string;
  placeholder: string;
  route: string;
}

interface GlobalSearchProps {
  locale: string;
  messages: any;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

const searchContexts: SearchContext[] = [
  {
    type: "all",
    icon: Search,
    label: "All",
    placeholder: "Search everything...",
    route: "/search",
  },
  {
    type: "quran",
    icon: BookOpen,
    label: "Quran",
    placeholder: "Search verses, surahs...",
    route: "/quran",
  },
  {
    type: "audio",
    icon: Headphones,
    label: "Audio",
    placeholder: "Search reciters, tracks...",
    route: "/audio",
  },
  {
    type: "youtube",
    icon: Video,
    label: "Videos",
    placeholder: "Search Islamic videos...",
    route: "/youtube",
  },
];

export function GlobalSearch({
  locale,
  messages,
  isExpanded = false,
  onToggle,
  className = "",
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<SearchContext>(
    searchContexts[0]
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-detect search context based on current route
  useEffect(() => {
    const currentPath = pathname.split("/")[2]; // Remove locale prefix
    const context = searchContexts.find((ctx) =>
      currentPath ? ctx.route.includes(currentPath) : false
    );
    if (context && context.type !== "all") {
      setSelectedContext(context);
    }
  }, [pathname]);

  // Load popular searches and recent searches
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [popular, recent] = await Promise.all([
          searchService.getPopularSearches(),
          loadRecentSearches(),
        ]);
        setPopularSearches(popular);
        setRecentSearches(recent);
      } catch (error) {
        console.error("Failed to load search data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Load recent searches from localStorage
  const loadRecentSearches = (): string[] => {
    try {
      const saved = localStorage.getItem("global_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      10
    );
    setRecentSearches(updated);
    localStorage.setItem("global_recent_searches", JSON.stringify(updated));
  };

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          setIsLoading(true);
          const searchSuggestions = await searchService.getSearchSuggestions(
            searchTerm
          );
          setSuggestions(searchSuggestions);
        } catch (error) {
          console.error("Failed to get suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allItems = [
      ...suggestions,
      ...recentSearches,
      ...popularSearches,
    ].filter((item, index, arr) => arr.indexOf(item) === index);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && allItems[focusedIndex]) {
          handleSearch(allItems[focusedIndex]);
        } else if (searchTerm.trim()) {
          handleSearch(searchTerm);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle search execution
  const handleSearch = async (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    // Save search analytics
    try {
      await searchService.saveSearch(trimmedTerm, 0); // Result count will be updated by the target page
    } catch (error) {
      console.error("Failed to save search:", error);
    }

    // Save to recent searches
    saveRecentSearch(trimmedTerm);

    // Navigate to appropriate page with search query
    const targetRoute = `/${locale}${selectedContext.route}`;
    const searchParams = new URLSearchParams();
    searchParams.set("q", trimmedTerm);

    if (selectedContext.type !== "all") {
      searchParams.set("context", selectedContext.type);
    }

    router.push(`${targetRoute}?${searchParams.toString()}`);

    // Close suggestions and clear search if needed
    setShowSuggestions(false);
    setFocusedIndex(-1);
    
    // Keep search term for mobile or clear for desktop
    if (window.innerWidth < 768) {
      onToggle?.();
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  // Get display items for suggestions dropdown
  const getDisplayItems = () => {
    const items = [];
    
    if (suggestions.length > 0) {
      items.push({
        type: "section",
        title: getTranslation(messages, "search.suggestions", "Suggestions"),
        items: suggestions,
        icon: TrendingUp,
      });
    }

    if (recentSearches.length > 0 && searchTerm.length < 2) {
      items.push({
        type: "section",
        title: getTranslation(messages, "search.recent", "Recent Searches"),
        items: recentSearches.slice(0, 5),
        icon: Clock,
      });
    }

    if (popularSearches.length > 0 && searchTerm.length < 2) {
      items.push({
        type: "section",
        title: getTranslation(messages, "search.popular", "Popular Searches"),
        items: popularSearches.slice(0, 5),
        icon: TrendingUp,
      });
    }

    return items;
  };

  const displayItems = getDisplayItems();
  const hasItems = displayItems.some((section) => section.items.length > 0);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Context Selector (Desktop) */}
        {isExpanded && (
          <div className="hidden md:flex items-center border-r border-border pr-3">
            <select
              value={selectedContext.type}
              onChange={(e) => {
                const context = searchContexts.find(
                  (ctx) => ctx.type === e.target.value
                );
                if (context) setSelectedContext(context);
              }}
              className="bg-transparent text-sm font-medium text-muted-foreground focus:outline-none focus:text-foreground cursor-pointer"
            >
              {searchContexts.map((context) => (
                <option key={context.type} value={context.type}>
                  {getTranslation(
                    messages,
                    `search.context.${context.type}`,
                    context.label
                  )}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={
              getTranslation(
                messages,
                `search.placeholder.${selectedContext.type}`,
                selectedContext.placeholder
              ) || "Search..."
            }
            className={`
              w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200 text-foreground placeholder:text-muted-foreground
              ${isExpanded ? "text-base" : "text-sm"}
            `}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />

          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Mobile Context Selector */}
        {isExpanded && (
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2">
            {searchContexts.map((context) => {
              const Icon = context.icon;
              return (
                <button
                  key={context.type}
                  onClick={() => setSelectedContext(context)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${
                      selectedContext.type === context.type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {getTranslation(
                    messages,
                    `search.context.${context.type}`,
                    context.label
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && isExpanded && (hasItems || searchTerm.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {hasItems ? (
            <div className="py-2">
              {displayItems.map((section, sectionIndex) => {
                if (section.items.length === 0) return null;

                return (
                  <div key={section.type + sectionIndex}>
                    {/* Section Header */}
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <section.icon className="w-3 h-3" />
                      {section.title}
                    </div>

                    {/* Section Items */}
                    {section.items.map((item, itemIndex) => {
                      const globalIndex = displayItems
                        .slice(0, sectionIndex)
                        .reduce((acc, s) => acc + s.items.length, 0) + itemIndex;

                      return (
                        <button
                          key={`${section.type}-${itemIndex}`}
                          onClick={() => handleSearch(item)}
                          className={`
                            w-full px-4 py-2.5 text-left hover:bg-muted transition-colors
                            flex items-center justify-between group
                            ${
                              focusedIndex === globalIndex
                                ? "bg-muted"
                                : ""
                            }
                          `}
                        >
                          <span className="text-foreground truncate">
                            {item}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {getTranslation(
                  messages,
                  "search.noSuggestions",
                  "No suggestions found"
                )}
              </p>
            </div>
          ) : null}

          {/* Search Button for Current Term */}
          {searchTerm.trim() && (
            <>
              <div className="border-t border-border" />
              <button
                onClick={() => handleSearch(searchTerm)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {getTranslation(
                      messages,
                      "search.searchFor",
                      "Search for"
                    )}{" "}
                    "{searchTerm}"
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getTranslation(
                      messages,
                      `search.context.${selectedContext.type}`,
                      selectedContext.label
                    )}
                  </div>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
