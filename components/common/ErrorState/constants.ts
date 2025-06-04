import { ErrorLevel, ErrorLevelConfig } from "./types";

export const ERROR_LEVEL_CONFIGS: Record<ErrorLevel, ErrorLevelConfig> = {
  info: {
    icon: "ℹ️",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    iconLabel: "info icon",
  },
  warning: {
    icon: "⚠️",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    iconLabel: "warning icon",
  },
  error: {
    icon: "❌",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    buttonColor: "bg-red-600 hover:bg-red-700",
    iconLabel: "error icon",
  },
  critical: {
    icon: "🚨",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    textColor: "text-red-900",
    buttonColor: "bg-red-700 hover:bg-red-800",
    iconLabel: "critical error icon",
  },
};

export const DEFAULT_ERROR_TITLES: Record<ErrorLevel, string> = {
  info: "Information",
  warning: "Warning",
  error: "Error Occurred",
  critical: "Critical Error",
};

export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  autoRetry: false,
};

export const ARIA_LABELS = {
  errorContainer: "Error message",
  retryButton: "Retry operation",
  reportButton: "Report this error",
  dismissButton: "Dismiss error",
  toggleDetails: "Toggle technical details",
  technicalDetails: "Technical error details",
};

export const SEO_ERROR_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebPageElement",
  name: "Error State",
  description: "Error information and recovery options",
};
