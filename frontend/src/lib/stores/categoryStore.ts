// frontend/src/lib/stores/categoryStore.ts
// Category state management with Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Category } from '../types';

interface CategoryState {
  // Data
  categories: Category[];
  currentCategory: Category | null;
  
  // Loading states
  isLoading: boolean;
  isCurrentLoading: boolean;
  
  // Error states
  error: string | null;
  currentError: string | null;
  
  // Cache timestamp
  lastFetched: Date | null;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setCurrentCategory: (category: Category | null) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setCurrentLoading: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  setCurrentError: (error: string | null) => void;
  
  // Utility actions
  clearCategories: () => void;
  clearCurrentCategory: () => void;
  clearAllErrors: () => void;
  clearAllData: () => void;
  
  // Cache management
  isStale: (maxAge?: number) => boolean;
  updateLastFetched: () => void;
  
  // Helper methods
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryById: (id: number) => Category | undefined;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (categories change less frequently)

export const useCategoryStore = create<CategoryState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        categories: [],
        currentCategory: null,
        
        isLoading: false,
        isCurrentLoading: false,
        
        error: null,
        currentError: null,
        
        lastFetched: null,
        
        // Actions
        setCategories: (categories) => set({
          categories,
          lastFetched: new Date(),
          error: null,
        }),
        
        setCurrentCategory: (category) => set({
          currentCategory: category,
          currentError: null,
        }),
        
        // Loading actions
        setLoading: (loading) => set({ isLoading: loading }),
        setCurrentLoading: (loading) => set({ isCurrentLoading: loading }),
        
        // Error actions
        setError: (error) => set({ error }),
        setCurrentError: (error) => set({ currentError: error }),
        
        // Utility actions
        clearCategories: () => set({
          categories: [],
          lastFetched: null,
          error: null,
        }),
        
        clearCurrentCategory: () => set({
          currentCategory: null,
          currentError: null,
        }),
        
        clearAllErrors: () => set({
          error: null,
          currentError: null,
        }),
        
        clearAllData: () => set({
          categories: [],
          currentCategory: null,
          lastFetched: null,
          error: null,
          currentError: null,
        }),
        
        // Cache management
        isStale: (maxAge = CACHE_DURATION) => {
          const state = get();
          if (!state.lastFetched) return true;
          return Date.now() - state.lastFetched.getTime() > maxAge;
        },
        
        updateLastFetched: () => set({ lastFetched: new Date() }),
        
        // Helper methods
        getCategoryBySlug: (slug) => {
          const state = get();
          return state.categories.find(category => category.attributes.slug === slug);
        },
        
        getCategoryById: (id) => {
          const state = get();
          return state.categories.find(category => category.id === id);
        },
      }),
      {
        name: 'category-store',
        partialize: (state) => ({
          categories: state.categories,
          currentCategory: state.currentCategory,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    {
      name: 'category-store',
    }
  )
);
