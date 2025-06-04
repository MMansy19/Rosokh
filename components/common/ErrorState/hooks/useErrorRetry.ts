import { useState, useCallback, useRef, useEffect } from "react";
import { useNotifications, useGlobalLoading } from "@/contexts/GlobalContext";
import { DEFAULT_RETRY_CONFIG } from "../constants";

interface UseErrorRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  onRetrySuccess?: () => void;
  onRetryFailed?: (error: Error) => void;
  onMaxRetriesReached?: () => void;
}

export const useErrorRetry = (
  onRetry: (() => void | Promise<void>) | undefined,
  options: UseErrorRetryOptions = {},
) => {
  const {
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    retryDelay = DEFAULT_RETRY_CONFIG.retryDelay,
    autoRetry = DEFAULT_RETRY_CONFIG.autoRetry,
    onRetrySuccess,
    onRetryFailed,
    onMaxRetriesReached,
  } = options;
  const { addNotification } = useNotifications();
  const { setLoading } = useGlobalLoading();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const executeRetry = useCallback(async (): Promise<boolean> => {
    if (!onRetry || isRetrying || retryCount >= maxRetries) {
      return false;
    }

    try {
      setIsRetrying(true);
      setLoading(true, "Retrying operation...");

      await onRetry();
      addNotification({
        type: "success",
        title: "Success",
        message: "Operation completed successfully",
        priority: "medium",
        duration: 3000,
      });

      setRetryCount(0);
      onRetrySuccess?.();
      return true;
    } catch (retryError) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      const errorMessage =
        retryError instanceof Error ? retryError.message : "Retry failed";

      if (newRetryCount >= maxRetries) {
        addNotification({
          type: "error",
          title: "Retry Failed",
          message: `Maximum retry attempts reached. ${errorMessage}`,
          priority: "high",
          duration: 0, // Don't auto-dismiss
        });
        onMaxRetriesReached?.();
      } else {
        addNotification({
          type: "warning",
          title: "Retry Failed",
          message: `Retry ${newRetryCount} failed. ${maxRetries - newRetryCount} attempts remaining.`,
          priority: "medium",
          duration: 5000,
        });
      }

      onRetryFailed?.(
        retryError instanceof Error ? retryError : new Error(errorMessage),
      );
      return false;
    } finally {
      setIsRetrying(false);
      setLoading(false);
    }
  }, [
    onRetry,
    isRetrying,
    retryCount,
    maxRetries,
    addNotification,
    setLoading,
    onRetrySuccess,
    onRetryFailed,
    onMaxRetriesReached,
  ]);

  const handleRetry = useCallback(async () => {
    clearRetryTimeout();
    await executeRetry();
  }, [executeRetry, clearRetryTimeout]);

  const scheduleAutoRetry = useCallback(() => {
    if (!autoRetry || retryCount >= maxRetries || isRetrying) {
      return;
    }

    clearRetryTimeout();

    const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff
    addNotification({
      type: "info",
      title: "Auto Retry",
      message: `Auto-retry in ${Math.ceil(delay / 1000)} seconds...`,
      priority: "low",
      duration: delay,
    });

    retryTimeoutRef.current = setTimeout(() => {
      executeRetry();
    }, delay);
  }, [
    autoRetry,
    retryCount,
    maxRetries,
    isRetrying,
    retryDelay,
    executeRetry,
    addNotification,
    clearRetryTimeout,
  ]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    clearRetryTimeout();
  }, [clearRetryTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRetryTimeout();
    };
  }, [clearRetryTimeout]);

  // Auto-retry effect
  useEffect(() => {
    if (autoRetry && retryCount > 0 && retryCount < maxRetries && !isRetrying) {
      scheduleAutoRetry();
    }
  }, [autoRetry, retryCount, maxRetries, isRetrying, scheduleAutoRetry]);

  return {
    handleRetry,
    isRetrying,
    retryCount,
    canRetry: retryCount < maxRetries && !isRetrying,
    resetRetry,
    scheduleAutoRetry,
  };
};
