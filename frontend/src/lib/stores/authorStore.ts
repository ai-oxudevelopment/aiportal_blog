// frontend/src/lib/stores/authorStore.ts
// Author state management with Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Author } from '../types';

interface AuthorState {
  // Data
  authors: Author[];
  currentAuthor: Author | null;
  
  // Loading states
  isLoading: boolean;
  isCurrentLoading: boolean;
  
  // Error states
  error: string | null;
  currentError: string | null;
  
  // Cache timestamp
  lastFetched: Date | null;
  
  // Actions
  setAuthors: (authors: Author[]) => void;
  setCurrentAuthor: (author: Author | null) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setCurrentLoading: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  setCurrentError: (error: string | null) => void;
  
  // Utility actions
  clearAuthors: () => void;
  clearCurrentAuthor: () => void;
  clearAllErrors: () => void;
  clearAllData: () => void;
  
  // Cache management
  isStale: (maxAge?: number) => boolean;
  updateLastFetched: () => void;
  
  // Helper methods
  getAuthorBySlug: (slug: string) => Author | undefined;
  getAuthorById: (id: number) => Author | undefined;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (authors change less frequently)

export const useAuthorStore = create<AuthorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        authors: [],
        currentAuthor: null,
        
        isLoading: false,
        isCurrentLoading: false,
        
        error: null,
        currentError: null,
        
        lastFetched: null,
        
        // Actions
        setAuthors: (authors) => set({
          authors,
          lastFetched: new Date(),
          error: null,
        }),
        
        setCurrentAuthor: (author) => set({
          currentAuthor: author,
          currentError: null,
        }),
        
        // Loading actions
        setLoading: (loading) => set({ isLoading: loading }),
        setCurrentLoading: (loading) => set({ isCurrentLoading: loading }),
        
        // Error actions
        setError: (error) => set({ error }),
        setCurrentError: (error) => set({ currentError: error }),
        
        // Utility actions
        clearAuthors: () => set({
          authors: [],
          lastFetched: null,
          error: null,
        }),
        
        clearCurrentAuthor: () => set({
          currentAuthor: null,
          currentError: null,
        }),
        
        clearAllErrors: () => set({
          error: null,
          currentError: null,
        }),
        
        clearAllData: () => set({
          authors: [],
          currentAuthor: null,
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
        getAuthorBySlug: (slug) => {
          const state = get();
          return state.authors.find(author => author.attributes.slug === slug);
        },
        
        getAuthorById: (id) => {
          const state = get();
          return state.authors.find(author => author.id === id);
        },
      }),
      {
        name: 'author-store',
        partialize: (state) => ({
          authors: state.authors,
          currentAuthor: state.currentAuthor,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    {
      name: 'author-store',
    }
  )
);
