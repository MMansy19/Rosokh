import { AppError, ErrorType } from "@/utils/errorHandling";
import { ErrorLevel } from "../types";

export const getErrorLevel = (error: Error | AppError | string): ErrorLevel => {
  if (typeof error === "string") {
    return "error";
  }

  if (error instanceof AppError) {
    switch (error.type) {
      case "network":
        return "warning";
      case "server":
        return "error";
      case "validation":
        return "warning";
      case "auth":
        return "warning";
      case "notFound":
        return "info";
      default:
        return "error";
    }
  }

  // Check error message for patterns
  const message = error.message.toLowerCase();

  if (message.includes("network") || message.includes("connection")) {
    return "warning";
  }

  if (message.includes("not found") || message.includes("404")) {
    return "info";
  }

  if (
    message.includes("unauthorized") ||
    message.includes("403") ||
    message.includes("401")
  ) {
    return "warning";
  }

  if (message.includes("server") || message.includes("500")) {
    return "error";
  }

  return "error";
};

export const getErrorTitle = (
  error: Error | AppError | string,
  level: ErrorLevel,
): string => {
  if (error instanceof AppError) {
    switch (error.type) {
      case "network":
        return "Connection Problem";
      case "server":
        return "Server Error";
      case "validation":
        return "Validation Error";
      case "auth":
        return "Authentication Required";
      case "notFound":
        return "Not Found";
      default:
        return "Error Occurred";
    }
  }

  const message = typeof error === "string" ? error : error.message;

  if (message.includes("network") || message.includes("connection")) {
    return "Connection Problem";
  }

  if (message.includes("not found") || message.includes("404")) {
    return "Not Found";
  }

  if (
    message.includes("unauthorized") ||
    message.includes("403") ||
    message.includes("401")
  ) {
    return "Authentication Required";
  }

  if (message.includes("server") || message.includes("500")) {
    return "Server Error";
  }

  return level === "critical" ? "Critical Error" : "Error Occurred";
};

export const shouldShowRetry = (error: Error | AppError | string): boolean => {
  if (error instanceof AppError) {
    return error.retry !== false;
  }

  const message = typeof error === "string" ? error : error.message;
  const lowerMessage = message.toLowerCase();

  // Don't retry validation errors or auth errors
  if (
    lowerMessage.includes("validation") ||
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("403") ||
    lowerMessage.includes("invalid")
  ) {
    return false;
  }

  return true;
};

export const getRetryDelay = (
  retryCount: number,
  baseDelay: number = 1000,
): number => {
  return Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Cap at 30 seconds
};

export const formatErrorForDisplay = (
  error: Error | AppError | string,
): string => {
  if (typeof error === "string") {
    return error;
  }

  let message = error.message || "An unexpected error occurred";

  // Clean up common technical error messages for user display
  if (message.includes("fetch")) {
    message =
      "Failed to load data. Please check your connection and try again.";
  }

  if (message.includes("TypeError: Failed to fetch")) {
    message =
      "Unable to connect to the server. Please check your internet connection.";
  }

  if (message.includes("AbortError")) {
    message = "Request was cancelled. Please try again.";
  }

  return message;
};
