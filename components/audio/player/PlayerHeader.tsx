import React from "react";
import { Download, X } from "lucide-react";
import { AudioTrack } from "@/types/audio";
import { getTranslation } from "@/utils/translations";
import { getGoogleDriveDownloadUrl } from "@/utils/audioUtils";

interface PlayerHeaderProps {
  track: AudioTrack;
  locale: string;
  messages: any;
  onClose: () => void;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = React.memo(
  ({ track, locale, messages, onClose }) => {
    const downloadUrl = getGoogleDriveDownloadUrl(track.id);

    const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(downloadUrl, "_blank");
    };

    const handleViewOnGoogleDrive = (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(track.url, "_blank");
    };

    return (
      <header className="flex items-center md:justify-between justify-end md:mb-6 mb-3 relative z-10">
        <div className="md:flex hidden items-center gap-3">
          <div className="relative">
            <div
              className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
              role="status"
              aria-label={getTranslation(
                messages,
                "audio.player.streamingReady",
                "Streaming Ready",
              )}
            ></div>
            <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping"></div>
          </div>
          <div className="flex-col">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="Music"></span>
              {getTranslation(
                messages,
                "audio.player.audioPlayer",
                "Audio Player",
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {getTranslation(
                messages,
                "audio.player.poweredByGoogleDrive",
                "Powered by Google Drive",
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Quality indicator */}
          <div className="md:flex hidden items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                track.quality === "high"
                  ? "bg-green-500"
                  : track.quality === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              role="status"
              aria-label={`${track.quality} quality`}
            ></div>
            <span className="text-xs font-medium capitalize text-foreground">
              {getTranslation(
                messages,
                "audio.player.highFidelity",
                "High Fidelity",
              )}
            </span>
          </div>

          {/* View on Google Drive button */}
          <button
            onClick={handleViewOnGoogleDrive}
            className="md:px-4 md:py-2 sm:p-2 p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
            aria-label={`${getTranslation(messages, "audio.player.viewOnGoogleDrive", "View on Google Drive")} ${track.title}`}
          >
            <span className="text-sm font-medium md:block hidden">
              {getTranslation(
                messages,
                "audio.player.viewOnGoogleDrive",
                "View on Google Drive",
              )}
            </span>
            <svg
              className="w-4 h-4 w-4 h-4 mx-auto group-hover:animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8V4m0 16v-4m0-8h4m-8 0H4m16 0h-4m0 8h4m-8 0H4m16 0a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12z"
              />
            </svg>
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="md:px-4 md:py-2 sm:p-2 p-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
            aria-label={`${getTranslation(messages, "audio.track.download", "Download")} ${track.title}`}
          >
            <Download className="w-4 h-4 mx-auto group-hover:animate-bounce" />
            <span className="text-sm font-medium md:block hidden">
              {getTranslation(messages, "audio.track.download", "Download")}
            </span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="md:px-4 md:py-2 sm:p-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
            aria-label={getTranslation(
              messages,
              "common.actions.close",
              "Close player",
            )}
          >
            <X className="w-4 h-4 mx-auto group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-sm font-medium md:block hidden">
              {getTranslation(messages, "common.actions.close", "Close")}
            </span>
          </button>
        </div>
      </header>
    );
  },
);

PlayerHeader.displayName = "PlayerHeader";
