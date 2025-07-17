import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Settings,
  ChevronDown,
  ChevronUp,
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!audioPlayer.currentAyah) return null;

  return (
    <div className="sticky top-0 z-50 mb-4 mx-2 sm:mx-4">
      <div className="bg-surface border border-border rounded-lg shadow-lg overflow-hidden border-border ">
        {/* Main Player Bar - Mobile Optimized */}
        <div className="p-3 sm:p-4">
          {/* Top Row - Info and Settings Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base truncate">
                {locale === "ar" ? currentSurah?.name : currentSurah?.englishName}
              </div>
              <div className="text-xs sm:text-sm flex items-center gap-2">
                <span>آية {audioPlayer.currentAyah}</span>
              </div>
            </div>
            
            {/* Settings Toggle - Mobile */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full transition-colors"
              title="إعدادات"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left - Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrevious}
                disabled={audioPlayer.currentAyah === 1}
                className="p-2 bg-secondary text-foreground rounded-full hover:bg-hoverButton hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Verse"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayPause}
                className="p-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors shadow-md"
                title={audioPlayer.isPlaying ? "إيقاف" : "تشغيل"}
              >
                {audioPlayer.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={onNext}
              className="p-2 bg-secondary text-foreground rounded-full hover:bg-hoverButton hover:text-foreground transition-colors"
              title="Next Verse"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right - Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Play All Button */}
              <button
                onClick={onPlayFullSurah}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm flex items-center gap-1"
                title="تشغيل السورة كاملة"
              >
                <span className="">{messages?.quran?.playAll || "تشغيل الكل"}</span>
                <span className="sm:hidden">▶️</span>
              </button>

              {/* Volume Toggle */}
              <button
                onClick={onVolumeToggle}
                className="p-2 hover:bg-secondary rounded-lg transition-colors rounded-full"
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
          <div className="mt-3">
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: "33%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Expanded Settings Panel */}
        {isExpanded && (
          <div className="border-t border-border p-3 sm:p-4 bg-secondary/50">
            <div className="space-y-4">
              {/* Reciter Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {messages?.quran?.reciter || "القارئ"}
                </label>
                <select
                  value={audioPlayer.reciter}
                  onChange={(e) => onReciterChange(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary text-sm"
                >
                  {RECITERS.map((reciter) => (
                    <option key={reciter.id} value={reciter.id}>
                      {reciter.name} - {reciter.arabicName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Controls Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Repeat Mode */}
                <button
                  onClick={onRepeatModeChange}
                  className={`p-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 ${
                    repeatMode !== "none"
                      ? "bg-primary text-white"
                      : "bg-secondary text-foreground"
                  }`}
                  title="وضع التكرار"
                >
                  <Repeat className="w-4 h-4" />
                  <span className="">{messages?.quran?.repeat || "تكرار"}</span>
                </button>

                {/* Auto Play */}
                <button
                  onClick={onAutoPlayToggle}
                  className={`p-2 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 ${
                    autoPlay
                      ? "bg-green-600 text-white"
                      : "bg-secondary text-foreground"
                  }`}
                  title="التشغيل التلقائي"
                >
                  <span className="">{messages?.quran?.autoPlay || "التشغيل التلقائي"}</span>
                </button>

                {/* Speed Control */}
                <select
                  value={audioPlayer.speed}
                  onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                  className="bg-background border border-border rounded-lg px-2 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary max-w-[100px]"
                  title="سرعة التشغيل"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>

                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <VolumeX className="w-3 h-3 text-muted" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioPlayer.volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-secondary rounded-lg cursor-pointer"
                  />
                  <Volume2 className="w-3 h-3 text-muted" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
