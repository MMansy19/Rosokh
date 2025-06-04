import React from "react";
import { ErrorLevel, ErrorLevelConfig } from "../types";
import { ERROR_LEVEL_CONFIGS } from "../constants";

interface ErrorIconProps {
  level: ErrorLevel;
  className?: string;
}

export const ErrorIcon: React.FC<ErrorIconProps> = ({
  level,
  className = "",
}) => {
  const config: ErrorLevelConfig = ERROR_LEVEL_CONFIGS[level];

  return (
    <div className={`flex-shrink-0 ${className}`}>
      <span className="text-2xl" role="img" aria-label={config.iconLabel}>
        {config.icon}
      </span>
    </div>
  );
};
