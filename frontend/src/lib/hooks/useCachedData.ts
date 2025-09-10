// frontend/src/lib/hooks/useCachedData.ts
// Optimized data fetching hooks with caching and performance improvements

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager } from '../cache/CacheManager';
import { getSectionBySlug, getArticles } from '../api';
import type { Section, Article } from '../types';
import type { HookError } from '../hooks';

interface CachedDataOptions {
  enabled?: boolean;
  cacheKey?: string;
  ttl?: number;
  tags?: string[];
  staleWhileRevalidate?: boolean;
  onError?: (error: HookError) => void;
  onSuccess?: (data: any) => void;
}

interface CachedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: HookError | null;
  isStale: boolean;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
  isRetrying: boolean;
  lastFetched: Date | null;
}

const createError = (err: unknown): HookError => {
  if (err instanceof Error) {
    return {
      message: err.message,
      type: err.name === 'AbortError' ? 'network' : 'api',
      retryable: err.name !== 'AbortError',
    };
  }
  return {
    message: 'An unknown error occurred',
    type: 'unknown',
    retryable: true,
  };
};

function useCachedData<T>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  dependencies: any[] = [],
  options: CachedDataOptions = {}
): CachedDataResult<T> {
  const {
    enabled = true,
    ttl = 5 * 60 * 1000, // 5 minutes default
    tags = [],
    staleWhileRevalidate = true,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = cacheManager.get<T>(cacheKey);
      if (cached) {
        console.log('✅ CACHE HIT - Using cached data for:', cacheKey, '- Setting loading to false');
        setData(cached);
        setError(null);
        setIsStale(false);
        setLoading(false);
        setLastFetched(new Date());
        console.log('✅ CACHE HIT - State updated, data should be available now');
        onSuccess?.(cached);
        return;
      }
      console.log('🔍 CACHE CHECK:', { cacheKey, hasCachedData: !!cached, cachedData: cached });
      if (cached) {
        console.log('✅ Using cached data for:', cacheKey);
        setData(cached);
        setError(null);
        setIsStale(false);
        setLoading(false);
        setLastFetched(new Date());
        onSuccess?.(cached);
        return;
      } else {
        console.log('❌ No cached data for:', cacheKey, '- will fetch from API');
      }
    }
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = cacheManager.get<T>(cacheKey);
      if (cached) {
        setData(cached);
        setError(null);
        setIsStale(false);
        setLoading(false);
        setLastFetched(new Date());
        onSuccess?.(cached);
        return;
      }
    }

    // If we have stale data and staleWhileRevalidate is enabled, show stale data while fetching
    if (staleWhileRevalidate && data && !forceRefresh) {
      setIsStale(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      const result = await fetchFunction();

      if (!mountedRef.current) return;

      // Cache the result
      cacheManager.set(cacheKey, result, {
        ttl,
        tags: [...tags, 'api-data'],
        metadata: {
          source: 'api',
          size: JSON.stringify(result).length,
        },
      });

      setData(result);
      setError(null);
      setIsStale(false);
      setLastFetched(new Date());
      retryCountRef.current = 0;
      onSuccess?.(result);

    } catch (err: unknown) {
      if (!mountedRef.current) return;

      const hookError = createError(err);
      setError(hookError);
      onError?.(hookError);

      // If we have stale data, keep showing it on error
      if (!data) {
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRetrying(false);
        setIsStale(false);
      }
    }
  }, [enabled, cacheKey, ttl, tags, staleWhileRevalidate, fetchFunction, onError, onSuccess]);

  const retry = useCallback(async () => {
    if (retryCountRef.current >= 3) return;

    setIsRetrying(true);
    retryCountRef.current++;
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await fetchData(true);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();
  }, [enabled, cacheKey, ...dependencies]);

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    retry,
    isRetrying,
    lastFetched,
  };
}

// Optimized section hook
export const useCachedSectionBySlug = (slug: string, options: CachedDataOptions = {}) => {
  const cacheKey = `section:slug:${slug}`;
  
  return useCachedData(
    () => getSectionBySlug(slug),
    cacheKey,
    [slug],
    {
      ttl: 10 * 60 * 1000, // 10 minutes for sections (they change less frequently)
      tags: ['sections', `section-${slug}`],
      staleWhileRevalidate: true,
      ...options,
    }
  );
};

// Optimized articles hook
export const useCachedArticles = (params: any = {}, options: CachedDataOptions = {}) => {
  const cacheKey = `articles:${JSON.stringify(params)}`;
  
  return useCachedData(
    () => getArticles(params),
    cacheKey,
    [JSON.stringify(params)],
    {
      ttl: 5 * 60 * 1000, // 5 minutes cache
      tags: [
        'articles', 
        ...(params.filters?.section?.slug?.$eq ? [`section-${params.filters.section.slug.$eq}`] : []),
        ...(params.filters?.type?.$eq ? [`type-${params.filters.type.$eq}`] : [])
      ],
      staleWhileRevalidate: true,
      ...options,
    }
  );
};

// Cache invalidation helpers
export const invalidateCache = {
  section: (slug: string) => {
    cacheManager.invalidateByTag(`section-${slug}`);
  },
  sections: () => {
    cacheManager.invalidateByTag('sections');
  },
  articles: (sectionSlug?: string) => {
    if (sectionSlug) {
      cacheManager.invalidateByTag(`section-${sectionSlug}`);
    } else {
      cacheManager.invalidateByTag('articles');
    }
  },
  all: () => {
    cacheManager.clear();
  },
};

// Export cache manager for debugging
export { cacheManager as cache };
