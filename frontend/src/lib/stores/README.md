# State Management with Zustand

This directory contains the centralized state management system using Zustand for the blog application.

## Overview

The state management system is organized into several specialized stores, each handling a specific domain of the application:

- **ArticleStore**: Manages articles, featured articles, recent articles, and pagination
- **CategoryStore**: Manages categories and current category state
- **AuthorStore**: Manages authors and current author state
- **TagStore**: Manages tags and current tag state
- **SearchStore**: Manages search functionality and history
- **UIStore**: Manages UI state, theme, modals, and notifications
- **UserStore**: Manages user authentication and preferences

## Features

### 🚀 **Performance Optimized**
- **Persistence**: Critical data is persisted to localStorage
- **Selective Persistence**: Only essential data is persisted, not temporary UI state
- **Cache Management**: Built-in cache with TTL for API data
- **Request Deduplication**: Prevents duplicate API calls

### 🛡️ **Type Safe**
- Full TypeScript support with strict typing
- Custom error types for better error handling
- Comprehensive interfaces for all state shapes

### 🔧 **Developer Experience**
- **DevTools Integration**: Full Redux DevTools support
- **Debugging**: Easy debugging with named stores
- **Hot Reloading**: State persists during development
- **Combined Hooks**: Easy access to multiple stores

### 🎯 **User Experience**
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Automatic retry mechanisms
- **Loading States**: Granular loading indicators
- **Theme Management**: System theme detection and persistence

## Usage

### Basic Store Usage

```typescript
import { useArticleStore } from '@/lib/stores';

function ArticlesList() {
  const { articles, isLoading, error, setArticles } = useArticleStore();
  
  // Use the store state and actions
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {articles.map(article => (
        <div key={article.id}>{article.attributes.title}</div>
      ))}
    </div>
  );
}
```

### Combined Store Usage

```typescript
import { useStores } from '@/lib/stores';

function ComplexComponent() {
  const { article, category, search, ui } = useStores();
  
  // Access multiple stores easily
  return (
    <div>
      <h1>{category.currentCategory?.attributes.name}</h1>
      <div>{article.articles.length} articles</div>
      <input 
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
      />
    </div>
  );
}
```

### Global State Monitoring

```typescript
import { useGlobalLoading, useGlobalErrors } from '@/lib/stores';

function App() {
  const { isLoading } = useGlobalLoading();
  const { errors, hasErrors } = useGlobalErrors();
  
  return (
    <div>
      {isLoading && <GlobalLoader />}
      {hasErrors && <ErrorBoundary errors={errors} />}
      {/* App content */}
    </div>
  );
}
```

## Store Architecture

### State Structure

Each store follows a consistent pattern:

```typescript
interface StoreState {
  // Data
  data: DataType[];
  currentItem: DataType | null;
  
  // Loading states
  isLoading: boolean;
  isCurrentLoading: boolean;
  
  // Error states
  error: string | null;
  currentError: string | null;
  
  // Cache management
  lastFetched: Date | null;
  
  // Actions
  setData: (data: DataType[]) => void;
  setCurrentItem: (item: DataType | null) => void;
  // ... more actions
}
```

### Cache Management

All stores include cache management:

```typescript
// Check if data is stale
const isStale = articleStore.isStale('articles', 5 * 60 * 1000); // 5 minutes

// Update cache timestamp
articleStore.updateLastFetched('articles');
```

### Error Handling

Consistent error handling across all stores:

```typescript
// Set error
articleStore.setError('Failed to load articles');

// Clear errors
articleStore.clearAllErrors();
```

## Integration with API Hooks

The stores work seamlessly with the enhanced API hooks:

```typescript
import { useArticles } from '@/lib/hooks';
import { useArticleStore } from '@/lib/stores';

function ArticlesPage() {
  const { setArticles, setLoading, setError } = useArticleStore();
  const { data, loading, error } = useArticles();
  
  // Sync hook data with store
  useEffect(() => {
    if (data) setArticles(data);
    setLoading(loading);
    if (error) setError(error.message);
  }, [data, loading, error, setArticles, setLoading, setError]);
  
  return <div>{/* Render articles */}</div>;
}
```

## Best Practices

### 1. **Use Stores for Global State**
- Use stores for data that needs to be shared across components
- Use local state for component-specific data

### 2. **Leverage Persistence**
- Only persist essential data
- Use selective persistence to avoid storing temporary UI state

### 3. **Handle Loading States**
- Use granular loading states for better UX
- Combine loading states when needed

### 4. **Error Management**
- Set specific error messages
- Clear errors when starting new operations
- Use error boundaries for unhandled errors

### 5. **Cache Strategy**
- Use cache for frequently accessed data
- Implement cache invalidation strategies
- Monitor cache performance

## Migration Guide

If migrating from a different state management solution:

1. **Identify Global State**: Determine what data needs to be global
2. **Create Store Structure**: Follow the established patterns
3. **Update Components**: Replace old state management with store hooks
4. **Test Thoroughly**: Ensure all state transitions work correctly
5. **Optimize**: Use selective persistence and cache management

## Troubleshooting

### Common Issues

1. **State Not Persisting**: Check if the store is using the `persist` middleware
2. **Performance Issues**: Review what data is being persisted
3. **Type Errors**: Ensure all store interfaces are properly typed
4. **DevTools Not Working**: Verify the store is wrapped with `devtools`

### Debug Tools

- **Redux DevTools**: Use browser extension for debugging
- **Console Logging**: Add temporary console.log statements
- **Store Inspection**: Use `getState()` to inspect current state

## Future Enhancements

- [ ] **Middleware System**: Add custom middleware for logging, analytics
- [ ] **State Synchronization**: Sync state across browser tabs
- [ ] **Offline Support**: Handle offline state and sync when online
- [ ] **State Validation**: Add runtime state validation
- [ ] **Performance Monitoring**: Add performance metrics and monitoring
