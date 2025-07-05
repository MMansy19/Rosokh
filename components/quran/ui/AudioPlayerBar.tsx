import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
} from "lucide-react";
import { AudioPlayerState, RepeatMode, Surah } from "../types";
import { RECITERS } from "../constants";

interface AudioPlayerBarProps {
  audioPlayer: AudioPlayerState;
  repeatMode: RepeatMode;
  autoPlay: boolean;
  currentSurah?: Surah;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRepeatModeChange: () => void;
  onAutoPlayToggle: () => void;
  onPlayFullSurah: () => void;
  onSpeedChange: (speed: number) => void;
  onVolumeToggle: () => void;
  onReciterChange: (reciter: string) => void;
  onVolumeChange: (volume: number) => void;
  showSettings?: boolean;
  messages: any;
  locale?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioPlayer,
  repeatMode,
  autoPlay,
  currentSurah,
  onPlayPause,
  onPrevious,
  onNext,
  onRepeatModeChange,
  onAutoPlayToggle,
  onPlayFullSurah,
  onSpeedChange,
  onVolumeToggle,
  onReciterChange,
  onVolumeChange,
  showSettings = false,
  messages,
  locale = "ar",
}) => {
  if (!audioPlayer.currentAyah) return null;

  return (
    <div className="sticky top-4 z-50 mb-6">
      <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        {/* Main Player Bar */}
        <div className="flex items-center justify-between p-4">
          {/* Left Section - Playback Controls */}
          <div className="flex items-center space-x-4">
            {/* Previous Button */}
            <button
              onClick={onPrevious}
              disabled={audioPlayer.currentAyah === 1}
              className="p-2 bg-secondary text-foreground rounded-full hover:bg-hoverButton hover:text-foreground transition-colors disabled:opacity-50"
              title="Previous Verse"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onPlayPause}
              className="p-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors shadow-md"
              title={audioPlayer.isPlaying ? "Pause" : "Play"}
            >
              {audioPlayer.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={onNext}
              className="p-2 bg-secondary text-foreground rounded-full hover:bg-hoverButton hover:text-foreground transition-colors"
              title="Next Verse"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat Mode Button */}
            <button
              onClick={onRepeatModeChange}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== "none"
                  ? "bg-accent text-white"
                  : "bg-secondary text-foreground hover:bg-hoverButton hover:text-foreground"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode !== "none" && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
              )}
            </button>
          </div>

          {/* Center Section - Current Playing Info */}
          <div className="flex-1 mx-6 text-center">
            <div className="font-medium text-foreground">
              {locale === "ar"
                ? currentSurah?.name
                : currentSurah?.englishName}
            </div>
            <div className="text-sm text-muted flex items-center justify-center gap-2">
              <span>آية {audioPlayer.currentAyah}</span>
              {repeatMode !== "none" && (
                <span className="text-accent">
                  ({repeatMode === "verse" ? "🔂 آية" : "🔁 سورة"})
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                • {RECITERS.find(r => r.id === audioPlayer.reciter)?.name.split(' ')[0] || audioPlayer.reciter}
              </span>
            </div>
          </div>

          {/* Right Section - Settings & Controls */}
          <div className="flex items-center space-x-2">
            {/* Auto-play toggle */}
            <button
              onClick={onAutoPlayToggle}
              className={`px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                autoPlay
                  ? "bg-accent text-white"
                  : "bg-secondary text-foreground hover:bg-hoverButton hover:text-foreground"
              }`}
              title="Auto-play next verse"
            >
              <span>🔄</span>
              <span>Auto</span>
            </button>

            {/* Play Full Surah */}
            <button
              onClick={onPlayFullSurah}
              className="px-3 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-1"
              title="Play entire Surah"
            >
              <span>▶️</span>
              <span>{messages?.youtube?.actions?.playAll || messages?.quran?.playAll || "Play All"}</span>
            </button>

            {/* Quick Reciter Selection */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">القارئ:</span>
              <select
                value={audioPlayer.reciter}
                onChange={(e) => onReciterChange(e.target.value)}
                className="text-xs bg-secondary border border-border rounded px-2 py-1 max-w-[120px] focus:ring-2 focus:ring-primary"
              >
                {RECITERS.map((reciter) => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Control */}
            <select
              value={audioPlayer.speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="text-xs bg-secondary border border-border rounded px-2 py-1 focus:ring-2 focus:ring-primary"
              title="Playback speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
            </select>

            {/* Volume Control */}
            <button
              onClick={onVolumeToggle}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title={audioPlayer.isMuted ? "Unmute" : "Mute"}
            >
              {audioPlayer.isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
              style={{ width: "33%" }}
            ></div>
          </div>
        </div>

        {/* Expanded Settings Panel */}
        {showSettings && (
          <div className="border-t border-border p-4 bg-secondary/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  القارئ المفضل
                </label>
                <select
                  value={audioPlayer.reciter}
                  onChange={(e) => onReciterChange(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                >
                  {RECITERS.map((reciter) => (
                    <option key={reciter.id} value={reciter.id}>
                      {reciter.name} - {reciter.arabicName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  مستوى الصوت ({Math.round(audioPlayer.volume * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioPlayer.volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
