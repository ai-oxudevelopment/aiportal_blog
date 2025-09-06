// frontend/src/lib/stores/userStore.ts
// User state management with Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'user';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
  };
}

interface UserState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  
  // Loading states
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  
  // Error states
  error: string | null;
  loginError: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setLoggingIn: (loading: boolean) => void;
  setLoggingOut: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  setLoginError: (error: string | null) => void;
  
  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  
  // Utility actions
  clearUser: () => void;
  clearErrors: () => void;
  clearAllData: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        
        isLoading: false,
        isLoggingIn: false,
        isLoggingOut: false,
        
        error: null,
        loginError: null,
        
        // Actions
        setUser: (user) => set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),
        
        setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
        
        // Loading actions
        setLoading: (loading) => set({ isLoading: loading }),
        setLoggingIn: (loading) => set({ isLoggingIn: loading }),
        setLoggingOut: (loading) => set({ isLoggingOut: loading }),
        
        // Error actions
        setError: (error) => set({ error }),
        setLoginError: (error) => set({ loginError: error }),
        
        // Authentication actions
        login: async (email, password) => {
          set({ isLoggingIn: true, loginError: null });
          
          try {
            // TODO: Implement actual login logic with Strapi
            // For now, simulate login
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockUser: User = {
              id: '1',
              email,
              name: email.split('@')[0],
              role: 'user',
              preferences: {
                theme: 'system',
                notifications: true,
                emailUpdates: true,
              },
            };
            
            set({
              user: mockUser,
              isAuthenticated: true,
              isLoggingIn: false,
            });
          } catch (error) {
            set({
              isLoggingIn: false,
              loginError: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
          }
        },
        
        logout: async () => {
          set({ isLoggingOut: true });
          
          try {
            // TODO: Implement actual logout logic with Strapi
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set({
              user: null,
              isAuthenticated: false,
              isLoggingOut: false,
            });
          } catch (error) {
            set({
              isLoggingOut: false,
              error: error instanceof Error ? error.message : 'Logout failed',
            });
            throw error;
          }
        },
        
        updateProfile: async (updates) => {
          const { user } = get();
          if (!user) throw new Error('No user logged in');
          
          set({ isLoading: true, error: null });
          
          try {
            // TODO: Implement actual profile update logic with Strapi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({
              user: { ...user, ...updates },
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Profile update failed',
            });
            throw error;
          }
        },
        
        updatePreferences: async (preferences) => {
          const { user } = get();
          if (!user) throw new Error('No user logged in');
          
          set({ isLoading: true, error: null });
          
          try {
            // TODO: Implement actual preferences update logic with Strapi
            await new Promise(resolve => setTimeout(resolve, 500));
            
            set({
              user: {
                ...user,
                preferences: { ...user.preferences, ...preferences },
              },
              isLoading: false,
            });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Preferences update failed',
            });
            throw error;
          }
        },
        
        // Utility actions
        clearUser: () => set({
          user: null,
          isAuthenticated: false,
          error: null,
          loginError: null,
        }),
        
        clearErrors: () => set({
          error: null,
          loginError: null,
        }),
        
        clearAllData: () => set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isLoggingIn: false,
          isLoggingOut: false,
          error: null,
          loginError: null,
        }),
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          // Only persist user data and authentication state
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'user-store',
    }
  )
);
