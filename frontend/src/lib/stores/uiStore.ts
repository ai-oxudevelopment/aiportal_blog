// frontend/src/lib/stores/uiStore.ts
// UI state management with Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // Navigation
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    timestamp: Date;
  }>;
  
  // Modal states
  modals: {
    [key: string]: boolean;
  };
  
  // Actions
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Utility actions
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isMobileMenuOpen: false,
        isSearchOpen: false,
        
        theme: 'system',
        sidebarCollapsed: false,
        
        globalLoading: false,
        pageLoading: false,
        
        notifications: [],
        modals: {},
        
        // Actions
        setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
        toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
        
        setSearchOpen: (open) => set({ isSearchOpen: open }),
        toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
        
        setTheme: (theme) => set({ theme }),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setGlobalLoading: (loading) => set({ globalLoading: loading }),
        setPageLoading: (loading) => set({ pageLoading: loading }),
        
        // Notification actions
        addNotification: (notification) => set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date(),
            },
          ],
        })),
        
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(notification => notification.id !== id),
        })),
        
        clearNotifications: () => set({ notifications: [] }),
        
        // Modal actions
        openModal: (modalId) => set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),
        
        closeModal: (modalId) => set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        })),
        
        toggleModal: (modalId) => set((state) => ({
          modals: { ...state.modals, [modalId]: !state.modals[modalId] },
        })),
        
        closeAllModals: () => set({ modals: {} }),
        
        // Utility actions
        resetUI: () => set({
          isMobileMenuOpen: false,
          isSearchOpen: false,
          sidebarCollapsed: false,
          globalLoading: false,
          pageLoading: false,
          notifications: [],
          modals: {},
        }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          // Only persist user preferences, not temporary UI state
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);
