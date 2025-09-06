// frontend/src/lib/hooks/useCache.ts
// React hooks for cache management and optimistic updates

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager } from '../cache/CacheManager';
import { optimisticManager } from '../optimistic/OptimisticManager';
import type { CacheEntry, OptimisticUpdate } from '../optimistic/OptimisticManager';

interface UseCacheOptions<T> {
  key: string;
  ttl?: number;
  tags?: string[];
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

interface UseCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: Date | null;
  refetch: () => void;
  invalidate: () => void;
  setData: (data: T) => void;
}

export const useCache = <T>({
  key,
  ttl,
  tags = [],
  enabled = true,
  onError,
  onSuccess,
}: UseCacheOptions<T>): UseCacheResult<T> => {
  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const getCachedData = useCallback((): T | null => {
    if (!enabled) return null;
    
    try {
      const cached = cacheManager.get<T>(key);
      if (cached) {
        setLastUpdated(new Date());
        onSuccess?.(cached);
      }
      return cached;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache read error');
      setError(error);
      onError?.(error);
      return null;
    }
  }, [key, enabled, onSuccess, onError]);

  const setData = useCallback((newData: T) => {
    if (!mountedRef.current) return;
    
    try {
      cacheManager.set(key, newData, { ttl, tags });
      setDataState(newData);
      setLastUpdated(new Date());
      setError(null);
      onSuccess?.(newData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache write error');
      setError(error);
      onError?.(error);
    }
  }, [key, ttl, tags, onSuccess, onError]);

  const invalidate = useCallback(() => {
    try {
      cacheManager.delete(key);
      setDataState(null);
      setLastUpdated(null);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache invalidation error');
      setError(error);
      onError?.(error);
    }
  }, [key, onError]);

  const refetch = useCallback(() => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    // This would typically trigger a new data fetch
    // For now, we'll just reload from cache
    const cached = getCachedData();
    if (cached) {
      setDataState(cached);
    }
    
    setIsLoading(false);
  }, [enabled, getCachedData]);

  // Load initial data
  useEffect(() => {
    if (enabled) {
      const cached = getCachedData();
      setDataState(cached);
    }
  }, [enabled, getCachedData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isStale = lastUpdated ? Date.now() - lastUpdated.getTime() > (ttl || cacheManager['config'].defaultTTL) : true;

  return {
    data,
    isLoading,
    error,
    isStale,
    lastUpdated,
    refetch,
    invalidate,
    setData,
  };
};

// Hook for optimistic updates
interface UseOptimisticOptions<T> {
  initialData: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData: T) => void;
  onRollback?: (originalData: T) => void;
  maxRetries?: number;
}

interface UseOptimisticResult<T> {
  data: T;
  isOptimistic: boolean;
  pendingUpdates: OptimisticUpdate[];
  create: (data: Partial<T>) => string;
  update: (data: Partial<T>) => string;
  delete: () => string;
  confirm: (updateId: string) => void;
  cancel: (updateId: string) => void;
  execute: (updateId: string, executeFunction: (data: T) => Promise<T>) => Promise<T | null>;
}

export const useOptimistic = <T>({
  initialData,
  onSuccess,
  onError,
  onRollback,
  maxRetries = 3,
}: UseOptimisticOptions<T>): UseOptimisticResult<T> => {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate[]>([]);

  const updatePendingUpdates = useCallback(() => {
    const updates = optimisticManager.getPendingUpdates();
    setPendingUpdates(updates);
    setIsOptimistic(updates.length > 0);
  }, []);

  const create = useCallback((newData: Partial<T>): string => {
    const updateId = optimisticManager.create(
      { ...data, ...newData },
      {
        maxRetries,
        onSuccess: (result) => {
          setData(result);
          onSuccess?.(result);
          updatePendingUpdates();
        },
        onError: (error, originalData) => {
          if (originalData) {
            setData(originalData);
          }
          onError?.(error, originalData || data);
          updatePendingUpdates();
        },
        onRollback: (originalData) => {
          setData(originalData);
          onRollback?.(originalData);
          updatePendingUpdates();
        },
      }
    );

    // Apply optimistic update immediately
    setData({ ...data, ...newData });
    updatePendingUpdates();

    return updateId;
  }, [data, maxRetries, onSuccess, onError, onRollback, updatePendingUpdates]);

  const update = useCallback((newData: Partial<T>): string => {
    const updateId = optimisticManager.update(
      'update',
      { ...data, ...newData },
      data,
      {
        maxRetries,
        onSuccess: (result) => {
          setData(result);
          onSuccess?.(result);
          updatePendingUpdates();
        },
        onError: (error, originalData) => {
          setData(originalData);
          onError?.(error, originalData);
          updatePendingUpdates();
        },
        onRollback: (originalData) => {
          setData(originalData);
          onRollback?.(originalData);
          updatePendingUpdates();
        },
      }
    );

    // Apply optimistic update immediately
    setData({ ...data, ...newData });
    updatePendingUpdates();

    return updateId;
  }, [data, maxRetries, onSuccess, onError, onRollback, updatePendingUpdates]);

  const deleteItem = useCallback((): string => {
    const updateId = optimisticManager.delete(
      'delete',
      data,
      {
        maxRetries,
        onSuccess: () => {
          // Data is already "deleted" optimistically
          onSuccess?.(data);
          updatePendingUpdates();
        },
        onError: (error, originalData) => {
          setData(originalData);
          onError?.(error, originalData);
          updatePendingUpdates();
        },
        onRollback: (originalData) => {
          setData(originalData);
          onRollback?.(originalData);
          updatePendingUpdates();
        },
      }
    );

    // Apply optimistic delete immediately (set to null or empty)
    setData(null as T);
    updatePendingUpdates();

    return updateId;
  }, [data, maxRetries, onSuccess, onError, onRollback, updatePendingUpdates]);

  const confirm = useCallback((updateId: string) => {
    optimisticManager.confirm(updateId);
    updatePendingUpdates();
  }, [updatePendingUpdates]);

  const cancel = useCallback((updateId: string) => {
    optimisticManager.cancel(updateId);
    updatePendingUpdates();
  }, [updatePendingUpdates]);

  const execute = useCallback(async (updateId: string, executeFunction: (data: T) => Promise<T>): Promise<T | null> => {
    const result = await optimisticManager.execute(updateId, executeFunction);
    updatePendingUpdates();
    return result;
  }, [updatePendingUpdates]);

  // Update pending updates on mount and when optimistic manager changes
  useEffect(() => {
    updatePendingUpdates();
    
    // Set up interval to check for updates
    const interval = setInterval(updatePendingUpdates, 1000);
    return () => clearInterval(interval);
  }, [updatePendingUpdates]);

  return {
    data,
    isOptimistic,
    pendingUpdates,
    create,
    update,
    delete: deleteItem,
    confirm,
    cancel,
    execute,
  };
};

// Hook for cache statistics and management
export const useCacheStats = () => {
  const [stats, setStats] = useState(cacheManager.getStats());
  const [metrics, setMetrics] = useState(cacheManager.getMetrics());

  const refreshStats = useCallback(() => {
    setStats(cacheManager.getStats());
    setMetrics(cacheManager.getMetrics());
  }, []);

  const clearCache = useCallback(() => {
    cacheManager.clear();
    refreshStats();
  }, [refreshStats]);

  const cleanupCache = useCallback(() => {
    cacheManager.cleanup();
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    metrics,
    refreshStats,
    clearCache,
    cleanupCache,
  };
};

// Hook for optimistic update statistics
export const useOptimisticStats = () => {
  const [stats, setStats] = useState(optimisticManager.getStats());
  const [metrics, setMetrics] = useState(optimisticManager.getMetrics());

  const refreshStats = useCallback(() => {
    setStats(optimisticManager.getStats());
    setMetrics(optimisticManager.getMetrics());
  }, []);

  const clearOptimistic = useCallback(() => {
    optimisticManager.clear();
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    const interval = setInterval(refreshStats, 1000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    metrics,
    refreshStats,
    clearOptimistic,
  };
};
