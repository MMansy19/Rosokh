import React, { useMemo, useState, useEffect } from "react";
import QuranReader from "./QuranReader";
import { SurahMap, SURAH_ARRAY } from "./types";

interface QuranMushafProps {
  locale: string;
  messages: any;
}

export const QuranMushaf: React.FC<QuranMushafProps> = ({
  locale,
  messages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Create surah map for easy lookup of surah details by number
  const surahMap: SurahMap = useMemo(
    () =>
      SURAH_ARRAY.reduce((acc, surah) => {
        acc[surah.number.toString()] = surah;
        return acc;
      }, {} as SurahMap),
    [],
  );

  // Function to find which surah(s) are on the current page
  const getCurrentPageSurahs = (page: number) => {
    const surahs = SURAH_ARRAY.filter((surah) => {
      // Find surah that starts on or before this page
      const nextSurah = SURAH_ARRAY.find((s) => s.number === surah.number + 1);
      const surahEndPage = nextSurah ? nextSurah.page - 1 : 604;
      return surah.page <= page && page <= surahEndPage;
    });
    return surahs;
  };

  const currentSurahs = getCurrentPageSurahs(currentPage);

  return (
    <div className="w-full">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          عرض المصحف
        </h2>
        <p className="text-sm sm:text-base text-muted px-4">
          المصحف التفاعلي مع تجربة القراءة صفحة بصفحة
        </p>
      </div>

      {/* Current Surah Information */}
      {currentSurahs.length > 0 && (
        <div className="text-center mb-4 px-4">
          <div className="inline-flex flex-wrap gap-2 justify-center">
            {currentSurahs.map((surah) => (
              <div
                key={surah.number}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
              >
                سورة {surah.name} ({surah.number})
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            الصفحة الحالية: {currentPage}
          </p>
        </div>
      )}

      {/* Integrated QuranReader component with responsive design */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <QuranReader
          locale={locale}
          messages={messages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Optional: Add surah navigation helper */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          إجمالي السور: {SURAH_ARRAY.length} | إجمالي الصفحات: 604
        </p>
      </div>
    </div>
  );
};
