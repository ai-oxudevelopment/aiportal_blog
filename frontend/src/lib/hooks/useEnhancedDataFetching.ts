// frontend/src/lib/hooks/useEnhancedDataFetching.ts
// Enhanced data fetching hooks with caching and optimistic updates

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager } from '../cache/CacheManager';
import { optimisticManager } from '../optimistic/OptimisticManager';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingState } from './useLoadingState';
import { useNotifications } from '@/components/NotificationSystem';
import type { Article, Category, Author, Tag } from '../types';
import { getArticles, getArticle, getArticleBySlug, getCategories, getCategoryBySlug, getAuthors, getAuthorBySlug, getTags, searchArticles } from '../api';

interface EnhancedDataFetchingOptions {
  enabled?: boolean;
  useCache?: boolean;
  cacheTTL?: number;
  cacheTags?: string[];
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  onCacheHit?: (data: any) => void;
  onCacheMiss?: () => void;
}

interface EnhancedDataFetchingResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastFetched: Date | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  setData: (data: T) => void;
  cacheStats: {
    hit: boolean;
    age: number;
    ttl: number;
  };
}

// Enhanced articles hook
export const useEnhancedArticles = (
  params: {
    page?: number;
    pageSize?: number;
    category?: string;
    author?: string;
    tag?: string;
    search?: string;
    sort?: string;
  } = {},
  options: EnhancedDataFetchingOptions = {}
) => {
  const {
    enabled = true,
    useCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    cacheTags = ['articles'],
    retryOnError = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    onCacheHit,
    onCacheMiss,
  } = options;

  const [data, setData] = useState<Article[] | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState({ hit: false, age: 0, ttl: 0 });

  const { error, handleError, retry, clearError } = useErrorHandler({
    showNotification: false,
    retryable: retryOnError,
    maxRetries,
    retryDelay,
    onError,
  });

  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState({
    initialMessage: 'Loading articles...',
  });

  const { notify } = useNotifications();
  const mountedRef = useRef(true);

  const cacheKey = cacheManager.generateKey.articles(params);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !mountedRef.current) return;

    // Check cache first
    if (useCache && !forceRefresh) {
      const cached = cacheManager.get<Article[]>(cacheKey);
      if (cached) {
        setData(cached);
        setLastFetched(new Date());
        setCacheStats({ hit: true, age: 0, ttl: cacheTTL });
        onCacheHit?.(cached);
        return;
      }
    }

    onCacheMiss?.();

    try {
      await withLoading(async () => {
        const articles = await getArticles(params);
        
        if (!mountedRef.current) return;

        setData(articles);
        setLastFetched(new Date());
        setCacheStats({ hit: false, age: 0, ttl: cacheTTL });

        // Cache the result
        if (useCache) {
          cacheManager.set(cacheKey, articles, {
            ttl: cacheTTL,
            tags: cacheTags,
          });
        }

        onSuccess?.(articles);
      });
    } catch (err) {
      if (!mountedRef.current) return;
      handleError(err);
    }
  }, [enabled, useCache, cacheKey, cacheTTL, cacheTags, params, onCacheHit, onCacheMiss, onSuccess, withLoading, handleError]);

  const refetch = useCallback(async () => {
    clearError();
    await fetchData(true);
  }, [fetchData, clearError]);

  const invalidate = useCallback(() => {
    cacheManager.delete(cacheKey);
    setData(null);
    setLastFetched(null);
  }, [cacheKey]);

  const setDataOptimistic = useCallback((newData: Article[]) => {
    setData(newData);
    
    if (useCache) {
      cacheManager.set(cacheKey, newData, {
        ttl: cacheTTL,
        tags: cacheTags,
      });
    }
  }, [cacheKey, useCache, cacheTTL, cacheTags]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isStale = lastFetched ? Date.now() - lastFetched.getTime() > cacheTTL : true;

  return {
    data,
    isLoading,
    error,
    isStale,
    lastFetched,
    refetch,
    invalidate,
    setData: setDataOptimistic,
    cacheStats,
  };
};

