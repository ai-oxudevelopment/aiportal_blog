// frontend/src/lib/hooks/useLoadingState.ts
// Comprehensive loading state management hook

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string | null;
  progress: number | null;
  startTime: Date | null;
  estimatedDuration: number | null;
}

interface LoadingStateOptions {
  initialMessage?: string;
  showProgress?: boolean;
  estimatedDuration?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export const useLoadingState = (options: LoadingStateOptions = {}) => {
  const {
    initialMessage = null,
    showProgress = false,
    estimatedDuration = null,
    onComplete,
    onError,
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: initialMessage,
    progress: null,
    startTime: null,
    estimatedDuration,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingMessage: message || prev.loadingMessage,
      startTime: new Date(),
      progress: showProgress ? 0 : null,
    }));

    // Auto-progress if estimated duration is provided
    if (showProgress && estimatedDuration) {
      const progressInterval = setInterval(() => {
        setState(prev => {
          if (!prev.startTime) return prev;
          
          const elapsed = Date.now() - prev.startTime.getTime();
          const newProgress = Math.min((elapsed / estimatedDuration) * 100, 95); // Cap at 95%
          
          return {
            ...prev,
            progress: newProgress,
          };
        });
      }, 100);

      progressIntervalRef.current = progressInterval;
    }
  }, [showProgress, estimatedDuration]);

  const stopLoading = useCallback((success: boolean = true) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: showProgress ? 100 : null,
    }));

    // Clear intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Call completion callback after a brief delay
    if (success) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          progress: null,
          startTime: null,
        }));
        onComplete?.();
      }, 500);
    }
  }, [showProgress, onComplete]);

  const setProgress = useCallback((progress: number) => {
    if (!showProgress) return;
    
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, [showProgress]);

  const setMessage = useCallback((message: string | null) => {
    setState(prev => ({
      ...prev,
      loadingMessage: message,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      loadingMessage: initialMessage,
      progress: null,
      startTime: null,
      estimatedDuration,
    });

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [initialMessage, estimatedDuration]);

  const withLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    message?: string
  ): Promise<T | null> => {
    startLoading(message);
    
    try {
      const result = await asyncFunction();
      stopLoading(true);
      return result;
    } catch (error) {
      stopLoading(false);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    }
  }, [startLoading, stopLoading, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
    reset,
    withLoading,
  };
};

// Hook for managing multiple loading states
export const useMultipleLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const getAllLoadingKeys = useCallback(() => {
    return Object.keys(loadingStates).filter(key => loadingStates[key]);
  }, [loadingStates]);

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    getAllLoadingKeys,
    clearAll,
    loadingStates,
  };
};

// Hook for debounced loading states
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDebouncedLoading, setIsDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      // Show loading immediately
      setIsDebouncedLoading(true);
    } else {
      // Hide loading after delay
      timeoutRef.current = setTimeout(() => {
        setIsDebouncedLoading(false);
      }, delay);
    }
  }, [delay]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsDebouncedLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isDebouncedLoading,
    setLoading,
    reset,
  };
};

// Hook for progress tracking
export const useProgress = (total: number = 100) => {
  const [current, setCurrent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const progress = total > 0 ? (current / total) * 100 : 0;

  const increment = useCallback((amount: number = 1) => {
    setCurrent(prev => {
      const newCurrent = Math.min(prev + amount, total);
      if (newCurrent >= total) {
        setIsComplete(true);
      }
      return newCurrent;
    });
  }, [total]);

  const decrement = useCallback((amount: number = 1) => {
    setCurrent(prev => {
      const newCurrent = Math.max(prev - amount, 0);
      if (newCurrent < total) {
        setIsComplete(false);
      }
      return newCurrent;
    });
  }, [total]);

  const setProgress = useCallback((value: number) => {
    const newCurrent = Math.max(0, Math.min(value, total));
    setCurrent(newCurrent);
    setIsComplete(newCurrent >= total);
  }, [total]);

  const reset = useCallback(() => {
    setCurrent(0);
    setIsComplete(false);
  }, []);

  return {
    current,
    total,
    progress,
    isComplete,
    increment,
    decrement,
    setProgress,
    reset,
  };
};
