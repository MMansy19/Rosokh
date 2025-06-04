import { useCallback } from "react";
import { useNotifications } from "@/contexts/GlobalContext";
import { ErrorReportData } from "../types";
import { AppError } from "@/utils/errorHandling";

export const useErrorReporting = () => {
  const { notify } = useNotifications();

  const generateReportData = useCallback(
    (
      error: Error | AppError | string,
      context: Record<string, any> = {},
      retryCount?: number,
    ): ErrorReportData => {
      const errorMessage = typeof error === "string" ? error : error.message;
      const errorStack = error instanceof Error ? error.stack : null;
      const errorType = error instanceof AppError ? error.type : "unknown";

      return {
        error: errorMessage,
        stack: errorStack,
        context,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        retryCount,
        errorType,
        // These would be filled by your auth system
        userId: context.userId || "anonymous",
        sessionId: context.sessionId || "unknown",
      };
    },
    [],
  );
  const reportError = useCallback(
    async (
      error: Error | AppError | string,
      context: Record<string, any> = {},
      retryCount?: number,
    ): Promise<void> => {
      try {
        const reportData = generateReportData(error, context, retryCount);

        // In production, send to your error reporting service
        // await errorReportingService.report(reportData);

        // For development, log to console
        if (process.env.NODE_ENV === "development") {
          console.group("🐛 Error Report");
          console.error("Error:", reportData.error);
          console.info("Report Data:", reportData);
          console.groupEnd();
        }

        notify.success(
          "Error report sent. Thank you for helping us improve!",
          "Report Sent",
        );
      } catch (reportingError) {
        console.error("Failed to report error:", reportingError);

        notify.error(
          "Failed to send error report. Please try again.",
          "Report Failed",
        );
      }
    },
    [generateReportData, notify],
  );

  return { reportError, generateReportData };
};
