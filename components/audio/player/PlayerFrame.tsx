import React from 'react';
import { AudioTrack } from '@/types/audio';
import { getTranslation } from '@/utils/translations';
import { getGoogleDrivePreviewUrl } from '@/utils/audioUtils';

interface PlayerFrameProps {
  track: AudioTrack;
  isExpanded: boolean;
  iframeLoading: boolean;
  audioReady: boolean;
  onIframeLoad: () => void;
  onIframeError: () => void;
  locale: string;
  messages: any;
}

export const PlayerFrame: React.FC<PlayerFrameProps> = React.memo(({ 
  track,
  isExpanded,
  iframeLoading,
  audioReady,
  onIframeLoad,
  onIframeError,
  locale,
  messages 
}) => {
  const previewUrl = getGoogleDrivePreviewUrl(track.id);

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-slate-900">
      {/* Loading overlay */}
      {iframeLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-slate-900/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
            <div className="text-white text-sm font-medium mb-2">
              {getTranslation(messages, 'audio.loading.loadingAudioPlayer', 'Loading Audio Player')}
            </div>
            <div className="text-gray-400 text-xs">
              {getTranslation(messages, 'audio.loading.preparingAudioExperience', 'Preparing your audio experience...')}
            </div>
            <div className="mt-3 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Audio ready overlay */}
      {audioReady && !iframeLoading && (
        <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-10 animate-fade-in">
          <div 
            className="w-2 h-2 bg-white rounded-full animate-pulse"
            role="status"
            aria-label="Ready"
          ></div>
          <span>
            {getTranslation(messages, 'audio.player.audioReady', 'Audio Ready!')}
          </span>
        </div>
      )}
      
      <iframe
        src={`${previewUrl}?autoplay=1`}
        width="100%"
        height={isExpanded ? "500" : "180"}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        className={`w-full h-full rounded-lg relative transition-all duration-300 bg-gradient-to-br from-gray-900 to-slate-900 ${iframeLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        title={`${track.title} - ${track.reciter.name}`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allowFullScreen
        onLoad={onIframeLoad}
        onError={onIframeError}
      />
    </div>
  );
});

PlayerFrame.displayName = 'PlayerFrame';
