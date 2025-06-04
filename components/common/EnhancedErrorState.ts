// This file maintains backward compatibility while using the new enhanced error state system

export {
  EnhancedErrorState,
  ErrorBoundary,
  withErrorBoundary,
  useErrorHandler,
  useErrorReporting,
  useErrorRetry,
  // Specialized error states
  NetworkErrorState,
  NotFoundErrorState,
  ServerErrorState,
  CriticalErrorState,
  AuthErrorState,
  ValidationErrorState,
  TimeoutErrorState,
} from "./ErrorState";

// Re-export types for convenience
export type { ErrorStateProps, ErrorLevel } from "./ErrorState";

// Legacy exports for backward compatibility
export { EnhancedErrorState as default } from "./ErrorState";
