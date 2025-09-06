# Cache & Optimistic Updates System

This document describes the comprehensive caching and optimistic updates system implemented for the blog application.

## Overview

The system provides:
- **Advanced Caching** with TTL, invalidation, and persistence
- **Optimistic Updates** for immediate UI feedback
- **Enhanced Data Fetching** with cache integration
- **Performance Monitoring** and statistics
- **Cross-tab Synchronization** for cache consistency

## Architecture

### Cache Manager

The `CacheManager` provides a sophisticated caching system with:

- **TTL Support**: Time-to-live for cache entries
- **Tag-based Invalidation**: Invalidate related cache entries
- **Persistence**: LocalStorage integration with cross-tab sync
- **Size Management**: Automatic eviction of old entries
- **Metrics**: Hit rates, size tracking, and performance monitoring

### Optimistic Manager

The `OptimisticManager` handles optimistic updates with:

- **Immediate UI Updates**: Apply changes before server confirmation
- **Automatic Retry**: Retry failed operations with exponential backoff
- **Rollback Support**: Revert changes on failure
- **Conflict Resolution**: Handle concurrent updates gracefully

## Usage

### Basic Caching

```tsx
import { useCache } from '@/lib/hooks';

function MyComponent() {
  const { data, isLoading, error, refetch, invalidate } = useCache({
    key: 'my-data',
    ttl: 5 * 60 * 1000, // 5 minutes
    tags: ['data'],
    onCacheHit: (data) => console.log('Cache hit!'),
    onCacheMiss: () => console.log('Cache miss'),
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>{JSON.stringify(data)}</div>}
      <button onClick={refetch}>Refresh</button>
      <button onClick={invalidate}>Clear Cache</button>
    </div>
  );
}
```

### Optimistic Updates

```tsx
import { useOptimistic } from '@/lib/hooks';

function ArticleEditor({ article }) {
  const {
    data: optimisticData,
    isOptimistic,
    pendingUpdates,
    update: optimisticUpdate,
    confirm: confirmUpdate,
    cancel: cancelUpdate,
    execute: executeUpdate,
  } = useOptimistic({
    initialData: article,
    onSuccess: (data) => console.log('Update successful:', data),
    onError: (error, originalData) => console.log('Update failed:', error),
    onRollback: (originalData) => console.log('Rolled back to:', originalData),
  });

  const handleSave = async (newData) => {
    const updateId = optimisticUpdate(newData);
    
    try {
      await executeUpdate(updateId, async (data) => {
        return await api.updateArticle(data);
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      {isOptimistic && <div>Updating...</div>}
      <div>{optimisticData.title}</div>
      <button onClick={() => handleSave({ title: 'New Title' })}>
        Save
      </button>
    </div>
  );
}
```

### Enhanced Data Fetching

```tsx
import { useEnhancedArticles } from '@/lib/hooks';

function ArticlesList() {
  const {
    data: articles,
    isLoading,
    error,
    isStale,
    lastFetched,
    refetch,
    invalidate,
    cacheStats,
  } = useEnhancedArticles(
    { page: 1, pageSize: 10 },
    {
      useCache: true,
      cacheTTL: 5 * 60 * 1000,
      cacheTags: ['articles'],
      onCacheHit: (data) => console.log('Articles from cache'),
      onCacheMiss: () => console.log('Fetching from API'),
    }
  );

  return (
    <div>
      {isLoading && <div>Loading articles...</div>}
      {error && <div>Error: {error.message}</div>}
      {articles && (
        <div>
          {articles.map(article => (
            <div key={article.id}>{article.attributes.title}</div>
          ))}
        </div>
      )}
      <div>
        Cache hit: {cacheStats.hit ? 'Yes' : 'No'}
        {isStale && <span> (Stale)</span>}
      </div>
    </div>
  );
}
```

## Cache Management

### Cache Keys

The system provides structured cache key generation:

```tsx
import { cacheManager } from '@/lib/cache';

// Generate cache keys
const articleKey = cacheManager.generateKey.article(123);
const articlesKey = cacheManager.generateKey.articles({ page: 1 });
const searchKey = cacheManager.generateKey.search('query', {});
```

### Cache Invalidation

```tsx
// Invalidate specific entries
cacheManager.delete('article:123');

// Invalidate by tag
cacheManager.invalidateByTag('articles');

// Invalidate by pattern
cacheManager.invalidateByPattern('^articles:');

// Use helper methods
cacheManager.invalidate.article(123);
cacheManager.invalidate.articles();
cacheManager.invalidate.search('query');
```

### Cache Statistics

```tsx
import { useCacheStats } from '@/lib/hooks';

function CacheStats() {
  const { stats, metrics, clearCache, cleanupCache } = useCacheStats();

  return (
    <div>
      <h3>Cache Statistics</h3>
      <p>Size: {stats.size}</p>
      <p>Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</p>
      <p>Hits: {metrics.hits}</p>
      <p>Misses: {metrics.misses}</p>
      
      <button onClick={clearCache}>Clear All</button>
      <button onClick={cleanupCache}>Cleanup Expired</button>
    </div>
  );
}
```