// Enhanced article hook
export const useEnhancedArticle = (
  slug: string,
  options: EnhancedDataFetchingOptions = {}
) => {
  const {
    enabled = true,
    useCache = true,
    cacheTTL = 10 * 60 * 1000, // 10 minutes
    cacheTags = ['articles'],
    retryOnError = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    onCacheHit,
    onCacheMiss,
  } = options;

  const [data, setData] = useState<Article | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState({ hit: false, age: 0, ttl: 0 });

  const { error, handleError, retry, clearError } = useErrorHandler({
    showNotification: false,
    retryable: retryOnError,
    maxRetries,
    retryDelay,
    onError,
  });

  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState({
    initialMessage: 'Loading article...',
  });

  const { notify } = useNotifications();
  const mountedRef = useRef(true);

  const cacheKey = cacheManager.generateKey.articleBySlug(slug);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !slug || !mountedRef.current) return;

    // Check cache first
    if (useCache && !forceRefresh) {
      const cached = cacheManager.get<Article>(cacheKey);
      if (cached) {
        setData(cached);
        setLastFetched(new Date());
        setCacheStats({ hit: true, age: 0, ttl: cacheTTL });
        onCacheHit?.(cached);
        return;
      }
    }

    onCacheMiss?.();

    try {
      await withLoading(async () => {
        const article = await getArticleBySlug(slug);
        
        if (!mountedRef.current) return;

        setData(article);
        setLastFetched(new Date());
        setCacheStats({ hit: false, age: 0, ttl: cacheTTL });

        // Cache the result
        if (useCache) {
          cacheManager.set(cacheKey, article, {
            ttl: cacheTTL,
            tags: cacheTags,
          });
        }

        onSuccess?.(article);
      });
    } catch (err) {
      if (!mountedRef.current) return;
      handleError(err);
    }
  }, [enabled, slug, useCache, cacheKey, cacheTTL, cacheTags, onCacheHit, onCacheMiss, onSuccess, withLoading, handleError]);

  const refetch = useCallback(async () => {
    clearError();
    await fetchData(true);
  }, [fetchData, clearError]);

  const invalidate = useCallback(() => {
    cacheManager.delete(cacheKey);
    setData(null);
    setLastFetched(null);
  }, [cacheKey]);

  const setDataOptimistic = useCallback((newData: Article) => {
    setData(newData);
    
    if (useCache) {
      cacheManager.set(cacheKey, newData, {
        ttl: cacheTTL,
        tags: cacheTags,
      });
    }
  }, [cacheKey, useCache, cacheTTL, cacheTags]);

  // Initial fetch
  useEffect(() => {
    if (enabled && slug) {
      fetchData();
    }
  }, [enabled, slug, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isStale = lastFetched ? Date.now() - lastFetched.getTime() > cacheTTL : true;

  return {
    data,
    isLoading,
    error,
    isStale,
    lastFetched,
    refetch,
    invalidate,
    setData: setDataOptimistic,
    cacheStats,
  };
};

// Enhanced categories hook
export const useEnhancedCategories = (
  options: EnhancedDataFetchingOptions = {}
) => {
  const {
    enabled = true,
    useCache = true,
    cacheTTL = 15 * 60 * 1000, // 15 minutes
    cacheTags = ['categories'],
    retryOnError = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    onCacheHit,
    onCacheMiss,
  } = options;

  const [data, setData] = useState<Category[] | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState({ hit: false, age: 0, ttl: 0 });

  const { error, handleError, retry, clearError } = useErrorHandler({
    showNotification: false,
    retryable: retryOnError,
    maxRetries,
    retryDelay,
    onError,
  });

  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState({
    initialMessage: 'Loading categories...',
  });

  const { notify } = useNotifications();
  const mountedRef = useRef(true);

  const cacheKey = cacheManager.generateKey.categories();

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !mountedRef.current) return;

    // Check cache first
    if (useCache && !forceRefresh) {
      const cached = cacheManager.get<Category[]>(cacheKey);
      if (cached) {
        setData(cached);
        setLastFetched(new Date());
        setCacheStats({ hit: true, age: 0, ttl: cacheTTL });
        onCacheHit?.(cached);
        return;
      }
    }

    onCacheMiss?.();

    try {
      await withLoading(async () => {
        const categories = await getCategories();
        
        if (!mountedRef.current) return;

        setData(categories);
        setLastFetched(new Date());
        setCacheStats({ hit: false, age: 0, ttl: cacheTTL });

        // Cache the result
        if (useCache) {
          cacheManager.set(cacheKey, categories, {
            ttl: cacheTTL,
            tags: cacheTags,
          });
        }

        onSuccess?.(categories);
      });
    } catch (err) {
      if (!mountedRef.current) return;
      handleError(err);
    }
  }, [enabled, useCache, cacheKey, cacheTTL, cacheTags, onCacheHit, onCacheMiss, onSuccess, withLoading, handleError]);

  const refetch = useCallback(async () => {
    clearError();
    await fetchData(true);
  }, [fetchData, clearError]);

  const invalidate = useCallback(() => {
    cacheManager.delete(cacheKey);
    setData(null);
    setLastFetched(null);
  }, [cacheKey]);

  const setDataOptimistic = useCallback((newData: Category[]) => {
    setData(newData);
    
    if (useCache) {
      cacheManager.set(cacheKey, newData, {
        ttl: cacheTTL,
        tags: cacheTags,
      });
    }
  }, [cacheKey, useCache, cacheTTL, cacheTags]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isStale = lastFetched ? Date.now() - lastFetched.getTime() > cacheTTL : true;

  return {
    data,
    isLoading,
    error,
    isStale,
    lastFetched,
    refetch,
    invalidate,
    setData: setDataOptimistic,
    cacheStats,
  };
};

