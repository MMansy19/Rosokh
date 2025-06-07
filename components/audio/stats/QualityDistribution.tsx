import React from "react";
import { getTranslation } from "@/utils/translations";

interface QualityDistributionProps {
  qualities: {
    high: number;
    medium: number;
    low: number;
  };
  totalTracks: number;
  locale: string;
  messages: any;
}

export const QualityDistribution: React.FC<QualityDistributionProps> =
  React.memo(({ qualities, totalTracks, locale, messages }) => {
    const qualityData = Object.entries(qualities).map(([quality, count]) => {
      const percentage = totalTracks > 0 ? (count / totalTracks) * 100 : 0;
      const colorClass =
        quality === "high"
          ? "bg-green-500"
          : quality === "medium"
            ? "bg-yellow-500"
            : "bg-red-500";

      return {
        quality,
        count,
        percentage,
        colorClass,
        label: getTranslation(messages, `audio.qualities.${quality}`, quality),
      };
    });

    return (
      <section>
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <span role="img" aria-label="Audio quality">
            
          </span>
          <span>
            {getTranslation(
              messages,
              "audio.stats.qualityTitle",
              "Audio Quality",
            )}
          </span>
        </h4>
        <div
          className="space-y-2"
          role="region"
          aria-label={getTranslation(
            messages,
            "audio.stats.qualityLabel",
            "Audio quality distribution",
          )}
        >
          {qualityData.map(
            ({ quality, count, percentage, colorClass, label }) => (
              <div
                key={quality}
                className="flex items-center gap-3"
                role="listitem"
              >
                <div className="w-16 text-sm text-muted-foreground">
                  {label}
                </div>
                <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${count} tracks (${Math.round(percentage)}%)`}
                  />
                </div>
                <div className="w-12 text-sm text-muted-foreground text-right">
                  {count}
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    );
  });

QualityDistribution.displayName = "QualityDistribution";
