import { useState, useEffect } from "react";
import { Ayah, Translation } from "../types";
import { quranService } from "@/services/quranService";
import { TRANSLATION_EDITIONS } from "../constants";
import { AnalyticsService } from "@/services/AnalyticsService";

export const useAyahs = (surahNumber: number, locale: string) => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAyahs = async () => {
      if (!surahNumber) return;

      setLoading(true);
      setError(null);

      try {
        const analytics = AnalyticsService.getInstance();
        analytics.trackEvent("surah_load_start", "content", {
          surahNumber,
          locale,
        });

        // Get translation edition for locale
        const translationEdition = quranService.getTranslationEdition(locale);
        
        // Get Arabic text and translation together using multiple editions
        const editions = ['quran-uthmani', translationEdition];
        const surahsData = await quranService.getSurahWithMultipleEditions(surahNumber, editions);
        
        if (surahsData && surahsData.length >= 2) {
          const arabicSurah = surahsData[0];
          const translationSurah = surahsData[1];
          
          // Set Arabic ayahs
          const arabicAyahs = arabicSurah.ayahs.map(ayah => ({
            number: ayah.number,
            text: ayah.text,
            numberInSurah: ayah.numberInSurah,
            surah: surahNumber
          }));
          setAyahs(arabicAyahs);

          // Set translations
          const translationsArray = translationSurah.ayahs.map(
            (ayah: any, index: number) => ({
              id: index,
              text: ayah.text,
              language_name: locale,
              resource_name: translationSurah.name || 'Translation',
            }),
          );
          setTranslations(translationsArray);
        
          analytics.trackEvent("surah_loaded", "content", {
            surahNumber,
            ayahsCount: arabicAyahs.length,
            translationEdition,
            hasTranslation: translationsArray.length > 0,
          });
        } else {
          throw new Error("Failed to load surah data");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        const analytics = AnalyticsService.getInstance();
        analytics.trackEvent("surah_load_error", "error", {
          surahNumber,
          error: errorMessage,
          locale,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAyahs();
  }, [surahNumber, locale]);

  return { ayahs, translations, loading, error };
};
