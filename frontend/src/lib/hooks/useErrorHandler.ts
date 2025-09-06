// frontend/src/lib/hooks/useErrorHandler.ts
// Comprehensive error handling hook with retry logic and user feedback

'use client';

import { useCallback, useState } from 'react';
import { StrapiAPIError, NetworkError } from '../strapi';
import { useNotifications } from '@/components/NotificationSystem';
import type { HookError } from '../hooks';

interface ErrorHandlerOptions {
  showNotification?: boolean;
  logError?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: HookError) => void;
  onRetry?: () => void;
  onSuccess?: () => void;
}

interface ErrorHandlerState {
  error: HookError | null;
  isRetrying: boolean;
  retryCount: number;
  lastError: Date | null;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showNotification = true,
    logError = true,
    retryable = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onSuccess,
  } = options;

  const [state, setState] = useState<ErrorHandlerState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  });

  const { notify } = useNotifications();

  const createError = useCallback((err: unknown): HookError => {
    if (err instanceof StrapiAPIError) {
      return {
        message: err.message,
        type: 'api',
        status: err.status,
        retryable: err.status >= 500 || err.status === 429,
      };
    }
    
    if (err instanceof NetworkError) {
      return {
        message: err.message,
        type: 'network',
        retryable: true,
      };
    }
    
    return {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
      type: 'unknown',
      retryable: false,
    };
  }, []);

  const handleError = useCallback((err: unknown) => {
    const error = createError(err);
    
    setState(prev => ({
      ...prev,
      error,
      lastError: new Date(),
    }));

    if (logError) {
      console.error('Error handled:', error, err);
    }

    if (showNotification) {
      const notificationMessage = getErrorMessage(error);
      notify.error(notificationMessage);
    }

    onError?.(error);
  }, [createError, logError, showNotification, notify, onError]);

  const getErrorMessage = (error: HookError): string => {
    switch (error.type) {
      case 'network':
        return 'Network connection failed. Please check your internet connection and try again.';
      case 'api':
        if (error.status === 404) {
          return 'The requested resource was not found.';
        }
        if (error.status === 403) {
          return 'You do not have permission to access this resource.';
        }
        if (error.status === 401) {
          return 'Please log in to access this resource.';
        }
        if (error.status >= 500) {
          return 'Server error occurred. Please try again later.';
        }
        return error.message;
      case 'validation':
        return 'Please check your input and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (!retryable || state.retryCount >= maxRetries) {
      return;
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay * state.retryCount));
      await retryFunction();
      
      setState(prev => ({
        ...prev,
        error: null,
        isRetrying: false,
        retryCount: 0,
      }));

      onSuccess?.();
    } catch (err) {
      setState(prev => ({
        ...prev,
        isRetrying: false,
      }));

      if (state.retryCount < maxRetries) {
        handleError(err);
      } else {
        const error = createError(err);
        setState(prev => ({
          ...prev,
          error: { ...error, retryable: false },
        }));
      }
    }

    onRetry?.();
  }, [retryable, maxRetries, retryDelay, state.retryCount, handleError, createError, onSuccess, onRetry]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      retryCount: 0,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastError: null,
    });
  }, []);

  return {
    error: state.error,
    isRetrying: state.isRetrying,
    retryCount: state.retryCount,
    lastError: state.lastError,
    handleError,
    retry,
    clearError,
    reset,
    canRetry: retryable && state.retryCount < maxRetries && state.error?.retryable,
  };
};

// Specialized error handlers for common use cases
export const useAsyncErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const errorHandler = useErrorHandler(options);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    retryFunction?: () => Promise<T>
  ): Promise<T | null> => {
    try {
      const result = await asyncFunction();
      errorHandler.clearError();
      return result;
    } catch (err) {
      errorHandler.handleError(err);
      
      if (retryFunction && errorHandler.canRetry) {
        return new Promise((resolve) => {
          errorHandler.retry(async () => {
            try {
              const retryResult = await retryFunction();
              resolve(retryResult);
            } catch (retryErr) {
              errorHandler.handleError(retryErr);
              resolve(null);
            }
          });
        });
      }
      
      return null;
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    executeWithErrorHandling,
  };
};

// Hook for handling form errors
export const useFormErrorHandler = () => {
  const errorHandler = useErrorHandler({
    showNotification: false, // Form errors are handled inline
    logError: true,
  });

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    if (!errorHandler.error) return undefined;
    
    // This would be expanded based on your form validation library
    // For now, return the general error message
    return errorHandler.error.message;
  }, [errorHandler.error]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!getFieldError(fieldName);
  }, [getFieldError]);

  return {
    ...errorHandler,
    getFieldError,
    hasFieldError,
  };
};

// Hook for handling API errors with specific error types
export const useAPIErrorHandler = () => {
  const errorHandler = useErrorHandler({
    showNotification: true,
    logError: true,
    retryable: true,
  });

  const handleAPIError = useCallback((err: unknown) => {
    const error = errorHandler.createError ? errorHandler.createError(err) : {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
      type: 'api' as const,
      retryable: false,
    };

    // Handle specific API error cases
    if (error.type === 'api' && error.status) {
      switch (error.status) {
        case 401:
          // Handle unauthorized - redirect to login
          notify.error('Please log in to continue');
          // You could add redirect logic here
          break;
        case 403:
          notify.error('You do not have permission to perform this action');
          break;
        case 404:
          notify.error('The requested resource was not found');
          break;
        case 429:
          notify.error('Too many requests. Please wait a moment and try again');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          notify.error('Server error. Please try again later');
          break;
        default:
          notify.error(error.message);
      }
    } else {
      errorHandler.handleError(err);
    }
  }, [errorHandler, notify]);

  return {
    ...errorHandler,
    handleAPIError,
  };
};
