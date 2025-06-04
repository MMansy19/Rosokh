import { Notification } from '../contexts/GlobalContext';

export type ErrorType = 'network' | 'server' | 'validation' | 'auth' | 'notFound' | 'general';

export abstract class AppError extends Error {
  abstract type: ErrorType;
  code?: string;
  statusCode?: number;
  details?: any;
  retry?: boolean;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NetworkError extends AppError {
  type: ErrorType = 'network';
  retry = true;
  
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends AppError {
  type: ErrorType = 'server';
  retry = true;
  
  constructor(message: string, public statusCode?: number, public code?: string) {
    super(message);
    this.name = 'ServerError';
  }
}

export class ValidationError extends AppError {
  type: ErrorType = 'validation';
  retry = false;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  type: ErrorType = 'notFound';
  retry = false;
  
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AuthError extends AppError {
  type: ErrorType = 'auth';
  retry = false;
  
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

export class GeneralError extends AppError {
  type: ErrorType = 'general';
  retry = false;
  
  constructor(message: string = 'An unknown error occurred') {
    super(message);
    this.name = 'GeneralError';
  }
}

// Error handler utility
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Try to infer error type from message or properties
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error.message);
    }
    
    if (error.message.includes('404') || error.message.includes('not found')) {
      return new NotFoundError(error.message);
    }
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return new AuthError(error.message);
    }
      if (error.message.includes('500') || error.message.includes('server')) {
      return new ServerError(error.message);
    }
    
    // Convert generic error to AppError
    return new GeneralError(error.message);
  }
  
  // Handle non-Error objects
  const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';
  return new GeneralError(errorMessage);
}

// Convert error to notification
export function errorToNotification(error: AppError, messages: any = {}): Omit<Notification, 'id'> {
  const getErrorTitle = (type: ErrorType): string => {
    const titles = {
      network: messages?.error?.connectionError || 'Connection Error',
      server: messages?.error?.serverError || 'Server Error',
      validation: messages?.error?.validationError || 'Validation Error',
      auth: messages?.error?.authError || 'Authentication Error',
      notFound: messages?.error?.notFound || 'Not Found',
      general: messages?.error?.somethingWentWrong || 'Something Went Wrong',
    };
    return titles[type];
  };

  const getErrorMessage = (error: AppError): string => {
    switch (error.type) {
      case 'network':
        return messages?.error?.networkMessage || 'Please check your internet connection and try again.';
      case 'server':
        return messages?.error?.serverMessage || 'Our servers are experiencing issues. Please try again later.';
      case 'validation':
        return error.message;
      case 'auth':
        return messages?.error?.authMessage || 'Please log in to continue.';
      case 'notFound':
        return messages?.error?.notFoundMessage || 'The requested resource could not be found.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return {
    type: 'error',
    title: getErrorTitle(error.type),
    message: getErrorMessage(error),
    duration: 0, // Don't auto-dismiss errors
    action: error.retry ? {
      label: messages?.error?.retry || 'Retry',
      onClick: () => window.location.reload(),
    } : undefined,
  };
}

// Async error handler wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  onError?: (error: AppError) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error);
    
    if (onError) {
      onError(appError);
    }
    
    // Log error for debugging
    console.error(`[${appError.type}] ${appError.name}:`, appError.message, appError);
    
    return null;
  }
}

// Retry utility
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
  onRetry?: (attempt: number, error: AppError) => void
): Promise<T> {
  let lastError: AppError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleError(error);
      
      if (attempt === maxAttempts || !lastError.retry) {
        throw lastError;
      }
      
      if (onRetry) {
        onRetry(attempt, lastError);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
}
