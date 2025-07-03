import { useState, useEffect } from "react";
import { Surah } from "../types";
import { quranService } from "@/services/quranService";
import { AnalyticsService } from "@/services/AnalyticsService";

export const useSurahs = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const analytics = AnalyticsService.getInstance();
        analytics.trackEvent("surahs_fetch_start", "content", {
          timestamp: new Date().toISOString(),
        });

        // Get metadata from Al Quran Cloud API
        const meta = await quranService.getQuranMeta();
        const surahsData = meta.surahs.references.map(surah => ({
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          arabicName: surah.name, // Arabic name from the API
          revelationType: surah.revelationType,
          numberOfAyahs: surah.numberOfAyahs,
          ayahs: [] // Will be loaded separately when needed
        }));
        
        setSurahs(surahsData);

        analytics.trackEvent("surahs_loaded", "content", {
          surahsCount: surahsData.length,
          source: "alquran_cloud_api",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);

        const analytics = AnalyticsService.getInstance();
        analytics.trackEvent("surahs_fetch_error", "error", {
          error: errorMessage,
          api: "alquran_cloud",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  return { surahs, loading, error };
};
