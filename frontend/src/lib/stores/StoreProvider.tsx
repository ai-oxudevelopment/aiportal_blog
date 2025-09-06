// frontend/src/lib/stores/StoreProvider.tsx
// Store provider component for initializing and configuring stores

'use client';

import { useEffect } from 'react';
import { useUIStore } from './uiStore';
import { useUserStore } from './userStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const { setTheme } = useUIStore();
  const { user } = useUserStore();

  // Initialize theme from system preferences
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('ui-store');
      if (savedTheme) {
        try {
          const parsed = JSON.parse(savedTheme);
          if (parsed.state?.theme) {
            setTheme(parsed.state.theme);
            return;
          }
        } catch (error) {
          console.warn('Failed to parse saved theme:', error);
        }
      }

      // Default to system theme
      setTheme('system');
    };

    initializeTheme();
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      }
    };

    const uiStore = localStorage.getItem('ui-store');
    if (uiStore) {
      try {
        const parsed = JSON.parse(uiStore);
        if (parsed.state?.theme) {
          applyTheme(parsed.state.theme);
        }
      } catch (error) {
        console.warn('Failed to parse UI store:', error);
      }
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const uiStore = localStorage.getItem('ui-store');
      if (uiStore) {
        try {
          const parsed = JSON.parse(uiStore);
          if (parsed.state?.theme === 'system') {
            applyTheme('system');
          }
        } catch (error) {
          console.warn('Failed to parse UI store for theme change:', error);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-logout on token expiration (if implemented)
  useEffect(() => {
    const checkAuthStatus = () => {
      // TODO: Implement token expiration check
      // This would check if the user's token is still valid
      // and logout if expired
    };

    const interval = setInterval(checkAuthStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
};
