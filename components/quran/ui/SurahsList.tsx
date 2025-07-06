import React from "react";
import { Surah } from "../types";

interface SurahsListProps {
  surahs: Surah[];
  selectedSurah: number;
  onSurahSelect: (surahNumber: number) => void;
  messages: any;
  loading?: boolean;
}

export const SurahsList: React.FC<SurahsListProps> = ({
  surahs,
  selectedSurah,
  onSurahSelect,
  messages,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-background rounded-lg p-3 sm:p-4 border border-border">
        <h2 className="text-lg sm:text-xl font-bold text-background mb-3 sm:mb-4">
          {messages?.quran?.surahs || "السور"}
        </h2>
        <div className="animate-pulse space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 sm:h-16 bg-surface rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg p-3 sm:p-4 border border-border">
      <h2 className="text-lg sm:text-xl font-bold text-background mb-3 sm:mb-4">
        {messages?.quran?.surahs || "السور"}
      </h2>
      <div className="max-h-64 sm:max-h-96 overflow-y-auto space-y-1 sm:space-y-2">
        {surahs.map((surah) => (
          <button
            key={surah.number}
            onClick={() => onSurahSelect(surah.number)}
            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all duration-200 ${
              selectedSurah === surah.number
                ? "bg-primary text-white"
                : "hover:bg-surface text-background"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">
                  {surah.number}. {surah.englishName}
                </div>
                <div className="text-xs sm:text-sm font-amiri text-muted truncate">
                  {surah.name}
                </div>
              </div>
              <div className="text-xs opacity-75 ml-2 flex-shrink-0">
                {surah.numberOfAyahs}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
