import React from "react";
import { ErrorLevel } from "../types";
import { ErrorIcon } from "./ErrorIcon";
import { DEFAULT_ERROR_TITLES } from "../constants";

interface ErrorHeaderProps {
  level: ErrorLevel;
  title?: string;
  error: Error | string;
  textColor: string;
  className?: string;
}

export const ErrorHeader: React.FC<ErrorHeaderProps> = ({
  level,
  title,
  error,
  textColor,
  className = "",
}) => {
  const errorMessage =
    typeof error === "string"
      ? error
      : error.message || "An unexpected error occurred";
  const displayTitle = title || DEFAULT_ERROR_TITLES[level];

  return (
    <div className={`flex items-start ${className}`}>
      <ErrorIcon level={level} />

      <div className="ml-3 flex-1">
        <h3 className={`text-lg font-medium ${textColor}`}>{displayTitle}</h3>

        <div className={`mt-2 text-sm ${textColor}`}>
          <p>{errorMessage}</p>
        </div>
      </div>
    </div>
  );
};
