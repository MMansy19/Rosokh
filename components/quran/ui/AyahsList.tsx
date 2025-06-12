import React from "react";
import { Ayah, Translation, Surah } from "../types";
import { SurahHeader } from "./SurahHeader";
import { AyahItem } from "./AyahItem";

interface AyahsListProps {
  ayahs: Ayah[];
  translations: Translation[];
  currentSurah?: Surah;
  selectedSurah: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  fontSize: number;
  bookmarkedAyahs: Set<string>;
  currentPlayingAyah: number | null;
  onPlayAudio: (ayahNumber: number) => void;
  onBookmark: (surahNumber: number, ayahNumber: number) => void;
  onShare: (surah: number, ayah: number, text: string) => void;
  locale: string;
  messages: any;
  loading?: boolean;
}

export const AyahsList: React.FC<AyahsListProps> = ({
  ayahs,
  translations,
  currentSurah,
  selectedSurah,
  showTranslation,
  showTransliteration,
  fontSize,
  bookmarkedAyahs,
  currentPlayingAyah,
  onPlayAudio,
  onBookmark,
  onShare,
  locale,
  messages,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted">{messages?.quran?.loading || "Loading..."}</p>
      </div>
    );
  }

  return (
    <>
      {/* Surah Header */}
      {currentSurah && (
        <SurahHeader surah={currentSurah} messages={messages} />
      )}{" "}
      {/* Ayahs */}
      <div className="space-y-6">
        {ayahs.map((ayah, index) => {
          const isBookmarked = bookmarkedAyahs.has(
            `${selectedSurah}:${ayah.numberInSurah}`,
          );
          const translation = translations[index];
          const isCurrentlyPlaying = currentPlayingAyah === ayah.numberInSurah;
          const withoutBismillah = selectedSurah !== 1 && selectedSurah !== 9;
          if (index === 0 && withoutBismillah) {
            // Remove Bismillah from the beginning of the ayah text
            ayah = {
              ...ayah,
              text: ayah.text.substring(40).trim(),
            };
          }
          return (
            <React.Fragment key={ayah.number}>
              {/* Show Bismillah before the first ayah (except for surah 1 and 9) */}
              {index === 0 && withoutBismillah && (
                <div className="text-center mb-8">
                  <div className="text-4xl font-amiri text-primary leading-relaxed">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </div>
                </div>
              )}

              <AyahItem
                ayah={ayah}
                translation={translation}
                isBookmarked={isBookmarked}
                isCurrentlyPlaying={isCurrentlyPlaying}
                showTranslation={showTranslation}
                showTransliteration={showTransliteration}
                fontSize={fontSize}
                surahNumber={selectedSurah}
                onPlayAudio={onPlayAudio}
                onBookmark={onBookmark}
                onShare={onShare}
                locale={locale}
                messages={messages}
              />
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};
