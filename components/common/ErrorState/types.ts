import { AppError } from "@/utils/errorHandling";

export type ErrorLevel = "info" | "warning" | "error" | "critical";

export interface ErrorStateProps {
  error: Error | AppError | string;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  showDetails?: boolean;
  level?: ErrorLevel;
  className?: string;
  title?: string;
  actionLabel?: string;
  showReportButton?: boolean;
  context?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
  autoRetry?: boolean;
  retryDelay?: number;
}

export interface ErrorLevelConfig {
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  buttonColor: string;
  iconLabel: string;
}

export interface ErrorActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className: string;
  ariaLabel: string;
  children: React.ReactNode;
}

export interface ErrorDetailsProps {
  error: Error | AppError | string;
  showDetails: boolean;
  showTechnicalDetails: boolean;
  onToggleDetails: () => void;
  textColor: string;
}

export interface ErrorActionsProps {
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  onReport?: () => void;
  isRetrying: boolean;
  actionLabel: string;
  showReportButton: boolean;
  buttonColor: string;
  textColor: string;
}

export interface ErrorReportData {
  error: string;
  stack?: string | null;
  context: Record<string, any>;
  timestamp: string;
  userAgent: string;
  url: string;
  retryCount?: number;
  errorType?: string;
  userId?: string;
  sessionId?: string;
}
