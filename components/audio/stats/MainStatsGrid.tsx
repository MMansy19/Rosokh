import React from "react";
import { Users, Clock, Heart, Download } from "lucide-react";
import { StatCard } from "./StatCard";
import { getTranslation } from "@/utils/translations";

interface MainStatsGridProps {
  totalReciters: number;
  formattedDuration: string;
  favoriteCount: number;
  locale: string;
  messages: any;
}

export const MainStatsGrid: React.FC<MainStatsGridProps> = React.memo(
  ({ totalReciters, formattedDuration, favoriteCount, locale, messages }) => {
    const statsData = [
      {
        icon: Users,
        value: totalReciters,
        label: getTranslation(messages, "audio.stats.reciters", "Reciters"),
        colorClass:
          "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
        ariaLabel: `${totalReciters} ${getTranslation(messages, "audio.stats.reciters", "Reciters")}`,
      },
      {
        icon: Clock,
        value: formattedDuration,
        label: getTranslation(
          messages,
          "audio.stats.totalDuration",
          "Total Duration",
        ),
        colorClass:
          "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
        ariaLabel: `${getTranslation(messages, "audio.stats.totalDuration", "Total Duration")}: ${formattedDuration}`,
      },
      {
        icon: Heart,
        value: favoriteCount,
        label: getTranslation(messages, "common.favorites", "Favorites"),
        colorClass: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
        ariaLabel: `${favoriteCount} ${getTranslation(messages, "common.favorites", "Favorites")}`,
      },
      {
        icon: Download,
        value: "HD",
        label: getTranslation(messages, "audio.filters.quality", "Quality"),
        colorClass:
          "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
        ariaLabel: getTranslation(
          messages,
          "audio.stats.hdQuality",
          "HD Quality available",
        ),
      },
    ];

    return (
      <section
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        aria-label={getTranslation(
          messages,
          "audio.stats.mainStatsLabel",
          "Main statistics",
        )}
      >
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            colorClass={stat.colorClass}
            aria-label={stat.ariaLabel}
          />
        ))}
      </section>
    );
  },
);

MainStatsGrid.displayName = "MainStatsGrid";
