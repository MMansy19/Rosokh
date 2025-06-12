import React from "react";
import { Ayah, Translation } from "../types";
import { VerseInteraction } from "../VerseInteraction";
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Share2,
} from "lucide-react";

interface AyahItemProps {
  ayah: Ayah;
  translation?: Translation;
  isBookmarked: boolean;
  isCurrentlyPlaying: boolean;
  showTranslation: boolean;
  showTransliteration: boolean;
  fontSize: number;
  surahNumber: number;
  onPlayAudio: (ayahNumber: number) => void;
  onBookmark: (surahNumber: number, ayahNumber: number) => void;
  onShare: (surah: number, ayah: number, text: string) => void;
  locale: string;
  messages: any;
}

export const AyahItem: React.FC<AyahItemProps> = ({
  ayah,
  translation,
  isBookmarked,
  isCurrentlyPlaying,
  showTranslation,
  showTransliteration,
  fontSize,
  surahNumber,
  onPlayAudio,
  onBookmark,
  onShare,
  locale,
  messages,
}) => {
  return (
    <div
      className={`group p-4 rounded-lg transition-all duration-200 border relative ${
        isCurrentlyPlaying
          ? "bg-primary/5 border-primary/20"
          : "border-transparent hover:bg-secondary hover:border-border"
      }`}
    >
      {/* Verse Interaction Component */}
      <VerseInteraction
        surahNumber={surahNumber}
        ayahNumber={ayah.numberInSurah}
        ayahText={ayah.text}
        translation={translation?.text}
        onPlayAudio={onPlayAudio}
        onBookmark={onBookmark}
        isBookmarked={isBookmarked}
        locale={locale}
        messages={messages}
      />

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
          {ayah.numberInSurah}
        </div>

        <div className="flex-1">
          {/* Arabic Text */}
          <p
            className="font-amiri leading-loose text-foreground text-right mb-4"
            style={{ fontSize: `${fontSize}px` }}
          >
            {ayah.text}
          </p>

          {/* Translation */}
          {showTranslation && translation && (
            <div className="mb-4 p-3 bg-background/50 rounded-lg">
              <p className="text-lg text-muted leading-relaxed">
                {translation.text}
              </p>
              <p className="text-xs text-muted mt-2">
                — {translation.resource_name}
              </p>
            </div>
          )}

          {/* Transliteration placeholder */}
          {showTransliteration && (
            <div className="mb-4 p-3 bg-background/50 rounded-lg">
              <p className="text-lg text-muted italic">
                {messages?.quran?.transliterationNotAvailable ||
                  "Transliteration not available"}
              </p>
            </div>
          )}
        </div>

        {/* Traditional Action Buttons (still available) */}
        <div className="flex-shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Play Audio */}
          <button
            onClick={() => onPlayAudio(ayah.numberInSurah)}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
            title="Play Audio"
          >
            <Play className="w-4 h-4" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark(surahNumber, ayah.numberInSurah)}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? "bg-accent text-white"
                : "bg-secondary text-foreground hover:bg-accent hover:text-white"
            }`}
            title="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(surahNumber, ayah.numberInSurah, ayah.text)}
            className="p-2 bg-secondary text-foreground rounded-full hover:bg-accent hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
