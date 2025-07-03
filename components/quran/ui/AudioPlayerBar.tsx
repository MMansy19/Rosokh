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
      <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            {/* Previous Button */}
            <button
              onClick={onPrevious}
              disabled={audioPlayer.currentAyah === 1}
              className="p-2 bg-secondary text-foreground rounded-full bg-hoverButton hover:text-foreground transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
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
              className="p-2 bg-secondary text-foreground rounded-full bg-hoverButton hover:text-foreground transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat Mode Button */}
            <button
              onClick={onRepeatModeChange}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== "none"
                  ? "bg-accent text-white"
                  : "bg-secondary text-foreground bg-hoverButton hover:text-foreground"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
            </button>

            <div className="text-sm">
              <div className="font-medium">
                {locale === "ar"
                  ? currentSurah?.name
                  : currentSurah?.englishName}
              </div>
              <div className="text-muted flex items-center gap-2">
                <span>Verse {audioPlayer.currentAyah}</span>
                {repeatMode !== "none" && (
                  <span className="text-accent">
                    ({repeatMode === "verse" ? "🔂" : "🔁"})
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  • {RECITERS.find(r => r.id === audioPlayer.reciter)?.name.split(' ')[0] || audioPlayer.reciter}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-play toggle */}
            <button
              onClick={onAutoPlayToggle}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                autoPlay
                  ? "bg-accent text-white"
                  : "bg-secondary text-foreground bg-hoverButton hover:text-foreground"
              }`}
            >
              Auto
            </button>

            {/* Play Full Surah */}
            <button
              onClick={onPlayFullSurah}
              className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80 transition-colors"
            >
              {messages?.youtube.actions.playAll}
            </button>

            {/* Reciter Selection - Quick Access */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">Reciter:</span>
              <select
                value={audioPlayer.reciter}
                onChange={(e) => onReciterChange(e.target.value)}
                className="text-xs bg-secondary border border-border rounded px-2 py-1 max-w-[120px]"
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
              className="text-xs bg-secondary border border-border rounded px-2 py-1"
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
              className="p-1 hover:bg-secondary rounded"
            >
              {audioPlayer.isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reciter
                </label>
                <select
                  value={audioPlayer.reciter}
                  onChange={(e) => onReciterChange(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2"
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
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioPlayer.volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-1">
          <div className="bg-primary h-1 rounded-full w-1/3"></div>
        </div>
      </div>
    </div>
  );
};
