import React, { Component, ReactNode, ErrorInfo } from "react";
import { AppError, GeneralError } from "@/utils/errorHandling";

interface Props {
  children: ReactNode;
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    retry: () => void,
  ) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "page" | "section" | "component";
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = "component" } = this.props;
    // Enhanced error information
    const enhancedError = new GeneralError(`${level} Error: ${error.message}`);

    // Add context information
    const errorContext = {
      level,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      props: this.props,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    };

    // Store error info in state
    this.setState({ errorInfo });

    // Report error
    if (onError) {
      onError(enhancedError, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 ErrorBoundary: ${level} Error`);
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Context:", errorContext);
      console.groupEnd();
    }

    // Report to external service (placeholder)
    this.reportError(enhancedError, errorContext);
  }

  private reportError = async (error: AppError, context: any) => {
    // Placeholder for error reporting service
    // In a real app, you'd send this to Sentry, LogRocket, etc.
    try {
      // await errorReportingService.report(error, context);
      console.log("Error reported:", { error: error.message, context });
    } catch (reportingError) {
      console.warn("Failed to report error:", reportingError);
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: retryCount + 1,
      });
    }
  };

  private renderDefaultFallback = (
    error: Error,
    errorInfo: ErrorInfo | null,
    canRetry: boolean,
  ) => {
    const { level = "component" } = this.props;

    return (
      <div
        className="error-boundary"
        role="alert"
        aria-live="assertive"
        style={{
          padding: "1rem",
          margin: "1rem 0",
          border: "1px solid #fee",
          borderRadius: "0.5rem",
          backgroundColor: "#fef2f2",
          color: "#dc2626",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>
            {level === "page"
              ? "Page Error"
              : level === "section"
                ? "Section Error"
                : "Component Error"}
          </h3>
        </div>

        <p style={{ margin: "0.5rem 0" }}>
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong. Please try again."}
        </p>

        {canRetry && (
          <button
            onClick={this.handleRetry}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              marginRight: "0.5rem",
            }}
            aria-label="Retry loading this component"
          >
            Try Again ({this.maxRetries - this.state.retryCount} attempts left)
          </button>
        )}

        {process.env.NODE_ENV === "development" && errorInfo && (
          <details style={{ marginTop: "1rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              Technical Details (Development)
            </summary>
            <pre
              style={{
                fontSize: "0.8rem",
                overflow: "auto",
                padding: "0.5rem",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "0.25rem",
                marginTop: "0.5rem",
              }}
            >
              {error.stack}
            </pre>
            <pre
              style={{
                fontSize: "0.8rem",
                overflow: "auto",
                padding: "0.5rem",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "0.25rem",
                marginTop: "0.5rem",
              }}
            >
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    );
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, isolate = false } = this.props;

    if (hasError && error) {
      const canRetry = retryCount < this.maxRetries;

      if (fallback) {
        return fallback(error, errorInfo!, this.handleRetry);
      }

      return this.renderDefaultFallback(error, errorInfo, canRetry);
    }

    // Wrap children in isolation container if requested
    if (isolate) {
      return <div style={{ isolation: "isolate" }}>{children}</div>;
    }

    return children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Specialized error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary level="page" isolate>
    {children}
  </ErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="section">{children}</ErrorBoundary>;

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="component">{children}</ErrorBoundary>;
