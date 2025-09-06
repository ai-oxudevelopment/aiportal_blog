// frontend/src/components/ErrorBoundary.tsx
// Comprehensive error boundary component with retry functionality

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useUIStore } from '@/lib/stores';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundaryClass extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Add error notification to UI store
    if (typeof window !== 'undefined') {
      // We'll need to access the store from a hook component
      // This will be handled by the ErrorBoundaryWrapper
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError, retryCount } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
    }));
    this.resetErrorBoundary();
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          retryCount={retryCount}
          onRetry={this.handleRetry}
          onReset={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  retryCount: number;
  onRetry: () => void;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retryCount,
  onRetry,
  onReset,
}) => {
  const { addNotification } = useUIStore();

  React.useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
    }
  }, [error, addNotification]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again {retryCount > 0 && `(${retryCount})`}
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reset
          </button>
        </div>

        {retryCount > 2 && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            If the problem persists, please refresh the page or contact support.
          </p>
        )}
      </div>
    </div>
  );
};

// Wrapper component to provide store access
export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

// Specialized error boundaries for different use cases
export const AsyncErrorBoundary: React.FC<Props> = (props) => {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Loading Error
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>Failed to load content. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export const NetworkErrorBoundary: React.FC<Props> = (props) => {
  return (
    <ErrorBoundary
      {...props}
      fallback={
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Network Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Unable to connect to the server. Please check your internet connection.</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
