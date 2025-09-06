// frontend/src/components/ErrorHandlingExample.tsx
// Example component demonstrating comprehensive error handling and loading states

'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { 
  LoadingButton, 
  InlineLoading, 
  RetryComponent,
  GlobalLoading 
} from './LoadingStates';
import { useNotifications } from './NotificationSystem';
import { useErrorHandler, useLoadingState } from '@/lib/hooks';

// Example component that might fail
const ProblematicComponent: React.FC<{ shouldFail?: boolean }> = ({ shouldFail = false }) => {
  if (shouldFail) {
    throw new Error('This component intentionally failed!');
  }
  
  return (
    <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-md">
      <p className="text-green-800 dark:text-green-200">
        This component is working correctly!
      </p>
    </div>
  );
};

// Example component with loading states
const LoadingExample: React.FC = () => {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState({
    initialMessage: 'Preparing...',
  });

  const simulateAsyncOperation = async (delay: number = 2000) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return 'Operation completed!';
  };

  const handleSimpleLoading = async () => {
    startLoading('Loading data...');
    await simulateAsyncOperation();
    stopLoading();
  };

  const handleWithLoading = async () => {
    const result = await withLoading(
      () => simulateAsyncOperation(),
      'Processing with loading wrapper...'
    );
    console.log('Result:', result);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Loading States Example</h3>
      
      <div className="flex gap-4">
        <LoadingButton
          loading={isLoading}
          onClick={handleSimpleLoading}
        >
          Simple Loading
        </LoadingButton>
        
        <LoadingButton
          loading={isLoading}
          onClick={handleWithLoading}
        >
          With Loading Wrapper
        </LoadingButton>
      </div>

      {isLoading && (
        <InlineLoading message="Processing your request..." />
      )}
    </div>
  );
};

// Example component with error handling
const ErrorHandlingExample: React.FC = () => {
  const { notify } = useNotifications();
  const { error, handleError, retry, clearError, canRetry } = useErrorHandler({
    showNotification: true,
    retryable: true,
  });

  const simulateError = async (errorType: 'network' | 'api' | 'validation') => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (errorType) {
      case 'network':
        throw new Error('Network connection failed');
      case 'api':
        throw new Error('API request failed');
      case 'validation':
        throw new Error('Validation error occurred');
      default:
        throw new Error('Unknown error');
    }
  };

  const handleErrorTest = async (errorType: 'network' | 'api' | 'validation') => {
    try {
      await simulateError(errorType);
    } catch (err) {
      handleError(err);
    }
  };

  const handleRetry = async () => {
    await retry(async () => {
      await simulateError('network');
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Handling Example</h3>
      
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => handleErrorTest('network')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Simulate Network Error
        </button>
        
        <button
          onClick={() => handleErrorTest('api')}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          Simulate API Error
        </button>
        
        <button
          onClick={() => handleErrorTest('validation')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Simulate Validation Error
        </button>
        
        <button
          onClick={clearError}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Error
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Error Details:
          </h4>
          <p className="text-red-700 dark:text-red-300 mb-2">
            {error.message}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Type: {error.type} | Retryable: {error.retryable ? 'Yes' : 'No'}
          </p>
          
          {canRetry && (
            <button
              onClick={handleRetry}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Notification examples
const NotificationExample: React.FC = () => {
  const { notify } = useNotifications();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Examples</h3>
      
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => notify.success('Operation completed successfully!')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Success Notification
        </button>
        
        <button
          onClick={() => notify.error('Something went wrong!')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Error Notification
        </button>
        
        <button
          onClick={() => notify.warning('Please check your input')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Warning Notification
        </button>
        
        <button
          onClick={() => notify.info('Here is some information')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Info Notification
        </button>
      </div>
    </div>
  );
};

// Main example component
export const ErrorHandlingExample: React.FC = () => {
  const [showProblematic, setShowProblematic] = React.useState(false);
  const [shouldFail, setShouldFail] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Error Handling & Loading States Demo
      </h1>

      {/* Error Boundary Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Error Boundary Example</h2>
        
        <div className="flex gap-4">
          <button
            onClick={() => setShowProblematic(!showProblematic)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showProblematic ? 'Hide' : 'Show'} Problematic Component
          </button>
          
          <button
            onClick={() => setShouldFail(!shouldFail)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {shouldFail ? 'Disable' : 'Enable'} Failure Mode
          </button>
        </div>

        {showProblematic && (
          <ErrorBoundary>
            <ProblematicComponent shouldFail={shouldFail} />
          </ErrorBoundary>
        )}
      </div>

      {/* Loading States Example */}
      <LoadingExample />

      {/* Error Handling Example */}
      <ErrorHandlingExample />

      {/* Notification Example */}
      <NotificationExample />

      {/* Global Loading Example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Global Loading Example</h3>
        <p className="text-gray-600 dark:text-gray-300">
          This would typically be used at the app level to show global loading states.
        </p>
      </div>
    </div>
  );
};
