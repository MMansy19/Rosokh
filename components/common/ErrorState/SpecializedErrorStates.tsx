import React from "react";
import { EnhancedErrorState } from "./EnhancedErrorState";
import {
  NetworkError,
  NotFoundError,
  ServerError,
} from "@/utils/errorHandling";

// Network Error State with offline detection
interface NetworkErrorStateProps {
  onRetry?: () => void;
  isOffline?: boolean;
  context?: Record<string, any>;
}

export const NetworkErrorState: React.FC<NetworkErrorStateProps> = ({
  onRetry,
  isOffline,
  context = {},
}) => {
  const error = isOffline
    ? new NetworkError("You're offline. Please check your internet connection.")
    : new NetworkError("Network error occurred. Please try again.");

  return (
    <EnhancedErrorState
      error={error}
      onRetry={onRetry}
      level="warning"
      title="Connection Problem"
      actionLabel="Retry"
      context={{ ...context, isOffline }}
      autoRetry={!isOffline}
      maxRetries={isOffline ? 1 : 3}
    />
  );
};

// Not Found Error State
interface NotFoundErrorStateProps {
  resource?: string;
  onGoBack?: () => void;
  context?: Record<string, any>;
}

export const NotFoundErrorState: React.FC<NotFoundErrorStateProps> = ({
  resource = "resource",
  onGoBack,
  context = {},
}) => {
  const error = new NotFoundError(
    `The requested ${resource} could not be found.`,
  );

  return (
    <EnhancedErrorState
      error={error}
      onRetry={onGoBack}
      level="info"
      title="Not Found"
      actionLabel="Go Back"
      showReportButton={false}
      context={{ ...context, resource }}
    />
  );
};

// Server Error State
interface ServerErrorStateProps {
  onRetry?: () => void;
  statusCode?: number;
  context?: Record<string, any>;
}

export const ServerErrorState: React.FC<ServerErrorStateProps> = ({
  onRetry,
  statusCode,
  context = {},
}) => {
  const error = new ServerError(
    "Server error occurred. Our team has been notified.",
    statusCode,
  );

  return (
    <EnhancedErrorState
      error={error}
      onRetry={onRetry}
      level="error"
      title="Server Error"
      actionLabel="Try Again"
      context={{ ...context, statusCode }}
      autoRetry={statusCode !== 500} // Don't auto-retry on 500 errors
      maxRetries={statusCode && statusCode >= 500 ? 1 : 3}
    />
  );
};

// Critical Error State with page reload
interface CriticalErrorStateProps {
  error: Error;
  onReload?: () => void;
  context?: Record<string, any>;
}

export const CriticalErrorState: React.FC<CriticalErrorStateProps> = ({
  error,
  onReload,
  context = {},
}) => {
  const handleReload =
    onReload ||
    (() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });

  return (
    <EnhancedErrorState
      error={error}
      onRetry={handleReload}
      level="critical"
      title="Critical Error"
      actionLabel="Reload Page"
      showDetails={process.env.NODE_ENV === "development"}
      context={{ ...context, isCritical: true }}
      maxRetries={1} // Only allow one reload attempt
    />
  );
};

// Authentication Error State
interface AuthErrorStateProps {
  onLogin?: () => void;
  onRetry?: () => void;
  context?: Record<string, any>;
}

export const AuthErrorState: React.FC<AuthErrorStateProps> = ({
  onLogin,
  onRetry,
  context = {},
}) => {
  return (
    <EnhancedErrorState
      error="Authentication required. Please log in to continue."
      onRetry={onLogin || onRetry}
      level="warning"
      title="Authentication Required"
      actionLabel={onLogin ? "Log In" : "Retry"}
      showReportButton={false}
      context={{ ...context, requiresAuth: true }}
    />
  );
};

// Validation Error State
interface ValidationErrorStateProps {
  errors: string[] | Record<string, string>;
  onDismiss?: () => void;
  context?: Record<string, any>;
}

export const ValidationErrorState: React.FC<ValidationErrorStateProps> = ({
  errors,
  onDismiss,
  context = {},
}) => {
  const errorMessage = Array.isArray(errors)
    ? errors.join(", ")
    : Object.values(errors).join(", ");

  return (
    <EnhancedErrorState
      error={`Validation failed: ${errorMessage}`}
      onDismiss={onDismiss}
      level="warning"
      title="Validation Error"
      showReportButton={false}
      context={{ ...context, validationErrors: errors }}
    />
  );
};

// Timeout Error State
interface TimeoutErrorStateProps {
  onRetry?: () => void;
  timeout?: number;
  context?: Record<string, any>;
}

export const TimeoutErrorState: React.FC<TimeoutErrorStateProps> = ({
  onRetry,
  timeout,
  context = {},
}) => {
  const timeoutMessage = timeout
    ? `Request timed out after ${timeout}ms. Please try again.`
    : "Request timed out. Please try again.";

  return (
    <EnhancedErrorState
      error={timeoutMessage}
      onRetry={onRetry}
      level="warning"
      title="Request Timeout"
      actionLabel="Retry"
      context={{ ...context, timeout }}
      autoRetry={true}
      maxRetries={2}
      retryDelay={2000}
    />
  );
};
