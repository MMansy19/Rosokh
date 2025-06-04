import React from "react";
import { AlertTriangle, RefreshCw, Wifi, Server, FileX, Music } from "lucide-react";
import { getTranslation } from "@/utils/translations";
import { EnhancedErrorState } from "@/components/common/ErrorState/EnhancedErrorState";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  type?: "network" | "server" | "notFound" | "general";
  locale: string;
  messages: any;
  showDetails?: boolean;
  retryCount?: number;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  type = "general",
  locale,
  messages,
  showDetails = false,
  retryCount = 0,
}) => {
  const getErrorLevel = () => {
    switch (type) {
      case "network":
        return "warning" as const;
      case "server":
        return "error" as const;
      case "notFound":
        return "info" as const;
      default:
        return "error" as const;
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case "network":
        return getTranslation(
          messages,
          "audio.error.connectionError",
          "Connection Error",
        );
      case "server":
        return getTranslation(
          messages,
          "audio.error.serverError",
          "Server Error",
        );
      case "notFound":
        return getTranslation(
          messages,
          "audio.error.notFound",
          "Content Not Found",
        );
      default:
        return getTranslation(
          messages,
          "audio.error.somethingWentWrong",
          "Something Went Wrong",
        );
    }
  };

  const getCustomContent = () => {
    return (
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>
              {getTranslation(
                messages,
                "audio.error.troubleshootingTips",
                "Troubleshooting Tips",
              )}
            </span>
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                {getTranslation(
                  messages,
                  "audio.error.checkConnection",
                  "Check your internet connection",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                {getTranslation(
                  messages,
                  "audio.error.refreshThePage",
                  "Try refreshing the page",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                {getTranslation(
                  messages,
                  "audio.error.clearCache",
                  "Clear your browser cache and cookies",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                {getTranslation(
                  messages,
                  "audio.error.disableAdBlockers",
                  "Disable ad blockers or browser extensions",
                )}
              </span>
            </li>
          </ul>

          {/* Audio-specific decorative elements */}
          <div className="flex items-center justify-center space-x-4 mt-6 opacity-50">
            <Music className="w-6 h-6 text-muted-foreground" />
            <Wifi className="w-6 h-6 text-muted-foreground" />
            <Server className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <EnhancedErrorState
        error={error}
        level={getErrorLevel()}
        title={getErrorTitle()}
        onRetry={onRetry}
        showDetails={showDetails}
        retryCount={retryCount}
        maxRetries={3}
        actionLabel={getTranslation(messages, "audio.error.tryAgain", "Try Again")}
        context={{ type, locale }}
        className="py-16"
      />
      
      {/* Custom audio-specific content */}
      {getCustomContent()}

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};
