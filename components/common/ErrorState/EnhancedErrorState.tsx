"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { ErrorStateProps } from "./types";
import {
  ERROR_LEVEL_CONFIGS,
  ARIA_LABELS,
  SEO_ERROR_STRUCTURED_DATA,
} from "./constants";
import { ErrorHeader } from "./components/ErrorHeader";
import { ErrorDetails } from "./components/ErrorDetails";
import { ErrorActions } from "./components/ErrorActions";
import { useErrorReporting } from "./hooks/useErrorReporting";
import { useErrorRetry } from "./hooks/useErrorRetry";
import {
  getErrorLevel,
  getErrorTitle,
  shouldShowRetry,
  formatErrorForDisplay,
} from "./utils/errorUtils";

export const EnhancedErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  level,
  className = "",
  title,
  actionLabel = "Try Again",
  showReportButton = true,
  context = {},
  retryCount: initialRetryCount = 0,
  maxRetries = 3,
  autoRetry = false,
  retryDelay = 1000,
}) => {
  // Auto-detect error level if not provided
  const detectedLevel = level || getErrorLevel(error);
  const config = ERROR_LEVEL_CONFIGS[detectedLevel];

  // Auto-detect title if not provided
  const detectedTitle = title || getErrorTitle(error, detectedLevel);

  // Format error message for display
  const displayError = formatErrorForDisplay(error);

  // State management
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const errorContainerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { reportError } = useErrorReporting();
  const { handleRetry, isRetrying, retryCount, canRetry, resetRetry } =
    useErrorRetry(onRetry, {
      maxRetries,
      autoRetry,
      retryDelay,
      onRetrySuccess: () => {
        if (onDismiss) {
          onDismiss();
        }
      },
      onMaxRetriesReached: () => {
        // Could trigger additional error reporting or escalation
        console.error("Maximum retry attempts reached for error:", error);
      },
    });

  // Handlers
  const handleToggleDetails = useCallback(() => {
    setShowTechnicalDetails((prev) => !prev);
  }, []);

  const handleReport = useCallback(() => {
    reportError(error, context, retryCount);
  }, [reportError, error, context, retryCount]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Handle escape key to dismiss if possible
      if (event.key === "Escape" && onDismiss) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  // Effect for accessibility focus management
  useEffect(() => {
    if (errorContainerRef.current && detectedLevel === "critical") {
      errorContainerRef.current.focus();
    }
  }, [detectedLevel]);

  // Effect for SEO structured data
  useEffect(() => {
    if (typeof window !== "undefined" && detectedLevel === "critical") {
      const structuredData = {
        ...SEO_ERROR_STRUCTURED_DATA,
        name: detectedTitle,
        description:
          typeof displayError === "string"
            ? displayError
            : "Critical error occurred",
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [detectedLevel, detectedTitle, displayError]);

  // Determine if retry should be shown
  const showRetry = onRetry && shouldShowRetry(error) && canRetry;

  return (
    <div
      ref={errorContainerRef}
      className={`rounded-lg border p-6 ${config.bgColor} ${config.borderColor} ${className}`}
      role="alert"
      aria-live={detectedLevel === "critical" ? "assertive" : "polite"}
      aria-label={ARIA_LABELS.errorContainer}
      tabIndex={detectedLevel === "critical" ? -1 : undefined}
      onKeyDown={handleKeyDown}
    >
      <ErrorHeader
        level={detectedLevel}
        title={detectedTitle}
        error={displayError}
        textColor={config.textColor}
      />

      <ErrorDetails
        error={error}
        showDetails={showDetails}
        showTechnicalDetails={showTechnicalDetails}
        onToggleDetails={handleToggleDetails}
        textColor={config.textColor}
      />

      <ErrorActions
        onRetry={showRetry ? handleRetry : undefined}
        onDismiss={onDismiss}
        onReport={showReportButton ? handleReport : undefined}
        isRetrying={isRetrying}
        actionLabel={actionLabel}
        showReportButton={showReportButton}
        buttonColor={config.buttonColor}
        textColor={config.textColor}
      />

      {/* Screen reader only additional context */}
      <div className="sr-only">
        {retryCount > 0 && (
          <p>
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}{" "}
        {autoRetry && canRetry && <p>Automatic retry is enabled</p>}
        {typeof context === "object" && Object.keys(context).length > 0 && (
          <p>Error occurred in context: {Object.keys(context).join(", ")}</p>
        )}
      </div>
    </div>
  );
};

export default EnhancedErrorState;