## Optimistic Updates

### Update Types

The system supports three types of optimistic updates:

1. **Create**: Add new items
2. **Update**: Modify existing items
3. **Delete**: Remove items

### Retry Logic

Failed updates are automatically retried with exponential backoff:

```tsx
const updateId = optimisticManager.update(
  'update',
  newData,
  originalData,
  {
    maxRetries: 3,
    onSuccess: (data) => console.log('Success'),
    onError: (error, originalData) => console.log('Error'),
    onRollback: (originalData) => console.log('Rollback'),
  }
);
```

### Conflict Resolution

The system handles concurrent updates gracefully:

```tsx
// Multiple updates to the same item
const update1 = optimisticManager.update('update', data1, originalData);
const update2 = optimisticManager.update('update', data2, originalData);

// Only the last successful update is applied
// Failed updates are rolled back automatically
```

## Performance Optimization

### Cache Configuration

```tsx
import { CacheManager } from '@/lib/cache';

const customCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  maxSize: 2000,
  enablePersistence: true,
  enableCompression: false,
  enableMetrics: true,
});
```

### Optimistic Configuration

```tsx
import { OptimisticManager } from '@/lib/optimistic';

const customOptimistic = new OptimisticManager({
  maxRetries: 5,
  retryDelay: 2000,
  autoRollback: true,
  rollbackDelay: 10000,
  enableMetrics: true,
});
```

## Integration with Stores

The cache and optimistic systems integrate seamlessly with Zustand stores:

```tsx
import { useArticleStore } from '@/lib/stores';
import { useEnhancedArticles } from '@/lib/hooks';

function ArticlesPage() {
  const { setArticles } = useArticleStore();
  const { data, isLoading, error } = useEnhancedArticles(
    { page: 1 },
    {
      onSuccess: (articles) => setArticles(articles),
      onError: (error) => console.error('Failed to load articles:', error),
    }
  );

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>{data.length} articles loaded</div>}
    </div>
  );
}
```

## Best Practices

### 1. Cache Strategy

- **Use appropriate TTL**: Short for dynamic data, long for static data
- **Tag related data**: Use tags for efficient invalidation
- **Monitor hit rates**: Optimize cache keys and TTL based on usage
- **Clean up regularly**: Use cleanup methods to remove expired entries

### 2. Optimistic Updates

- **Provide fallbacks**: Always have original data for rollback
- **Handle conflicts**: Implement conflict resolution strategies
- **User feedback**: Show loading states and error messages
- **Retry logic**: Configure appropriate retry attempts and delays

### 3. Performance

- **Batch operations**: Group related cache operations
- **Lazy loading**: Load data only when needed
- **Debounce updates**: Prevent excessive API calls
- **Monitor metrics**: Track performance and optimize accordingly

## Error Handling

The system provides comprehensive error handling:

```tsx
const { data, error, refetch } = useEnhancedArticles(
  { page: 1 },
  {
    onError: (error) => {
      if (error.type === 'network') {
        // Handle network errors
      } else if (error.type === 'api') {
        // Handle API errors
      }
    },
  }
);
```

## Monitoring and Debugging

### Cache Monitoring

```tsx
import { useCacheStats } from '@/lib/hooks';

function CacheMonitor() {
  const { stats, metrics } = useCacheStats();

  return (
    <div>
      <h3>Cache Performance</h3>
      <p>Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</p>
      <p>Total Entries: {stats.size}</p>
      <p>Cache Hits: {metrics.hits}</p>
      <p>Cache Misses: {metrics.misses}</p>
    </div>
  );
}
```

### Optimistic Monitoring

```tsx
import { useOptimisticStats } from '@/lib/hooks';

function OptimisticMonitor() {
  const { stats, metrics } = useOptimisticStats();

  return (
    <div>
      <h3>Optimistic Updates</h3>
      <p>Total Updates: {stats.totalUpdates}</p>
      <p>Success Rate: {(stats.successRate * 100).toFixed(1)}%</p>
      <p>Pending Updates: {stats.pendingUpdates}</p>
      <p>Failed Updates: {stats.failedUpdates}</p>
    </div>
  );
}
```

## Example Usage

See `CacheOptimisticExample.tsx` for a comprehensive example demonstrating all features.

## Troubleshooting

### Common Issues

1. **Cache not persisting**: Check localStorage permissions
2. **Optimistic updates not rolling back**: Ensure original data is provided
3. **Performance issues**: Monitor cache hit rates and optimize TTL
4. **Memory leaks**: Use cleanup methods and monitor cache size

### Debug Tools

- **Cache statistics**: Use `useCacheStats` hook
- **Optimistic statistics**: Use `useOptimisticStats` hook
- **Console logging**: Enable debug mode for detailed logs
- **Browser DevTools**: Inspect localStorage and memory usage

## Future Enhancements

- [ ] **Server-side caching**: Integrate with Redis or similar
- [ ] **Offline support**: Handle offline scenarios gracefully
- [ ] **Compression**: Add data compression for large cache entries
- [ ] **Analytics**: Track cache performance and user behavior
- [ ] **A/B testing**: Test different cache strategies
