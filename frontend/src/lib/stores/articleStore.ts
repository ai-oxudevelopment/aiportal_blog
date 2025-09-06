// frontend/src/lib/stores/articleStore.ts
// Article state management with Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Article } from '../types';

interface ArticleState {
  // Data
  articles: Article[];
  featuredArticles: Article[];
  recentArticles: Article[];
  currentArticle: Article | null;
  
  // Loading states
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isRecentLoading: boolean;
  isCurrentLoading: boolean;
  
  // Error states
  error: string | null;
  featuredError: string | null;
  recentError: string | null;
  currentError: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  
  // Cache timestamps
  lastFetched: Date | null;
  featuredLastFetched: Date | null;
  recentLastFetched: Date | null;
  
  // Actions
  setArticles: (articles: Article[], meta?: { total: number; page: number; pageSize: number }) => void;
  setFeaturedArticles: (articles: Article[]) => void;
  setRecentArticles: (articles: Article[]) => void;
  setCurrentArticle: (article: Article | null) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setFeaturedLoading: (loading: boolean) => void;
  setRecentLoading: (loading: boolean) => void;
  setCurrentLoading: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  setFeaturedError: (error: string | null) => void;
  setRecentError: (error: string | null) => void;
  setCurrentError: (error: string | null) => void;
  
  // Pagination actions
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalArticles: (total: number) => void;
  
  // Utility actions
  clearArticles: () => void;
  clearFeaturedArticles: () => void;
  clearRecentArticles: () => void;
  clearCurrentArticle: () => void;
  clearAllErrors: () => void;
  clearAllData: () => void;
  
  // Cache management
  isStale: (type: 'articles' | 'featured' | 'recent', maxAge?: number) => boolean;
  updateLastFetched: (type: 'articles' | 'featured' | 'recent') => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useArticleStore = create<ArticleState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        articles: [],
        featuredArticles: [],
        recentArticles: [],
        currentArticle: null,
        
        isLoading: false,
        isFeaturedLoading: false,
        isRecentLoading: false,
        isCurrentLoading: false,
        
        error: null,
        featuredError: null,
        recentError: null,
        currentError: null,
        
        currentPage: 1,
        totalPages: 0,
        totalArticles: 0,
        
        lastFetched: null,
        featuredLastFetched: null,
        recentLastFetched: null,
        
        // Actions
        setArticles: (articles, meta) => set((state) => ({
          articles,
          currentPage: meta?.page || state.currentPage,
          totalPages: meta ? Math.ceil(meta.total / meta.pageSize) : state.totalPages,
          totalArticles: meta?.total || state.totalArticles,
          lastFetched: new Date(),
          error: null,
        })),
        
        setFeaturedArticles: (articles) => set({
          featuredArticles: articles,
          featuredLastFetched: new Date(),
          featuredError: null,
        }),
        
        setRecentArticles: (articles) => set({
          recentArticles: articles,
          recentLastFetched: new Date(),
          recentError: null,
        }),
        
        setCurrentArticle: (article) => set({
          currentArticle: article,
          currentError: null,
        }),
        
        // Loading actions
        setLoading: (loading) => set({ isLoading: loading }),
        setFeaturedLoading: (loading) => set({ isFeaturedLoading: loading }),
        setRecentLoading: (loading) => set({ isRecentLoading: loading }),
        setCurrentLoading: (loading) => set({ isCurrentLoading: loading }),
        
        // Error actions
        setError: (error) => set({ error }),
        setFeaturedError: (error) => set({ featuredError: error }),
        setRecentError: (error) => set({ recentError: error }),
        setCurrentError: (error) => set({ currentError: error }),
        
        // Pagination actions
        setCurrentPage: (page) => set({ currentPage: page }),
        setTotalPages: (pages) => set({ totalPages: pages }),
        setTotalArticles: (total) => set({ totalArticles: total }),
        
        // Utility actions
        clearArticles: () => set({
          articles: [],
          currentPage: 1,
          totalPages: 0,
          totalArticles: 0,
          lastFetched: null,
          error: null,
        }),
        
        clearFeaturedArticles: () => set({
          featuredArticles: [],
          featuredLastFetched: null,
          featuredError: null,
        }),
        
        clearRecentArticles: () => set({
          recentArticles: [],
          recentLastFetched: null,
          recentError: null,
        }),
        
        clearCurrentArticle: () => set({
          currentArticle: null,
          currentError: null,
        }),
        
        clearAllErrors: () => set({
          error: null,
          featuredError: null,
          recentError: null,
          currentError: null,
        }),
        
        clearAllData: () => set({
          articles: [],
          featuredArticles: [],
          recentArticles: [],
          currentArticle: null,
          currentPage: 1,
          totalPages: 0,
          totalArticles: 0,
          lastFetched: null,
          featuredLastFetched: null,
          recentLastFetched: null,
          error: null,
          featuredError: null,
          recentError: null,
          currentError: null,
        }),
        
        // Cache management
        isStale: (type, maxAge = CACHE_DURATION) => {
          const state = get();
          const lastFetched = type === 'articles' 
            ? state.lastFetched 
            : type === 'featured' 
            ? state.featuredLastFetched 
            : state.recentLastFetched;
          
          if (!lastFetched) return true;
          return Date.now() - lastFetched.getTime() > maxAge;
        },
        
        updateLastFetched: (type) => set((state) => ({
          ...state,
          ...(type === 'articles' && { lastFetched: new Date() }),
          ...(type === 'featured' && { featuredLastFetched: new Date() }),
          ...(type === 'recent' && { recentLastFetched: new Date() }),
        })),
      }),
      {
        name: 'article-store',
        partialize: (state) => ({
          // Only persist essential data, not loading states
          articles: state.articles,
          featuredArticles: state.featuredArticles,
          recentArticles: state.recentArticles,
          currentArticle: state.currentArticle,
          currentPage: state.currentPage,
          totalPages: state.totalPages,
          totalArticles: state.totalArticles,
          lastFetched: state.lastFetched,
          featuredLastFetched: state.featuredLastFetched,
          recentLastFetched: state.recentLastFetched,
        }),
      }
    ),
    {
      name: 'article-store',
    }
  )
);
