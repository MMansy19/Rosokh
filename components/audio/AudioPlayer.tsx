import React from 'react';
import { Download } from 'lucide-react';
import { AudioTrack } from '../../types/audio';
import { getGoogleDrivePreviewUrl, getGoogleDriveDownloadUrl } from '../../utils/audioUtils';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioPlayerProps {
  track: AudioTrack;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  isExpanded,
  onToggleExpand
}) => {
  const {
    iframeLoading,
    audioReady,
    estimatedDuration,
    audioError,
    handleIframeLoad,
    handleIframeError
  } = useAudioPlayer();

  const previewUrl = getGoogleDrivePreviewUrl(track.id);
  const downloadUrl = getGoogleDriveDownloadUrl(track.id);

  return (
    <div className="mt-6 bg-gradient-to-br from-background to-secondary/20 rounded-xl p-6 border border-border shadow-inner relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="audioWaves" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 Q 5 5 10 10 T 20 10" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#audioWaves)" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-ping"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">🎵</span>
              Audio Player
            </span>
            <span className="text-xs text-muted-foreground">
              Powered by Google Drive
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quality indicator */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              track.quality === "high" ? "bg-green-500" : 
              track.quality === "medium" ? "bg-yellow-500" : "bg-red-500"
            }`}></div>
            <span className="text-xs font-medium capitalize text-foreground">
              {track.quality} Quality
            </span>
          </div>
          
          {/* Expand/Collapse button */}
          <button
            onClick={onToggleExpand}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
          >
            <span className="text-sm font-medium">
              {isExpanded ? "Minimize" : "Expand Player"}
            </span>
            <div className={`transform transition-transform duration-200 group-hover:scale-110 ${isExpanded ? "rotate-180" : ""}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </button>
          
          {/* Download button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(downloadUrl, "_blank");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
          >
            <Download className="w-4 h-4 group-hover:animate-bounce" />
            <span className="text-sm font-medium">Download</span>
          </button>

          {/* View on Google Drive button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(track.url, "_blank");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg group"
          >
            <span className="text-sm font-medium">View on Google Drive</span>
            <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 16v-4m0-8h4m-8 0H4m16 0h-4m0 8h4m-8 0H4m16 0a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Player Container */}
      <div className="relative mb-4">
        {/* Speed Control Information Banner */}
        <div className="mb-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Speed Control Information
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                To change playback speed, <strong className="mx-1">right-click on the audio player</strong> and select speed from the context menu, 
                or use your browser's built-in media controls.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-xl"></div>
        <div className="absolute inset-0 opacity-10">
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
          {/* Player status bar */}
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
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Google Drive Audio Player
                </span>
              </div>
              
              {/* Status indicators */}
              <div className="flex items-center gap-4">
                {iframeLoading && (
                  <div className="flex items-center gap-2 text-xs text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Loading...</span>
                  </div>
                )}
                
                {audioReady && !iframeLoading && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Ready to Play</span>
                  </div>
                )}
                
                {audioError && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>Audio Error</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                  </svg>
                  <span>{estimatedDuration}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Iframe container */}
          <div className="relative bg-gradient-to-br from-gray-900 to-slate-900">
            {/* Loading overlay */}
            {iframeLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-slate-900/90 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
                  <div className="text-white text-sm font-medium mb-2">Loading Audio Player</div>
                  <div className="text-gray-400 text-xs">Preparing your audio experience...</div>
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
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Audio Ready!</span>
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
              onLoad={() => handleIframeLoad(track.category)}
              onError={handleIframeError}
            />
          </div>
          
          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-green-400">●</span>
                  <span>Live Stream</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🎧</span>
                  <span>High Fidelity</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span>Format: MP3</span>
                <span>•</span>
                <span>Source: Google Drive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
