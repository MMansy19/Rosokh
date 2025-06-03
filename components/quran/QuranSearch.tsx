"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, X } from "lucide-react";

interface SearchResult {
  id: string;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
  relevanceScore: number;
}

interface QuranSearchProps {
  locale: string;
  messages: any;
}

export default function QuranSearch({ locale, messages }: QuranSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"text" | "surah" | "verse">("text");
  const [selectedTranslation, setSelectedTranslation] = useState("en.sahih");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("quran_recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("quran_recent_searches", JSON.stringify(updated));
  };

  // Translation options based on locale
  const getTranslationOptions = () => {
    switch (locale) {
      case "ar":
        return [
          { value: "ar.muyassar", label: "التفسير الميسر" },
          { value: "ar.jalalayn", label: "تفسير الجلالين" },
        ];
      case "ru":
        return [
          { value: "ru.osmanov", label: "Османов" },
          { value: "ru.sablukov", label: "Саблуков" },
        ];
      default:
        return [
          { value: "en.sahih", label: "Sahih International" },
          { value: "en.pickthall", label: "Pickthall" },
          { value: "en.yusufali", label: "Yusuf Ali" },
        ];
    }
  };

  // Sample search function - in production this would call the Quran API
  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock search results - in production, this would be an API call
      const mockResults: SearchResult[] = [
        {
          id: "2:255",
          surahNumber: 2,
          surahName: "Al-Baqarah",
          surahNameArabic: "البقرة",
          verseNumber: 255,
          arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
          translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
          relevanceScore: 95
        },
        {
          id: "1:1",
          surahNumber: 1,
          surahName: "Al-Fatiha",
          surahNameArabic: "الفاتحة",
          verseNumber: 1,
          arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          relevanceScore: 90
        },
        {
          id: "3:18",
          surahNumber: 3,
          surahName: "Ali 'Imran",
          surahNameArabic: "آل عمران",
          verseNumber: 18,
          arabicText: "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ",
          translation: "Allah witnesses that there is no deity except Him, and [so do] the angels and those of knowledge",
          relevanceScore: 85
        }
      ];

      // Filter results based on search term
      const filtered = mockResults.filter(result => 
        result.arabicText.includes(term) ||
        result.translation.toLowerCase().includes(term.toLowerCase()) ||
        result.surahName.toLowerCase().includes(term.toLowerCase()) ||
        result.surahNameArabic.includes(term)
      );

      setSearchResults(filtered);
      saveRecentSearch(term);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTranslation]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("quran_recent_searches");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {messages?.search?.title || "Quran Search"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {messages?.search?.subtitle || "Search through the Holy Quran by text, surah, or verse"}
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            {/* Search Type Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: "text", label: messages?.search?.searchText || "Search Text", icon: "🔍" },
                { key: "surah", label: messages?.search?.searchSurah || "Search Surah", icon: "📖" },
                { key: "verse", label: messages?.search?.searchVerse || "Search Verse", icon: "🎯" }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setSearchType(key as typeof searchType)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    searchType === key
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/70 text-foreground"
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  searchType === "text" 
                    ? messages?.search?.placeholderText || "Search for verses, keywords, or concepts..."
                    : searchType === "surah"
                    ? messages?.search?.placeholderSurah || "Enter surah name or number..."
                    : messages?.search?.placeholderVerse || "Enter verse reference (e.g., 2:255)..."
                }
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-foreground placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Translation Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {messages?.search?.translation || "Translation"}
              </label>
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-foreground"
              >
                {getTranslationOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchTerm && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {messages?.search?.recentSearches || "Recent Searches"}
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {messages?.search?.clearAll || "Clear All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchTerm(term)}
                      className="px-3 py-1 bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/70 rounded-full text-sm text-foreground transition-colors duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {messages?.search?.searching || "Searching..."}
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-lg text-foreground">
                  {messages?.search?.resultsFound?.replace("{count}", searchResults.length.toString()) || 
                   `Found ${searchResults.length} results for "${searchTerm}"`}
                </p>
              </div>
              
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {result.surahName} ({result.surahNameArabic}) - {messages?.search?.verse || "Verse"} {result.verseNumber}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{messages?.search?.surah || "Surah"} {result.surahNumber}:{result.verseNumber}</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                          {result.relevanceScore}% {messages?.search?.match || "match"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                    <p className="text-xl leading-relaxed text-right font-arabic text-foreground" dir="rtl">
                      {result.arabicText}
                    </p>
                  </div>

                  {/* Translation */}
                  <div className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-foreground leading-relaxed">
                      {result.translation}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors duration-200">
                      {messages?.search?.readMore || "Read More"}
                    </button>
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors duration-200">
                      {messages?.search?.playAudio || "Play Audio"}
                    </button>
                    <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors duration-200">
                      {messages?.search?.bookmark || "Bookmark"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {messages?.search?.noResults || "No results found"}
              </h3>
              <p className="text-muted-foreground">
                {messages?.search?.noResultsDesc || `Try different keywords or check your spelling`}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {messages?.search?.startSearching || "Start Searching"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {messages?.search?.startSearchingDesc || "Enter your search term above to find verses, surahs, or specific concepts in the Quran"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
