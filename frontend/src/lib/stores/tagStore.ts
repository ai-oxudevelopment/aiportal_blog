// frontend/src/lib/stores/tagStore.ts
// Tag state management with Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Tag } from '../types';

interface TagState {
  // Data
  tags: Tag[];
  currentTag: Tag | null;
  
  // Loading states
  isLoading: boolean;
  isCurrentLoading: boolean;
  
  // Error states
  error: string | null;
  currentError: string | null;
  
  // Cache timestamp
  lastFetched: Date | null;
  
  // Actions
  setTags: (tags: Tag[]) => void;
  setCurrentTag: (tag: Tag | null) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setCurrentLoading: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  setCurrentError: (error: string | null) => void;
  
  // Utility actions
  clearTags: () => void;
  clearCurrentTag: () => void;
  clearAllErrors: () => void;
  clearAllData: () => void;
  
  // Cache management
  isStale: (maxAge?: number) => boolean;
  updateLastFetched: () => void;
  
  // Helper methods
  getTagBySlug: (slug: string) => Tag | undefined;
  getTagById: (id: number) => Tag | undefined;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (tags change less frequently)

export const useTagStore = create<TagState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tags: [],
        currentTag: null,
        
        isLoading: false,
        isCurrentLoading: false,
        
        error: null,
        currentError: null,
        
        lastFetched: null,
        
        // Actions
        setTags: (tags) => set({
          tags,
          lastFetched: new Date(),
          error: null,
        }),
        
        setCurrentTag: (tag) => set({
          currentTag: tag,
          currentError: null,
        }),
        
        // Loading actions
        setLoading: (loading) => set({ isLoading: loading }),
        setCurrentLoading: (loading) => set({ isCurrentLoading: loading }),
        
        // Error actions
        setError: (error) => set({ error }),
        setCurrentError: (error) => set({ currentError: error }),
        
        // Utility actions
        clearTags: () => set({
          tags: [],
          lastFetched: null,
          error: null,
        }),
        
        clearCurrentTag: () => set({
          currentTag: null,
          currentError: null,
        }),
        
        clearAllErrors: () => set({
          error: null,
          currentError: null,
        }),
        
        clearAllData: () => set({
          tags: [],
          currentTag: null,
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
        getTagBySlug: (slug) => {
          const state = get();
          return state.tags.find(tag => tag.attributes.slug === slug);
        },
        
        getTagById: (id) => {
          const state = get();
          return state.tags.find(tag => tag.id === id);
        },
      }),
      {
        name: 'tag-store',
        partialize: (state) => ({
          tags: state.tags,
          currentTag: state.currentTag,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    {
      name: 'tag-store',
    }
  )
);