// Enhanced search hook with debouncing and caching
export const useEnhancedSearch = (
  query: string,
  options: EnhancedDataFetchingOptions & { debounceMs?: number } = {}
) => {
  const {
    enabled = true,
    useCache = true,
    cacheTTL = 2 * 60 * 1000, // 2 minutes
    cacheTags = ['search'],
    retryOnError = true,
    maxRetries = 3,
    retryDelay = 1000,
    debounceMs = 300,
    onError,
    onSuccess,
    onCacheHit,
    onCacheMiss,
  } = options;

  const [data, setData] = useState<Article[] | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState({ hit: false, age: 0, ttl: 0 });

  const { error, handleError, retry, clearError } = useErrorHandler({
    showNotification: false,
    retryable: retryOnError,
    maxRetries,
    retryDelay,
    onError,
  });

  const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState({
    initialMessage: 'Searching...',
  });

  const { notify } = useNotifications();
  const mountedRef = useRef(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cacheKey = cacheManager.generateKey.search(query, {});

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !query.trim() || !mountedRef.current) return;

    // Check cache first
    if (useCache && !forceRefresh) {
      const cached = cacheManager.get<Article[]>(cacheKey);
      if (cached) {
        setData(cached);
        setLastFetched(new Date());
        setCacheStats({ hit: true, age: 0, ttl: cacheTTL });
        onCacheHit?.(cached);
        return;
      }
    }

    onCacheMiss?.();

    try {
      await withLoading(async () => {
        const articles = await searchArticles(query);
        
        if (!mountedRef.current) return;

        setData(articles);
        setLastFetched(new Date());
        setCacheStats({ hit: false, age: 0, ttl: cacheTTL });

        // Cache the result
        if (useCache) {
          cacheManager.set(cacheKey, articles, {
            ttl: cacheTTL,
            tags: cacheTags,
          });
        }

        onSuccess?.(articles);
      });
    } catch (err) {
      if (!mountedRef.current) return;
      handleError(err);
    }
  }, [enabled, query, useCache, cacheKey, cacheTTL, cacheTags, onCacheHit, onCacheMiss, onSuccess, withLoading, handleError]);

  const debouncedFetch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, debounceMs);
  }, [fetchData, debounceMs]);

  const refetch = useCallback(async () => {
    clearError();
    await fetchData(true);
  }, [fetchData, clearError]);

  const invalidate = useCallback(() => {
    cacheManager.delete(cacheKey);
    setData(null);
    setLastFetched(null);
  }, [cacheKey]);

  const setDataOptimistic = useCallback((newData: Article[]) => {
    setData(newData);
    
    if (useCache) {
      cacheManager.set(cacheKey, newData, {
        ttl: cacheTTL,
        tags: cacheTags,
      });
    }
  }, [cacheKey, useCache, cacheTTL, cacheTags]);

  // Debounced search
  useEffect(() => {
    if (enabled && query.trim()) {
      debouncedFetch();
    } else {
      setData(null);
      setLastFetched(null);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [enabled, query, debouncedFetch]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const isStale = lastFetched ? Date.now() - lastFetched.getTime() > cacheTTL : true;

  return {
    data,
    isLoading,
    error,
    isStale,
    lastFetched,
    refetch,
    invalidate,
    setData: setDataOptimistic,
    cacheStats,
  };
};
