import React, { Component, ErrorInfo, ReactNode } from "react";
import { CriticalErrorState } from "./SpecializedErrorStates";
import { AppError, handleError } from "@/utils/errorHandling";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    retry: () => void,
  ) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  isolate?: boolean; // Whether to isolate the error to this boundary
  level?: "page" | "section" | "component";
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.group("🚨 Error Boundary Caught Error");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();

    // Call custom error handler
    if (onError && errorId) {
      onError(error, errorInfo, errorId);
    }

    // Report error in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo, errorId);
    }
  }

  private reportError = async (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string | null,
  ) => {
    try {
      const appError = handleError(error);
      const reportData = {
        errorId,
        error: appError.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        level: this.props.level || "component",
      };

      // In production, send to your error reporting service
      // await errorReportingService.report(reportData);
      console.log("Error Boundary Report:", reportData);
    } catch (reportingError) {
      console.error("Failed to report error boundary error:", reportingError);
    }
  };

  private handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    // Reset error state with a slight delay to ensure clean state
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }, 100);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, isolate = false } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback && errorInfo) {
        return fallback(error, errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div
          className={
            isolate ? "error-boundary-isolated" : "error-boundary-global"
          }
        >
          <CriticalErrorState
            error={error}
            onReload={this.handleRetry}
            context={{
              boundaryLevel: this.props.level || "component",
              componentStack: errorInfo?.componentStack,
              isolated: isolate,
            }}
          />
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for throwing errors that will be caught by error boundaries
export const useErrorHandler = () => {
  return (error: Error | string, context?: Record<string, any>) => {
    const errorToThrow = typeof error === "string" ? new Error(error) : error;

    if (context) {
      (errorToThrow as any).context = context;
    }

    throw errorToThrow;
  };
};
