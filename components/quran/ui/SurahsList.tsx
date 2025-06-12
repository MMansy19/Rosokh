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
      <div className="bg-surface rounded-lg shadow-lg p-6 border border-border sticky top-4">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {messages?.quran?.surahs || "Surahs"}
        </h2>
        <div className="animate-pulse space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 border border-border sticky top-4">
      <h2 className="text-xl font-bold text-foreground mb-4">
        {messages?.quran?.surahs || "Surahs"}
      </h2>
      <div className="max-h-96 overflow-y-auto">
        {surahs.map((surah) => (
          <button
            key={surah.number}
            onClick={() => onSurahSelect(surah.number)}
            className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
              selectedSurah === surah.number
                ? "bg-primary text-white"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {surah.number}. {surah.englishName}
                </div>
                <div className="text-sm font-amiri">{surah.name}</div>
              </div>
              <div className="text-xs opacity-75">
                {surah.numberOfAyahs} {messages?.quran?.verses || "verses"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
