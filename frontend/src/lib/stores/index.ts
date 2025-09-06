// frontend/src/lib/stores/index.ts
// Centralized state management exports

export { useArticleStore } from './articleStore';
export { useCategoryStore } from './categoryStore';
export { useAuthorStore } from './authorStore';
export { useTagStore } from './tagStore';
export { useSearchStore } from './searchStore';
export { useUIStore } from './uiStore';
export { useUserStore } from './userStore';

// Combined store hooks
export { useStores, useClearAllStores, useGlobalLoading, useGlobalErrors } from './useStores';

// Store provider
export { StoreProvider } from './StoreProvider';
