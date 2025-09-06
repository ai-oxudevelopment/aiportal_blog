# Error Handling & Loading States System

This document describes the comprehensive error handling and loading state system implemented for the blog application.

## Overview

The error handling and loading system provides:
- **Error Boundaries** for catching and handling React errors
- **Loading States** for better user experience during async operations
- **Notification System** for user feedback
- **Retry Logic** for failed operations
- **Comprehensive Hooks** for easy integration

## Components

### Error Boundaries

#### `ErrorBoundary`
Main error boundary component that catches JavaScript errors anywhere in the child component tree.

```tsx
import { ErrorBoundary } from '@/components';

<ErrorBoundary>
  <ComponentThatMightFail />
</ErrorBoundary>
```

**Props:**
- `children`: React nodes to wrap
- `fallback`: Custom fallback UI
- `onError`: Error handler callback
- `resetOnPropsChange`: Reset on prop changes
- `resetKeys`: Keys to watch for resets

#### `AsyncErrorBoundary`
Specialized for async operations with loading-specific error messages.

#### `NetworkErrorBoundary`
Specialized for network-related errors.

### Loading Components

#### `LoadingSpinner`
Basic loading spinner with size and color variants.

```tsx
<LoadingSpinner size="lg" color="primary" />
```

#### `Skeleton`
Skeleton loading placeholders for content.

```tsx
<Skeleton className="h-4 w-full" lines={3} />
```

#### `LoadingButton`
Button with integrated loading state.

```tsx
<LoadingButton
  loading={isLoading}
  onClick={handleClick}
>
  Submit
</LoadingButton>
```

#### `GlobalLoading`
Full-screen loading overlay.

```tsx
<GlobalLoading loading={isLoading} message="Loading..." />
```

### Notification System

#### `NotificationSystem`
Toast notification system that displays notifications from the UI store.

```tsx
import { NotificationSystem } from '@/components';

// Add to your app root
<NotificationSystem />
```

#### `useNotifications`
Hook for triggering notifications.

```tsx
const { notify } = useNotifications();

notify.success('Operation completed!');
notify.error('Something went wrong!');
notify.warning('Please check your input');
notify.info('Here is some information');
```

## Hooks

### Error Handling Hooks

#### `useErrorHandler`
Main error handling hook with retry logic.

```tsx
const { error, handleError, retry, clearError, canRetry } = useErrorHandler({
  showNotification: true,
  retryable: true,
  maxRetries: 3,
});

// Handle errors
try {
  await riskyOperation();
} catch (err) {
  handleError(err);
}

// Retry failed operations
if (canRetry) {
  await retry(() => riskyOperation());
}
```

#### `useAsyncErrorHandler`
Specialized for async operations.

```tsx
const { executeWithErrorHandling } = useAsyncErrorHandler();

const result = await executeWithErrorHandling(
  () => fetchData(),
  () => fetchData() // retry function
);
```

#### `useFormErrorHandler`
For form validation errors.

```tsx
const { getFieldError, hasFieldError } = useFormErrorHandler();

const emailError = getFieldError('email');
const hasEmailError = hasFieldError('email');
```

#### `useAPIErrorHandler`
For API-specific error handling.

```tsx
const { handleAPIError } = useAPIErrorHandler();

try {
  await apiCall();
} catch (err) {
  handleAPIError(err); // Handles specific HTTP status codes
}
```

### Loading State Hooks

#### `useLoadingState`
Main loading state management.

```tsx
const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState({
  initialMessage: 'Loading...',
  showProgress: true,
  estimatedDuration: 5000,
});

// Manual control
startLoading('Processing...');
await doWork();
stopLoading();

// Automatic wrapper
const result = await withLoading(
  () => doWork(),
  'Processing with loading...'
);
```

#### `useMultipleLoadingStates`
For managing multiple loading states.

```tsx
const { setLoading, isLoading, isAnyLoading } = useMultipleLoadingStates();

setLoading('fetching', true);
setLoading('saving', false);

const isFetching = isLoading('fetching');
const hasAnyLoading = isAnyLoading();
```

#### `useDebouncedLoading`
For debounced loading states (prevents flickering).

```tsx
const { isLoading, isDebouncedLoading, setLoading } = useDebouncedLoading(300);

setLoading(true); // Shows immediately
setLoading(false); // Hides after 300ms delay
```

#### `useProgress`
For progress tracking.

```tsx
const { current, total, progress, increment, setProgress } = useProgress(100);

increment(10); // Add 10 to current
setProgress(50); // Set to 50
```

## Integration with Stores

The error handling and loading system integrates seamlessly with the Zustand stores:

```tsx
import { useArticleStore } from '@/lib/stores';
import { useErrorHandler, useLoadingState } from '@/lib/hooks';

function ArticlesPage() {
  const { setArticles, setLoading, setError } = useArticleStore();
  const { handleError } = useErrorHandler();
  const { withLoading } = useLoadingState();

  const loadArticles = async () => {
    await withLoading(async () => {
      try {
        const articles = await fetchArticles();
        setArticles(articles);
      } catch (err) {
        handleError(err);
      }
    });
  };

  return (
    <div>
      <button onClick={loadArticles}>Load Articles</button>
    </div>
  );
}
```

## Best Practices

### 1. Error Boundaries
- Wrap route components with error boundaries
- Use specialized boundaries for different error types
- Provide meaningful fallback UI
- Include retry mechanisms

### 2. Loading States
- Show loading states for operations > 200ms
- Use skeleton loaders for content
- Provide progress indicators for long operations
- Debounce loading states to prevent flickering

### 3. Error Handling
- Handle errors at the appropriate level
- Provide user-friendly error messages
- Include retry mechanisms for transient errors
- Log errors for debugging

### 4. Notifications
- Use appropriate notification types
- Keep messages concise and actionable
- Auto-dismiss non-critical notifications
- Provide manual dismiss for important messages

## Example Usage

See `ErrorHandlingExample.tsx` for a comprehensive example of all components and hooks working together.

## Error Types

The system handles different error types:

- **Network Errors**: Connection issues, timeouts
- **API Errors**: HTTP status codes, server errors
- **Validation Errors**: Form validation, input errors
- **Unknown Errors**: Unexpected errors

## Loading Patterns

Common loading patterns:

- **Button Loading**: For form submissions
- **Page Loading**: For route changes
- **Inline Loading**: For content updates
- **Skeleton Loading**: For content placeholders
- **Global Loading**: For app-wide operations

## Accessibility

All components include proper accessibility features:

- ARIA labels and roles
- Screen reader support
- Keyboard navigation
- Focus management
- Color contrast compliance

## Performance

The system is optimized for performance:

- Minimal re-renders
- Efficient state updates
- Debounced operations
- Memory leak prevention
- Cleanup on unmount
