// frontend/src/lib/stores/searchStore.ts
// Search state management with Zustand

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Article } from '../types';

interface SearchState {
  // Search data
  query: string;
  results: Article[];
  recentSearches: string[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Search configuration
  isSearchOpen: boolean;
  searchHistory: string[];
  maxHistoryItems: number;
  
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: Article[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Search actions
  performSearch: (query: string) => void;
  clearSearch: () => void;
  clearResults: () => void;
  
  // UI actions
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  
  // History management
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
  
  // Utility actions
  clearAllData: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      // Initial state
      query: '',
      results: [],
      recentSearches: [],
      
      isLoading: false,
      error: null,
      
      isSearchOpen: false,
      searchHistory: [],
      maxHistoryItems: 10,
      
      // Actions
      setQuery: (query) => set({ query }),
      setResults: (results) => set({ results, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Search actions
      performSearch: (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        
        set({ 
          query: trimmedQuery,
          isLoading: true,
          error: null,
        });
        
        // Add to history
        get().addToHistory(trimmedQuery);
      },
      
      clearSearch: () => set({
        query: '',
        results: [],
        error: null,
        isLoading: false,
      }),
      
      clearResults: () => set({
        results: [],
        error: null,
      }),
      
      // UI actions
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      
      // History management
      addToHistory: (query) => set((state) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return state;
        
        const newHistory = [trimmedQuery, ...state.searchHistory.filter(item => item !== trimmedQuery)]
          .slice(0, state.maxHistoryItems);
        
        return { searchHistory: newHistory };
      }),
      
      removeFromHistory: (query) => set((state) => ({
        searchHistory: state.searchHistory.filter(item => item !== query),
      })),
      
      clearHistory: () => set({ searchHistory: [] }),
      
      // Utility actions
      clearAllData: () => set({
        query: '',
        results: [],
        recentSearches: [],
        isLoading: false,
        error: null,
        isSearchOpen: false,
        searchHistory: [],
      }),
    }),
    {
      name: 'search-store',
    }
  )
);
