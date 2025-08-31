'use client';

import { useState, useEffect } from 'react';
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
import type { Article, Category, Section, Author, Tag } from './types';

// Generic hook for data fetching
interface UseDataFetchingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
): UseDataFetchingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Data fetching error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Article hooks
export const useArticles = (params?: any) => {
  return useDataFetching(() => getArticles(params), [JSON.stringify(params)]);
};

export const useArticle = (id: string | number, params?: any) => {
  return useDataFetching(() => getArticle(id, params), [id, JSON.stringify(params)]);
};

export const useArticleBySlug = (slug: string, params?: any) => {
  return useDataFetching(() => getArticleBySlug(slug, params), [slug, JSON.stringify(params)]);
};

// Category hooks
export const useCategories = (params?: any) => {
  return useDataFetching(() => getCategories(params), [JSON.stringify(params)]);
};

export const useCategoryBySlug = (slug: string, params?: any) => {
  return useDataFetching(() => getCategoryBySlug(slug, params), [slug, JSON.stringify(params)]);
};

// Section hooks
export const useSections = (params?: any) => {
  return useDataFetching(() => getSections(params), [JSON.stringify(params)]);
};

export const useSectionBySlug = (slug: string, params?: any) => {
  return useDataFetching(() => getSectionBySlug(slug, params), [slug, JSON.stringify(params)]);
};

// Author hooks
export const useAuthors = (params?: any) => {
  return useDataFetching(() => getAuthors(params), [JSON.stringify(params)]);
};

export const useAuthorBySlug = (slug: string, params?: any) => {
  return useDataFetching(() => getAuthorBySlug(slug, params), [slug, JSON.stringify(params)]);
};

// Tag hooks
export const useTags = (params?: any) => {
  return useDataFetching(() => getTags(params), [JSON.stringify(params)]);
};

// Search hook
export const useSearchArticles = (query: string, params?: any) => {
  return useDataFetching(
    () => searchArticles(query, params),
    [query, JSON.stringify(params)]
  );
};

// Custom hook for pagination
export const usePaginatedArticles = (page: number = 1, pageSize: number = 10, params?: any) => {
  const paginationParams = {
    ...params,
    pagination: {
      page,
      pageSize,
    },
  };

  return useDataFetching(
    () => getArticles(paginationParams),
    [page, pageSize, JSON.stringify(params)]
  );
};

// Hook for featured articles
export const useFeaturedArticles = (limit: number = 5) => {
  const params = {
    pagination: { limit },
    sort: ['createdAt:desc'],
    filters: {
      featured: {
        $eq: true,
      },
    },
  };

  return useDataFetching(() => getArticles(params), [limit]);
};

// Hook for recent articles
export const useRecentArticles = (limit: number = 10) => {
  const params = {
    pagination: { limit },
    sort: ['createdAt:desc'],
  };

  return useDataFetching(() => getArticles(params), [limit]);
};

// Hook for articles by category
export const useArticlesByCategory = (categorySlug: string, limit?: number) => {
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
    [categorySlug, limit]
  );
};

// Hook for articles by author
export const useArticlesByAuthor = (authorSlug: string, limit?: number) => {
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
    [authorSlug, limit]
  );
};

// Hook for articles by tag
export const useArticlesByTag = (tagSlug: string, limit?: number) => {
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
    [tagSlug, limit]
  );
};
