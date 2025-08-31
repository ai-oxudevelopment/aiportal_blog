'use client';

// frontend/src/components/DataWrapper.tsx
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface DataWrapperProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
}

export default function DataWrapper<T>({
  data,
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = '',
}: DataWrapperProps<T>) {
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || <LoadingSpinner size="lg" className="py-8" />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <ErrorMessage message={error} onRetry={onRetry} />
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={className}>
        {emptyComponent || (
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children(data)}</div>;
}
