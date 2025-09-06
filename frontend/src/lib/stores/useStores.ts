// frontend/src/lib/stores/useStores.ts
// Combined store hook for easy access to all stores

import { useArticleStore } from './articleStore';
import { useCategoryStore } from './categoryStore';
import { useAuthorStore } from './authorStore';
import { useTagStore } from './tagStore';
import { useSearchStore } from './searchStore';
import { useUIStore } from './uiStore';
import { useUserStore } from './userStore';

/**
 * Combined hook that provides access to all stores
 * Useful for components that need multiple stores
 */
export const useStores = () => {
  const articleStore = useArticleStore();
  const categoryStore = useCategoryStore();
  const authorStore = useAuthorStore();
  const tagStore = useTagStore();
  const searchStore = useSearchStore();
  const uiStore = useUIStore();
  const userStore = useUserStore();

  return {
    article: articleStore,
    category: categoryStore,
    author: authorStore,
    tag: tagStore,
    search: searchStore,
    ui: uiStore,
    user: userStore,
  };
};

/**
 * Hook for clearing all store data
 * Useful for logout or reset functionality
 */
export const useClearAllStores = () => {
  const articleStore = useArticleStore();
  const categoryStore = useCategoryStore();
  const authorStore = useAuthorStore();
  const tagStore = useTagStore();
  const searchStore = useSearchStore();
  const uiStore = useUIStore();
  const userStore = useUserStore();

  const clearAll = () => {
    articleStore.clearAllData();
    categoryStore.clearAllData();
    authorStore.clearAllData();
    tagStore.clearAllData();
    searchStore.clearAllData();
    uiStore.resetUI();
    userStore.clearAllData();
  };

  return { clearAll };
};

/**
 * Hook for getting loading states across all stores
 */
export const useGlobalLoading = () => {
  const articleStore = useArticleStore();
  const categoryStore = useCategoryStore();
  const authorStore = useAuthorStore();
  const tagStore = useTagStore();
  const searchStore = useSearchStore();
  const uiStore = useUIStore();
  const userStore = useUserStore();

  const isLoading = 
    articleStore.isLoading ||
    articleStore.isFeaturedLoading ||
    articleStore.isRecentLoading ||
    articleStore.isCurrentLoading ||
    categoryStore.isLoading ||
    categoryStore.isCurrentLoading ||
    authorStore.isLoading ||
    authorStore.isCurrentLoading ||
    tagStore.isLoading ||
    tagStore.isCurrentLoading ||
    searchStore.isLoading ||
    uiStore.globalLoading ||
    uiStore.pageLoading ||
    userStore.isLoading ||
    userStore.isLoggingIn ||
    userStore.isLoggingOut;

  return { isLoading };
};

/**
 * Hook for getting error states across all stores
 */
export const useGlobalErrors = () => {
  const articleStore = useArticleStore();
  const categoryStore = useCategoryStore();
  const authorStore = useAuthorStore();
  const tagStore = useTagStore();
  const searchStore = useSearchStore();
  const userStore = useUserStore();

  const errors = [
    articleStore.error && { source: 'articles', error: articleStore.error },
    articleStore.featuredError && { source: 'featured-articles', error: articleStore.featuredError },
    articleStore.recentError && { source: 'recent-articles', error: articleStore.recentError },
    articleStore.currentError && { source: 'current-article', error: articleStore.currentError },
    categoryStore.error && { source: 'categories', error: categoryStore.error },
    categoryStore.currentError && { source: 'current-category', error: categoryStore.currentError },
    authorStore.error && { source: 'authors', error: authorStore.error },
    authorStore.currentError && { source: 'current-author', error: authorStore.currentError },
    tagStore.error && { source: 'tags', error: tagStore.error },
    tagStore.currentError && { source: 'current-tag', error: tagStore.currentError },
    searchStore.error && { source: 'search', error: searchStore.error },
    userStore.error && { source: 'user', error: userStore.error },
    userStore.loginError && { source: 'login', error: userStore.loginError },
  ].filter(Boolean);

  const hasErrors = errors.length > 0;

  return { errors, hasErrors };
};
