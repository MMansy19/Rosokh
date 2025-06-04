import React from "react";
import { getTranslation } from "@/utils/translations";

interface SpeedControlInfoProps {
  locale: string;
  messages: any;
}

export const SpeedControlInfo: React.FC<SpeedControlInfoProps> = React.memo(
  ({ locale, messages }) => {
    return (
      <div className="mb-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
              {getTranslation(
                messages,
                "audio.player.speedControlInfo",
                "Speed Control Information",
              )}
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {getTranslation(
                messages,
                "audio.player.speedControlMessage",
                "To change playback speed, right-click on the audio player and select speed from the context menu, or use your browser's built-in media controls.",
              )}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

SpeedControlInfo.displayName = "SpeedControlInfo";
