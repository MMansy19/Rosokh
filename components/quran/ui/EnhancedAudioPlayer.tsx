import React, { useState } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
} from '@heroicons/react/24/outline';
import { AudioPlayerState, RepeatMode } from '../types';
import { RECITERS } from '../constants';
import { ReciterSelection } from './ReciterSelection';

interface EnhancedAudioPlayerProps {
  audioPlayer: AudioPlayerState;
  repeatMode: RepeatMode;
  autoPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onReciterChange: (reciter: string) => void;
  onRepeatModeChange: (mode: RepeatMode) => void;
  onAutoPlayChange: (autoPlay: boolean) => void;
  onMuteToggle: () => void;
  currentSurah?: { name: string; englishName: string; number: number };
  messages: any;
}

export const EnhancedAudioPlayer: React.FC<EnhancedAudioPlayerProps> = ({
  audioPlayer,
  repeatMode,
  autoPlay,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onVolumeChange,
  onSpeedChange,
  onReciterChange,
  onRepeatModeChange,
  onAutoPlayChange,
  onMuteToggle,
  currentSurah,
  messages
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const currentReciter = RECITERS.find(r => r.id === audioPlayer.reciter);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const repeatModes: RepeatMode[] = ['none', 'verse', 'surah'];

  const getRepeatModeIcon = (mode: RepeatMode) => {
    switch (mode) {
      case 'verse':
        return '🔂';
      case 'surah':
        return '🔁';
      default:
        return '➡️';
    }
  };

  const getRepeatModeText = (mode: RepeatMode) => {
    switch (mode) {
      case 'verse':
        return messages?.quran?.repeatVerse || 'Repeat Verse';
      case 'surah':
        return messages?.quran?.repeatSurah || 'Repeat Surah';
      default:
        return messages?.quran?.noRepeat || 'No Repeat';
    }
  };

  return (
    <div className="bg-background border-t border-border shadow-lg">
      {/* Main Player Controls */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Current Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              {currentSurah && (
                <>
                  {currentSurah.englishName} - {currentSurah.name}
                </>
              )}
              {audioPlayer.currentAyah && (
                <span className="text-muted ml-2">
                  Ayah {audioPlayer.currentAyah}
                </span>
              )}
            </div>
            <div className="text-xs text-muted">
              {currentReciter?.name} - {currentReciter?.arabicName}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full hover:bg-surface transition-colors"
              title="Previous Ayah"
            >
              <BackwardIcon className="h-5 w-5 text-muted" />
            </button>

            <button
              onClick={audioPlayer.isPlaying ? onPause : onPlay}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-foreground rounded-full transition-colors"
              title={audioPlayer.isPlaying ? 'Pause' : 'Play'}
            >
              {audioPlayer.isPlaying ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-full hover:bg-surface transition-colors"
              title="Next Ayah"
            >
              <ForwardIcon className="h-5 w-5 text-muted" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onMuteToggle}
                className="p-2 rounded-full hover:bg-surface transition-colors"
                title={audioPlayer.isMuted ? 'Unmute' : 'Mute'}
              >
                {audioPlayer.isMuted ? (
                  <SpeakerXMarkIcon className="h-5 w-5 text-muted" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5 text-muted" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioPlayer.volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-2 bg-surface rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-surface transition-colors"
              title="Audio Settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Progress Bar Placeholder */}
        <div className="mt-3">
          <div className="w-full bg-surface rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: audioPlayer.isPlaying ? '30%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-border bg-background px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Reciter Selection */}
            <div>
              <ReciterSelection
                currentReciter={audioPlayer.reciter}
                onReciterChange={onReciterChange}
                messages={messages}
              />
            </div>

            {/* Playback Speed */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                {messages?.quran?.playbackSpeed || 'Playback Speed'}
              </label>
              <select
                value={audioPlayer.speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background dark:text-foreground"
              >
                {speedOptions.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>

            {/* Repeat Mode */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                {messages?.quran?.repeatMode || 'Repeat Mode'}
              </label>
              <div className="space-y-2">
                {repeatModes.map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="repeatMode"
                      value={mode}
                      checked={repeatMode === mode}
                      onChange={() => onRepeatModeChange(mode)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-muted">
                      {getRepeatModeIcon(mode)} {getRepeatModeText(mode)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Auto Play Toggle */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => onAutoPlayChange(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-muted">
                {messages?.quran?.autoPlay || 'Auto-play next ayah'}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAudioPlayer;
