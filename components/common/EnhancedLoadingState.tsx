"use client";
import React, { useEffect, useState } from "react";
import { useGlobalLoading, useAccessibility } from "@/contexts/GlobalContext";

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  timeout?: number;
  onTimeout?: () => void;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "skeleton" | "pulse" | "dots";
  className?: string;
}

export const EnhancedLoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  showProgress = false,
  showCancel = false,
  onCancel,
  timeout,
  onTimeout,
  size = "medium",
  variant = "spinner",
  className = "",
}) => {
  const loading = useGlobalLoading();
  const accessibility = useAccessibility();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle timeout
  useEffect(() => {
    if (!timeout) return;

    const timer = setTimeout(() => {
      setTimeoutReached(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  // Simulate progress for better UX
  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [showProgress]);

  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const renderSpinner = () => (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
    />
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-gray-200 rounded animate-pulse ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-blue-600 rounded-full ${size === "small" ? "w-1 h-1" : size === "medium" ? "w-2 h-2" : "w-3 h-3"}`}
          style={{
            animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite both`,
          }}
        />
      ))}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "skeleton":
        return renderSkeleton();
      case "pulse":
        return renderPulse();
      case "dots":
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  // Respect reduced motion preference
  const shouldAnimate = !accessibility.reducedMotion;

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {shouldAnimate && <div className="mb-4">{renderVariant()}</div>}
      <p className="text-gray-600 text-center mb-4">
        {timeoutReached ? "This is taking longer than expected..." : message}
      </p>
      {showProgress && (
        <div className="w-full max-w-xs mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
      {(showCancel || timeoutReached) && onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Cancel loading operation"
        >
          Cancel
        </button>
      )}{" "}
      {/* Screen reader announcements */}
      <div className="sr-only">
        {loading.isLoading && loading.message && (
          <div>Currently loading: {loading.message}</div>
        )}
      </div>
    </div>
  );
};

// Specialized loading components
export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded animate-pulse ${
          i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
        }`}
      />
    ))}
  </div>
);

export const InlineLoader: React.FC<{
  message?: string;
  size?: "small" | "medium";
}> = ({ message = "Loading...", size = "small" }) => (
  <span className="inline-flex items-center space-x-2">
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${
        size === "small" ? "w-3 h-3" : "w-4 h-4"
      }`}
    />
    <span className="text-sm text-gray-600">{message}</span>
  </span>
);

export const FullPageLoader: React.FC<{ message?: string }> = ({
  message = "Loading application...",
}) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <EnhancedLoadingState
      message={message}
      size="large"
      variant="spinner"
      showProgress
    />
  </div>
);
