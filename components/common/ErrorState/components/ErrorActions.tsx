import React from "react";
import { ErrorActionsProps } from "../types";
import { ErrorActionButton, RetryButton } from "./ErrorActionButton";
import { ARIA_LABELS } from "../constants";

export const ErrorActions: React.FC<ErrorActionsProps> = ({
  onRetry,
  onDismiss,
  onReport,
  isRetrying,
  actionLabel,
  showReportButton,
  buttonColor,
  textColor,
}) => {
  const hasActions = onRetry || onDismiss || (showReportButton && onReport);

  if (!hasActions) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {onRetry && (
        <RetryButton
          onClick={onRetry}
          isRetrying={isRetrying}
          actionLabel={actionLabel}
          buttonColor={buttonColor}
        />
      )}

      {showReportButton && onReport && (
        <ErrorActionButton
          onClick={onReport}
          className={`border rounded-md focus:ring-blue-500 ${textColor} border-current hover:bg-white hover:bg-opacity-25`}
          ariaLabel={ARIA_LABELS.reportButton}
        >
          Report Issue
        </ErrorActionButton>
      )}

      {onDismiss && (
        <ErrorActionButton
          onClick={onDismiss}
          className={`border rounded-md focus:ring-blue-500 ${textColor} border-current hover:bg-white hover:bg-opacity-25`}
          ariaLabel={ARIA_LABELS.dismissButton}
        >
          Dismiss
        </ErrorActionButton>
      )}
    </div>
  );
};
