// frontend/src/lib/hooks.ts
// Enhanced data fetching hooks with improved error handling, caching, and state management

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getArticles, 
  getArticle, 
  getArticleBySlug,
  getCategories,
  getCategoryBySlug,
  getSections,
  getSectionBySlug,
  getAuthors,
  getAuthorBySlug,
  getTags,
  searchArticles,
} from './api';
import { StrapiAPIError, NetworkError, clearCacheByPattern } from './strapi';
import type { Article, Category, Section, Author, Tag } from './types';

// Enhanced error types for hooks
export interface HookError {
  message: string;
  type: 'network' | 'api' | 'validation' | 'unknown';
  status?: number;
  retryable: boolean;
}

// Enhanced generic hook for data fetching
interface UseDataFetchingResult<T> {
  data: T | null;
  loading: boolean;
  error: HookError | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
  isRetrying: boolean;
  lastFetched: Date | null;
}

interface UseDataFetchingOptions<T> {
  enabled?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: HookError) => void;
  onSuccess?: (data: T) => void;
}

function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingResult<T> {
  const {
    enabled = true,
    retryOnError = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const createError = (err: unknown): HookError => {
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
  };

  const fetchData = useCallback(async (isRetry: boolean = false) => {
    if (!enabled || !mountedRef.current) return;

    try {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const result = await fetchFunction();
      
      if (!mountedRef.current) return;
      
      setData(result);
      setLastFetched(new Date());
      setRetryCount(0);
      onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const hookError = createError(err);
      setError(hookError);
      onError?.(hookError);
      
      console.error('Data fetching error:', err);
      
      // Auto-retry logic
      if (retryOnError && hookError.retryable && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(true);
          }
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRetrying(false);
      }
    }
  }, [fetchFunction, enabled, retryOnError, maxRetries, retryDelay, retryCount, onError, onSuccess]);

  const retry = useCallback(async () => {
    setRetryCount(0);
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, dependencies);

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(false), 
    retry,
    isRetrying,
    lastFetched,
  };
}

// Article hooks with enhanced options
export const useArticles = (params?: any, options?: UseDataFetchingOptions<Article[]>) => {
  return useDataFetching(() => getArticles(params), [JSON.stringify(params)], options);
};

export const useArticle = (id: string | number, options?: UseDataFetchingOptions<Article>) => {
  return useDataFetching(() => getArticle(id), [id], options);
};

export const useArticleBySlug = (slug: string, options?: UseDataFetchingOptions<Article>) => {
  return useDataFetching(() => getArticleBySlug(slug), [slug], options);
};

// Category hooks
export const useCategories = (params?: any, options?: UseDataFetchingOptions<Category[]>) => {
  return useDataFetching(() => getCategories(params), [JSON.stringify(params)], options);
};

export const useCategoryBySlug = (slug: string, options?: UseDataFetchingOptions<Category>) => {
  return useDataFetching(() => getCategoryBySlug(slug), [slug], options);
};

// Section hooks
export const useSections = (params?: any, options?: UseDataFetchingOptions<Section[]>) => {
  return useDataFetching(() => getSections(params), [JSON.stringify(params)], options);
};

export const useSectionBySlug = (slug: string, options?: UseDataFetchingOptions<Section>) => {
  return useDataFetching(() => getSectionBySlug(slug), [slug], options);
};

// Author hooks
export const useAuthors = (params?: any, options?: UseDataFetchingOptions<Author[]>) => {
  return useDataFetching(() => getAuthors(params), [JSON.stringify(params)], options);
};

export const useAuthorBySlug = (slug: string, options?: UseDataFetchingOptions<Author>) => {
  return useDataFetching(() => getAuthorBySlug(slug), [slug], options);
};

// Tag hooks
export const useTags = (params?: any, options?: UseDataFetchingOptions<Tag[]>) => {
  return useDataFetching(() => getTags(params), [JSON.stringify(params)], options);
};

// Search hook with debouncing
export const useSearchArticles = (query: string, params?: any, options?: UseDataFetchingOptions<Article[]>) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return useDataFetching(
    () => searchArticles(debouncedQuery, params),
    [debouncedQuery, JSON.stringify(params)],
    { ...options, enabled: debouncedQuery.length > 2 }
  );
};

