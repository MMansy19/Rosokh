import React from "react";
import { Settings } from "lucide-react";

interface ReadingControlsProps {
  showTranslation: boolean;
  fontSize: number;
  showSettings: boolean;
  onTranslationToggle: () => void;
  onFontSizeChange: (size: number) => void;
  onSettingsToggle: () => void;
  messages: any;
  currentMode: "read" | "learn";
}

export const ReadingControls: React.FC<ReadingControlsProps> = ({
  showTranslation,
  fontSize,
  showSettings,
  onTranslationToggle,
  onFontSizeChange,
  onSettingsToggle,
  messages,
  currentMode
}) => {
  return (
    <div className="p-6 border-b border-border">
      <div className={`flex flex-wrap justify-between gap-4 ${currentMode === "learn" ? "flex-wrap md:justify-between justify-center" : "justify-center"}`}>
        {currentMode === "learn" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onTranslationToggle}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              showTranslation
                ? "bg-primary text-white"
                : "bg-secondary text-foreground hover:bg-hoverButton"
            }`}
          >
            {messages?.quran?.translation || "Translation"}
          </button>
        </div>
        )}
        <div className="flex items-center gap-2">
          {/* Font Size Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted">{messages?.quran?.fontSize || "Font:"}</span>
            <input
              type="range"
              min="16"
              max="36"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted w-8">{fontSize}px</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onSettingsToggle}
            className="p-2 hover:bg-hoverButton rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
