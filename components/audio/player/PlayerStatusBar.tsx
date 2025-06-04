import React from "react";
import { getTranslation } from "@/utils/translations";

interface PlayerStatusBarProps {
  iframeLoading: boolean;
  audioReady: boolean;
  audioError: string | null;
  estimatedDuration: string;
  locale: string;
  messages: any;
}

export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = React.memo(
  ({
    iframeLoading,
    audioReady,
    audioError,
    estimatedDuration,
    locale,
    messages,
  }) => {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
            </div>
            <div className="h-6 w-px bg-gray-600"></div>
            <span className="text-xs text-gray-300 font-medium flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {getTranslation(
                messages,
                "audio.player.googleDriveAudioPlayer",
                "Google Drive Audio Player",
              )}
            </span>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            {iframeLoading && (
              <div className="flex items-center gap-2 text-xs text-yellow-400">
                <div
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                  role="status"
                  aria-label="Loading"
                ></div>
                <span>
                  {getTranslation(
                    messages,
                    "audio.loading.loadingAudio",
                    "Loading...",
                  )}
                </span>
              </div>
            )}

            {audioReady && !iframeLoading && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div
                  className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                  role="status"
                  aria-label="Ready"
                ></div>
                <span>
                  {getTranslation(
                    messages,
                    "audio.player.readyToPlay",
                    "Ready to Play",
                  )}
                </span>
              </div>
            )}
            {audioError && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <div
                  className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                  role="status"
                  aria-label="Error"
                ></div>
                <span>
                  {getTranslation(
                    messages,
                    "audio.error.audioError",
                    "Audio Error",
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-300">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
              </svg>
              <span>{estimatedDuration}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PlayerStatusBar.displayName = "PlayerStatusBar";