// Enhanced pagination hook
export const usePaginatedArticles = (
  page: number = 1, 
  pageSize: number = 10, 
  params?: any,
  options?: UseDataFetchingOptions<Article[]>
) => {
  const paginationParams = {
    ...params,
    pagination: {
      page,
      pageSize,
    },
  };

  return useDataFetching(
    () => getArticles(paginationParams),
    [page, pageSize, JSON.stringify(params)],
    options
  );
};

// Hook for featured articles
export const useFeaturedArticles = (limit: number = 5, options?: UseDataFetchingOptions<Article[]>) => {
  const params = {
    pagination: { limit },
    sort: ['createdAt:desc'],
    filters: {
      featured: {
        $eq: true,
      },
    },
  };

  return useDataFetching(() => getArticles(params), [limit], options);
};

// Hook for recent articles
export const useRecentArticles = (limit: number = 10, options?: UseDataFetchingOptions<Article[]>) => {
  const params = {
    pagination: { limit },
    sort: ['createdAt:desc'],
  };

  return useDataFetching(() => getArticles(params), [limit], options);
};

// Hook for articles by category
export const useArticlesByCategory = (
  categorySlug: string, 
  limit?: number, 
  options?: UseDataFetchingOptions
) => {
  const params = {
    ...(limit && { pagination: { limit } }),
    filters: {
      categories: {
        slug: {
          $eq: categorySlug,
        },
      },
    },
    sort: ['createdAt:desc'],
  };

  return useDataFetching(
    () => getArticles(params),
    [categorySlug, limit],
    options
  );
};

// Hook for articles by author
export const useArticlesByAuthor = (
  authorSlug: string, 
  limit?: number, 
  options?: UseDataFetchingOptions<Article[]>
) => {
  const params = {
    ...(limit && { pagination: { limit } }),
    filters: {
      author: {
        slug: {
          $eq: authorSlug,
        },
      },
    },
    sort: ['createdAt:desc'],
  };

  return useDataFetching(
    () => getArticles(params),
    [authorSlug, limit],
    options
  );
};

// Hook for articles by tag
export const useArticlesByTag = (
  tagSlug: string, 
  limit?: number, 
  options?: UseDataFetchingOptions<Article[]>
) => {
  const params = {
    ...(limit && { pagination: { limit } }),
    filters: {
      tags: {
        slug: {
          $eq: tagSlug,
        },
      },
    },
    sort: ['createdAt:desc'],
  };

  return useDataFetching(
    () => getArticles(params),
    [tagSlug, limit],
    options
  );
};

// New utility hooks

// Hook for cache management
export const useCacheManagement = () => {
  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      clearCacheByPattern(pattern);
    } else {
      // Clear all cache - would need to implement this in strapi.ts
      clearCacheByPattern('.*');
    }
  }, []);

  return { clearCache };
};

// Hook for optimistic updates
export const useOptimisticUpdate = <T>(
  initialData: T | null,
  updateFunction: (data: T, optimisticData: T) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<HookError | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    if (!data) return;

    setIsUpdating(true);
    setError(null);
    
    // Optimistic update
    setData(optimisticData);

    try {
      const result = await updateFunction(data, optimisticData);
      setData(result);
    } catch (err) {
      // Revert on error
      setData(data);
      setError(createError(err));
    } finally {
      setIsUpdating(false);
    }
  }, [data, updateFunction]);

  return { data, update, isUpdating, error };
};

// Helper function to create error (reused from useDataFetching)
const createError = (err: unknown): HookError => {
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
};

// Export error handling and loading hooks
export { useErrorHandler, useAsyncErrorHandler, useFormErrorHandler, useAPIErrorHandler } from './hooks/useErrorHandler';
export { useLoadingState, useMultipleLoadingStates, useDebouncedLoading, useProgress } from './hooks/useLoadingState';

// Export cache and optimistic update hooks
export { useCache, useOptimistic, useCacheStats, useOptimisticStats } from './hooks/useCache';
export { useEnhancedArticles, useEnhancedArticle, useEnhancedCategories, useEnhancedSearch } from './hooks/useEnhancedDataFetching';
