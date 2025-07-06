import React from "react";
import { ErrorActionButtonProps } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";

export const ErrorActionButton: React.FC<ErrorActionButtonProps> = ({
  onClick,
  disabled = false,
  className,
  ariaLabel,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  );
};

interface RetryButtonProps {
  onClick: () => void;
  isRetrying: boolean;
  actionLabel: string;
  buttonColor: string;
  retryCount?: number;
  maxRetries?: number;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onClick,
  isRetrying,
  actionLabel,
  buttonColor,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const canRetry = retryCount < maxRetries;
  const retryText =
    retryCount > 0
      ? `${actionLabel} (${retryCount}/${maxRetries})`
      : actionLabel;

  return (
    <ErrorActionButton
      onClick={onClick}
      disabled={isRetrying || !canRetry}
      className={`text-foreground focus:ring-blue-500 ${buttonColor}`}
      ariaLabel={isRetrying ? "Retrying..." : retryText}
    >
      {isRetrying ? (
        <span className="flex items-center">
          <LoadingSpinner className="-ml-1 mr-2 text-foreground" />
          Retrying...
        </span>
      ) : (
        retryText
      )}
    </ErrorActionButton>
  );
};
