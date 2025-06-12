import { useState, useEffect } from "react";
import { Ayah, Translation } from "../types";
import { API_ENDPOINTS, TRANSLATION_EDITIONS } from "../constants";
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

        // Get Arabic text
        const arabicResponse = await fetch(API_ENDPOINTS.surah(surahNumber));
        const arabicData = await arabicResponse.json();
        setAyahs(arabicData.data.ayahs);

        // Get translations based on locale
        const translationEdition = 
          TRANSLATION_EDITIONS[locale as keyof typeof TRANSLATION_EDITIONS] || 
          TRANSLATION_EDITIONS.default;

        const translationResponse = await fetch(
          API_ENDPOINTS.surahWithTranslation(surahNumber, translationEdition)
        );
        const translationData = await translationResponse.json();

        if (translationData.data && translationData.data.ayahs) {
          const translationsArray = translationData.data.ayahs.map(
            (ayah: any, index: number) => ({
              id: index,
              text: ayah.text,
              language_name: locale,
              resource_name: translationData.data.edition.name,
            })
          );
          setTranslations(translationsArray);
        }

        analytics.trackEvent("surah_loaded", "content", {
          surahNumber,
          ayahsCount: arabicData.data.ayahs.length,
          translationEdition,
          hasTranslation: !!translationData.data,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
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
