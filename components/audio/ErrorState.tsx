import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Server, FileX } from 'lucide-react';
import { getTranslation } from '../../utils/translations';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  type?: 'network' | 'server' | 'notFound' | 'general';
  locale: string;
  messages: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  type = 'general',
  locale,
  messages
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <Wifi className="w-12 h-12 text-red-500" />;
      case 'server':
        return <Server className="w-12 h-12 text-red-500" />;
      case 'notFound':
        return <FileX className="w-12 h-12 text-red-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
    }
  };
  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return getTranslation(messages, 'audio.error.connectionError', 'Connection Error');
      case 'server':
        return getTranslation(messages, 'audio.error.serverError', 'Server Error');
      case 'notFound':
        return getTranslation(messages, 'audio.error.notFound', 'Content Not Found');
      default:
        return getTranslation(messages, 'audio.error.somethingWentWrong', 'Something Went Wrong');
    }
  };
  const getErrorDescription = () => {
    switch (type) {
      case 'network':
        return getTranslation(messages, 'audio.error.networkMessage', 'Please check your internet connection and try again.');
      case 'server':
        return getTranslation(messages, 'audio.error.serverMessage', 'Our servers are experiencing issues. Please try again in a moment.');
      case 'notFound':
        return getTranslation(messages, 'audio.error.notFoundMessage', 'The audio content you\'re looking for could not be found.');
      default:
        return getTranslation(messages, 'audio.error.generalMessage', 'An unexpected error occurred while loading the audio content.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Error Icon with Animation */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-4 relative dark:bg-red-950">
          {getErrorIcon()}
          
          {/* Pulsing Ring */}
          <div className="absolute inset-0 border-2 border-red-200 rounded-full animate-ping dark:border-red-800"></div>
        </div>

        {/* Floating Error Indicators */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>

      {/* Error Content */}
      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {getErrorTitle()}
        </h3>
        
        <p className="text-muted-foreground mb-2 leading-relaxed">
          {getErrorDescription()}
        </p>
        
        {/* Technical Error Details */}        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            {getTranslation(messages, 'audio.error.technicalDetails', 'Technical details')}
          </summary>
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground font-mono break-all">
            {error}
          </div>
        </details>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{getTranslation(messages, 'audio.error.tryAgain', 'Try Again')}</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-lg font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{getTranslation(messages, 'audio.error.refreshPage', 'Refresh Page')}</span>
          </button>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="mt-12 max-w-2xl">
        <div className="bg-muted/30 rounded-xl p-6 border border-border/50">          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>{getTranslation(messages, 'audio.error.troubleshootingTips', 'Troubleshooting Tips')}</span>
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{getTranslation(messages, 'audio.error.checkConnection', 'Check your internet connection')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{getTranslation(messages, 'audio.error.refreshThePage', 'Try refreshing the page')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{getTranslation(messages, 'audio.error.clearCache', 'Clear your browser cache and cookies')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{getTranslation(messages, 'audio.error.disableAdBlockers', 'Disable ad blockers or browser extensions')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};
