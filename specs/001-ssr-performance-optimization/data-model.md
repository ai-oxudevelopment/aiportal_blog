# Data Model: SSR Performance Optimization

**Feature**: 001-ssr-performance-optimization
**Date**: 2025-01-09
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature does not introduce new domain entities but adds caching metadata to existing entities and introduces caching-related types for the stale-while-revalidate pattern.

---

## Existing Entities (Unchanged)

### Article
Represents a blog article or content piece from Strapi CMS.

```typescript
interface Article {
  id: string
  title: string
  body: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  publishedAt: string // ISO 8601
}
```

### Page
Represents a generic page with metadata.

```typescript
interface Page {
  id: string
  title: string
  description: string
  content: string
  slug: string
  meta: {
    title: string
    description: string
    ogImage?: string
  }
}
```

---

## New Caching Types

### CachedResponse<T>
Wrapper for cached data from server routes with metadata for stale-while-revalidate.

```typescript
interface CachedResponse<T> {
  data: T
  cachedAt: number // Unix timestamp
  stale: boolean // Indicates if data is stale (backend failed to refresh)
}
```

**Usage**:
- Used internally in server routes for caching
- Not exposed to client components
- `stale` flag added to HTTP response headers (`X-Content-Stale`)

### CacheEntry
Internal cache storage structure.

```typescript
interface CacheEntry {
  data: unknown // Cached response data
  cachedAt: number // Unix timestamp when cached
  stale: boolean // Whether marked as stale (refresh failed)
  expiresAt: number // Unix timestamp when fresh cache expires
  staleAt: number // Unix timestamp when stale period ends
}
```

**Usage**:
- Stored in in-memory Map (key: request URL + params)
- Managed by `server/middleware/cache.ts`

---

## Cache Key Patterns

### Article Cache Keys

```
articles:list                           # List of all articles
articles:list:category:{category}       # Articles by category
articles:list:tag:{tag}                 # Articles by tag
articles:id:{id}                        # Single article by ID
articles:slug:{slug}                    # Single article by slug
```

### Page Cache Keys

```
pages:slug:{slug}                       # Page by slug
pages:id:{id}                           # Page by ID
```

### Speckit Cache Keys

```
speckits:list                           # List of all speckits
speckits:id:{id}                        # Single speckit by ID
```

---

## Cache State Transitions

```text
┌─────────────┐
│  INITIAL    │
└──────┬──────┘
       │ fetch()
       ↓
┌─────────────┐
│   FRESH     │ ◄───────┐
│ (TTL: 5min) │         │
└──────┬──────┘         │
       │ TTL expires    │ Successful refresh
       ↓                │
┌─────────────┐         │
│   STALE     │ ────────┘
│ (refresh)   │
└──────┬──────┘
       │
       ├─► Refresh succeeds → FRESH
       │
       ├─► Refresh fails → mark stale, serve anyway
       │
       └─► Stale expires (1hr) → INITIAL
```

---

## Request/Response Flow

### Server Route with Caching

```typescript
// Input: H3Event
// Output: CachedResponse<Article>

export default defineEventHandler(async (event) => {
  // 1. Generate cache key from request
  const cacheKey = generateCacheKey(event)

  // 2. Check cache
  const cached = cache.get(cacheKey)

  // 3. Return fresh cache if available
  if (cached && !isExpired(cached)) {
    return {
      data: cached.data,
      stale: false
    }
  }

  // 4. Return stale cache if available and within stale window
  if (cached && isStaleButUsable(cached)) {
    // Trigger background refresh
    refreshCache(cacheKey).catch(() => {
      // Mark as stale if refresh fails
      markStale(cacheKey)
    })
    return {
      data: cached.data,
      stale: true
    }
  }

  // 5. Cache miss - fetch from Strapi
  try {
    const freshData = await fetchFromStrapi(event)
    cache.set(cacheKey, createCacheEntry(freshData))
    return {
      data: freshData,
      stale: false
    }
  } catch (error) {
    // If we have expired stale cache, return it
    if (cached) {
      return {
        data: cached.data,
        stale: true
      }
    }
    throw error
  }
})
```

### Client Consumption

```typescript
// composables/useArticles.ts
export const useArticles = () => {
  const { data, error, pending } = useAsyncData<Article[]>(
    'articles',
    () => $fetch('/api/articles')
  )

  // Check for stale content from response headers
  const isStale = computed(() => {
    // Access response headers via useFetch options
    return error.value?.response?.headers?.get('X-Content-Stale') === 'true'
  })

  return {
    data,
    error,
    pending,
    isStale
  }
}
```

---

## Validation Rules

### Cache Key Generation
- **Rule**: Cache keys must be deterministic and include all request parameters
- **Validation**: Test with same request → same cache key
- **Example**: `/api/articles?category=prompts&page=1` → `articles:list:category=prompts:page=1`

### Cache Expiration
- **Rule**: Fresh cache expires after 5 minutes (300,000ms)
- **Rule**: Stale cache expires after 1 hour (3,600,000ms)
- **Validation**: Unit test cache expiration logic

### Stale Flag
- **Rule**: Set `X-Content-Stale: true` header when serving stale data
- **Rule**: Client components check this header to show banner
- **Validation**: Integration test with Strapi failure scenario

---

## Performance Considerations

### Memory Usage
- **Assumption**: ~1000 cached entries maximum
- **Estimate**: 1000 entries × 10KB avg = ~10MB memory
- **Mitigation**: LRU eviction if cache grows too large

### Cache Hit Ratio (Target)
- **Fresh cache hit**: >70% (most requests hit fresh cache)
- **Stale cache hit**: <20% (occasional backend issues)
- **Cache miss**: <10% (first request, expired entries)

### Response Time Targets
- **Fresh cache hit**: <50ms
- **Stale cache hit**: <50ms (background refresh async)
- **Cache miss (Strapi fetch)**: <500ms

---

## SSR Hydration Data

### Initial State
Server-rendered pages include cached data in `<script>` tag for hydration:

```html
<script>
window.__NUXT__ = {
  data: [
    {
      key: 'articles:list',
      data: [...], // Cached article list
      stale: false
    }
  ]
}
</script>
```

### Client Hydration
Nuxt automatically hydrates Vue components with `__NUXT__` data. Client-side composables check `isStale` flag to show banners if needed.

---

## Migration Notes

### No Schema Changes
- Existing Strapi content types unchanged
- No database migrations required
- Cache is in-memory (no persistent storage)

### Backward Compatibility
- Client components work unchanged (add optional `isStale` check)
- Server routes get caching wrapper
- No breaking changes to API contracts

---

## Testing Considerations

### Unit Tests
- Cache key generation
- Cache expiration logic
- Stale-while-revalidate flow
- Error handling (Strapi failures)

### Integration Tests
- Server route with real Strapi (mocked)
- Cache hit/miss scenarios
- Stale content banner display
- Background refresh behavior

### Performance Tests
- Cache hit ratio
- Response time measurements
- Memory usage monitoring
- PageSpeed Insights validation

---

## Related Files

- `server/middleware/cache.ts` - Cache implementation
- `server/api/articles.get.ts` - Example cached route
- `components/shared/banners/StaleContentBanner.vue` - Stale content indicator
- `composables/useArticles.ts` - Client data fetching with stale detection

---

## Summary

This feature introduces a caching layer on top of existing domain entities. No new business entities are created, but cache metadata (`cachedAt`, `stale`) is added to responses. The stale-while-revalidate pattern ensures resilience against Strapi failures while maintaining performance.
