import { useState, useEffect } from "react";
import { Surah } from "../types";
import { API_ENDPOINTS } from "../constants";
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

        const response = await fetch(API_ENDPOINTS.surahs);
        const data = await response.json();
        setSurahs(data.data);

        analytics.trackEvent("surahs_loaded", "content", {
          surahsCount: data.data.length,
          source: "alquran_cloud_api",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
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
