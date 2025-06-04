import React from 'react';
import { AudioTrack } from '../../types/audio';
import { 
  PlayerHeader, 
  SpeedControlInfo, 
  PlayerStatusBar, 
  PlayerFrame, 
  PlayerFooter,
  useAudioPlayerEnhanced 
} from './player';

interface AudioPlayerProps {
  track: AudioTrack;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  locale: string;
  messages: any;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = React.memo(({
  track,
  isExpanded,
  onClose,
  locale,
  messages
}) => {const {
    iframeLoading,
    audioReady,
    estimatedDuration,
    audioError,
    handleIframeLoad,
    handleIframeError,
    hasError
  } = useAudioPlayerEnhanced({ track });
  return (
    <article className="mt-6 bg-gradient-to-br from-background to-secondary/20 rounded-xl p-6 border border-border shadow-inner relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="audioWaves" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 Q 5 5 10 10 T 20 10" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#audioWaves)" />
        </svg>
      </div>      <PlayerHeader 
        track={track}
        locale={locale}
        messages={messages}
        onClose={onClose}
      />

      {/* Player Container */}
      <section className="relative mb-4">
        <SpeedControlInfo 
          locale={locale}
          messages={messages}
        />

        {/* Enhanced background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-xl" aria-hidden="true"></div>
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path 
              d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50" 
              stroke="url(#audioGradient)" 
              strokeWidth="2" 
              fill="none"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
                <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 0.6}} />
                <stop offset="100%" style={{stopColor: '#06b6d4', stopOpacity: 0.8}} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          <PlayerStatusBar 
            iframeLoading={iframeLoading}
            audioReady={audioReady}
            audioError={audioError}
            estimatedDuration={estimatedDuration}
            locale={locale}
            messages={messages}
          />
          
          <PlayerFrame 
            track={track}
            isExpanded={isExpanded}
            iframeLoading={iframeLoading}
            audioReady={audioReady}
            onIframeLoad={handleIframeLoad}
            onIframeError={handleIframeError}
            locale={locale}
            messages={messages}
          />
          
          <PlayerFooter 
            locale={locale}
            messages={messages}
          />
        </div>
      </section>
    </article>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
