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
  ChevronDown,
} from "lucide-react";
import { searchService } from "@/services/SearchService";
import { getTranslation } from "@/utils/translations";

interface SearchContext {
  type: "quran" | "audio" | "youtube" | "all";
  icon: React.ComponentType<any>;
  labelKey: string;
  placeholderKey: string;
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
    type: "quran",
    icon: BookOpen,
    labelKey: "search.context.quran",
    placeholderKey: "search.placeholder.quran",
    route: "/quran",
  },
  {
    type: "audio",
    icon: Headphones,
    labelKey: "search.context.audio",
    placeholderKey: "search.placeholder.audio",
    route: "/audio",
  },
  {
    type: "youtube",
    icon: Video,
    labelKey: "search.context.youtube",
    placeholderKey: "search.placeholder.youtube",
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
    searchContexts[0],
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contextDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-detect search context based on current route
  useEffect(() => {
    const currentPath = pathname.split("/")[2]; // Remove locale prefix
    const context = searchContexts.find((ctx) =>
      currentPath ? ctx.route.includes(currentPath) : false,
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
      10,
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
          const searchSuggestions =
            await searchService.getSearchSuggestions(searchTerm);
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
          prev < allItems.length - 1 ? prev + 1 : prev,
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
    setIsInputFocused(true);
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay to allow for context selector clicks
    setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
  }; // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }

      if (
        contextDropdownRef.current &&
        !contextDropdownRef.current.contains(event.target as Node)
      ) {
        setIsContextDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        if (!isExpanded && onToggle) {
          onToggle();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, onToggle]);

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
      <div className="relative md:flex md:flex-row gap-2">
        {/* Enhanced Context Selector (Desktop) */}
        {isExpanded && (
          <div
            className={`hidden md:flex items-center ${locale === "ar" ? "border-l border-border pl-4 ml-4" : "border-r border-border pr-4 mr-4"}`}
            ref={contextDropdownRef}
          >
            <div className="relative">
              <button
                onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                className="search-context-button flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                aria-label="Select search context"
              >
                {" "}
                <selectedContext.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {getTranslation(
                    messages,
                    selectedContext.labelKey,
                    selectedContext.type,
                  )}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${isContextDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {/* Dropdown Menu */}
              {isContextDropdownOpen && (
                <div className="search-context-dropdown absolute top-full left-0 mt-2 rounded-lg shadow-lg z-50 min-w-[160px] animate-slideDown">
                  <div className="py-2">
                    {searchContexts.map((context) => {
                      const Icon = context.icon;
                      const isActive = selectedContext.type === context.type;

                      return (
                        <button
                          key={context.type}
                          onClick={() => {
                            setSelectedContext(context);
                            setIsContextDropdownOpen(false);
                          }}
                          className={`
                            search-context-item w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary transition-colors duration-200
                            ${isActive ? "bg-primary/10 text-primary" : "text-foreground"}
                          `}
                        >
                          <Icon
                            className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted"}`}
                          />{" "}
                          <span className="text-sm font-medium">
                            {getTranslation(
                              messages,
                              context.labelKey,
                              context.type,
                            )}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>{" "}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative w-full flex items-center">
          <div className="absolute left-3 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-muted animate-spin transition-all duration-200" />
            ) : (
              <Search
                className={`w-4 h-4 text-muted transition-all duration-200 ${
                  isInputFocused || showSuggestions ? "text-primary" : ""
                }`}
              />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={getTranslation(
              messages,
              selectedContext.placeholderKey,
              "Search...",
            )}
            className={`
              search-input-enhanced w-full pl-10 py-2.5 bg-background border border-border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              text-foreground placeholder:text-muted transition-all duration-200
              ${isExpanded ? "text-base pr-10" : "text-sm pr-20 lg:pr-24"}
              ${isInputFocused || showSuggestions ? "search-input-active" : ""}
            `}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />{" "}
          {/* Keyboard Shortcut Hint */}
          {!isExpanded && (
            <div className="absolute right-3 hidden lg:flex items-center gap-1 text-xs text-muted pointer-events-none">
              <kbd className="px-1.5 py-0.5 bg-muted/20 border border-border rounded text-[10px] font-mono">
                {typeof window !== "undefined" &&
                window.navigator.platform.indexOf("Mac") > -1
                  ? "⌘"
                  : "Ctrl"}
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-muted/20 border border-border rounded text-[10px] font-mono">
                K
              </kbd>
            </div>
          )}{" "}
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className={`absolute p-1 hover:bg-muted rounded-full transition-colors ${
                isExpanded ? "right-3" : "right-16 lg:right-20"
              }`}
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-muted" />
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
                    context-pill flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${
                      selectedContext.type === context.type
                        ? "bg-primary text-white"
                        : "bg-muted text-muted hover:bg-muted/80"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />{" "}
                  {getTranslation(messages, context.labelKey, context.type)}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* Suggestions Dropdown */}
      {showSuggestions &&
        isExpanded &&
        (hasItems || searchTerm.length >= 2) && (
          <div className="search-suggestions absolute top-full left-0 right-0 mt-2 rounded-lg z-50 max-h-96 overflow-hidden animate-slideDown">
            {hasItems ? (
              <div className="py-2">
                {displayItems.map((section, sectionIndex) => {
                  if (section.items.length === 0) return null;

                  return (
                    <div key={section.type + sectionIndex}>
                      {/* Section Header */}
                      <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
                        <section.icon className="w-3 h-3" />
                        {section.title}
                      </div>

                      {/* Section Items */}
                      {section.items.map((item, itemIndex) => {
                        const globalIndex =
                          displayItems
                            .slice(0, sectionIndex)
                            .reduce((acc, s) => acc + s.items.length, 0) +
                          itemIndex;

                        return (
                          <button
                            key={`${section.type}-${itemIndex}`}
                            onClick={() => handleSearch(item)}
                            className={`
                            search-suggestion-item w-full px-4 py-2.5 text-left hover:bg-muted
                            flex items-center justify-between group
                            ${focusedIndex === globalIndex ? "bg-muted" : ""}
                          `}
                          >
                            <span className="text-foreground truncate">
                              {item}
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}{" "}
              </div>
            ) : isLoading && searchTerm.length >= 2 ? (
              <div className="py-4">
                {/* Loading Shimmer */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <div className="search-loading-shimmer w-4 h-4 rounded bg-muted/20"></div>
                    <div className="search-loading-shimmer flex-1 h-4 rounded bg-muted/20"></div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="py-8 text-center text-muted">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {getTranslation(
                    messages,
                    "search.noSuggestions",
                    "No suggestions found",
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
                        "Search for",
                      )}{" "}
                      "{searchTerm}"
                    </div>
                    <div className="text-sm text-muted">
                      {" "}
                      {getTranslation(
                        messages,
                        selectedContext.labelKey,
                        selectedContext.type,
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
