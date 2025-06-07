import React from "react";
import { getTranslation } from "@/utils/translations";

interface PlayerFooterProps {
  locale: string;
  messages: any;
}

export const PlayerFooter: React.FC<PlayerFooterProps> = React.memo(
  ({ locale, messages }) => {
    return (
      <footer className="bg-gradient-to-br from-primary to-primary/80 border-t border-primary px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span role="img" aria-label="Music">
                
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {getTranslation(messages, "audio.player.format", "Format: MP3")}
            </span>
            <span>•</span>
            <span>
              {getTranslation(
                messages,
                "audio.player.source",
                "Source: Google Drive",
              )}
            </span>
          </div>
        </div>
      </footer>
    );
  },
);

PlayerFooter.displayName = "PlayerFooter";
