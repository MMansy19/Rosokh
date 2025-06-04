import React from "react";
import { ErrorDetailsProps } from "../types";
import { ARIA_LABELS } from "../constants";

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({
  error,
  showDetails,
  showTechnicalDetails,
  onToggleDetails,
  textColor,
}) => {
  const errorDetails = error instanceof Error ? error.stack : null;

  if (!errorDetails || (!showDetails && !showTechnicalDetails)) {
    return null;
  }

  return (
    <div className="mt-4">
      <details open={showTechnicalDetails}>
        <summary
          className={`cursor-pointer font-medium ${textColor} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          onClick={(e) => {
            e.preventDefault();
            onToggleDetails();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleDetails();
            }
          }}
          aria-label={ARIA_LABELS.toggleDetails}
          tabIndex={0}
        >
          Technical Details
        </summary>
        {showTechnicalDetails && (
          <pre
            className={`mt-2 text-xs ${textColor} bg-white bg-opacity-50 p-3 rounded border overflow-auto max-h-40`}
            aria-label={ARIA_LABELS.technicalDetails}
            role="region"
          >
            {errorDetails}
          </pre>
        )}
      </details>
    </div>
  );
};
