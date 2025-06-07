import { useCallback } from 'react';
import { useErrorStore, AppError } from '../store/errorStore';

// Extract user-friendly message from error
export const getUserFriendlyMessage = (error: unknown, defaultMessage = 'An unexpected error occurred'): string => {
  if (error instanceof Error) {
    const message = error.message;
    
    // Map common error messages to user-friendly versions
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (message.includes('Unauthorized') || message.includes('401')) {
      return 'Your session has expired. Please sign in again.';
    }
    if (message.includes('Forbidden') || message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
    if (message.includes('Not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }
    if (message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Please check your input and try again.';
    }
    
    // For API errors with structured messages, return as-is if they seem user-friendly
    if (message.length < 100 && !message.includes('Error:') && !message.includes('Exception')) {
      return message;
    }
  }
  
  return defaultMessage;
};

// Extract technical details for debugging
export const getTechnicalDetails = (error: unknown): string => {
  if (error instanceof Error) {
    let details = `${error.name}: ${error.message}`;
    
    if (error.stack) {
      details += `\n\nStack trace:\n${error.stack}`;
    }
    
    // Add any additional properties
    const additionalProps = Object.keys(error).filter(key => 
      !['name', 'message', 'stack'].includes(key)
    );
    
    if (additionalProps.length > 0) {
      details += '\n\nAdditional properties:';
      additionalProps.forEach(prop => {
        details += `\n${prop}: ${(error as any)[prop]}`;
      });
    }
    
    return details;
  }
  
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  
  return String(error);
};

// Enhanced error handler hook with additional options
interface ErrorHandlerOptions {
  title?: string;
  showDetails?: boolean;
  customMessage?: string;
}

export const useErrorHandler = () => {
  const { addError } = useErrorStore();

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const { title, showDetails = false, customMessage } = options;
    
    const message = customMessage || getUserFriendlyMessage(error);
    const details = showDetails ? getTechnicalDetails(error) : undefined;
    
    addError({
      title,
      message,
      details,
    });
  }, [addError]);

  return { handleError };
};

// Utility functions for common error scenarios
export const createNetworkError = (customMessage?: string): Omit<AppError, 'id' | 'timestamp'> => ({
  title: 'Connection Error',
  message: customMessage || 'Unable to connect to the server. Please check your internet connection.',
});

export const createAuthError = (customMessage?: string): Omit<AppError, 'id' | 'timestamp'> => ({
  title: 'Authentication Error',
  message: customMessage || 'Your session has expired. Please sign in again.',
});

export const createValidationError = (customMessage?: string): Omit<AppError, 'id' | 'timestamp'> => ({
  title: 'Validation Error',
  message: customMessage || 'Please check your input and try again.',
});

export const createGeneralError = (customMessage?: string): Omit<AppError, 'id' | 'timestamp'> => ({
  title: 'Error',
  message: customMessage || 'An unexpected error occurred. Please try again.',
});

// Error boundary helper
export const reportErrorToBoundary = (error: Error, errorInfo: any) => {
  // Log to console for development
  console.error('Error caught by boundary:', error, errorInfo);
  
  // In production, this could be sent to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // errorReportingService.report(error, errorInfo);
  }
};

// Network status error helpers
export const createOfflineError = (): Omit<AppError, 'id' | 'timestamp'> => ({
  title: 'Offline',
  message: 'You are currently offline. Some features may not work.',
});

export const createOnlineError = (): Omit<AppError, 'id' | 'timestamp'> => ({
  title: 'Connection Restored',
  message: 'Connection restored',
});
