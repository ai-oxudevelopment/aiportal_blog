/**
 * Stale-While-Revalidate Cache Middleware
 *
 * Provides in-memory caching with stale-while-revalidate semantics for SSR routes.
 * - Fresh cache: 5 minutes (300,000ms) - serves immediately without refresh
 * - Stale cache: 1 hour (3,600,000ms) - serves stale content while refreshing in background
 * - Expired: After 1 hour - cache entry is removed
 *
 * Usage:
 * ```typescript
 * import { withStaleWhileRevalidate } from '../server/middleware/cache'
 *
 * const { data, stale } = await withStaleWhileRevalidate(
 *   'cache-key',
 *   async () => await fetchDataFromSource()
 * )
 * ```
 */

interface CacheEntry<T> {
  data: T
  cachedAt: number
  expiresAt: number
  staleAt: number
}

// In-memory cache store
const cache = new Map<string, CacheEntry<unknown>>()

// Cache TTL constants
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes - fresh cache duration
const STALE_TTL = 60 * 60 * 1000 // 1 hour - total cache duration including stale period

/**
 * Wrapper for data fetching with stale-while-revalidate caching
 *
 * @param cacheKey - Unique key for caching the data
 * @param fetcher - Async function that fetches fresh data
 * @returns Object with data and stale flag indicating if data is stale
 *
 * Cache behavior:
 * - Fresh cache hit: Returns cached data immediately, stale=false
 * - Stale cache hit: Returns cached data immediately, triggers background refresh, stale=true
 * - Cache miss: Fetches fresh data, caches it, stale=false
 * - Fetch error: Returns stale cache if available (even if expired), otherwise throws
 */
export async function withStaleWhileRevalidate<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<{ data: T; stale: boolean }> {
  const now = Date.now()
  const cached = cache.get(cacheKey)

  // Fresh cache hit - return immediately
  if (cached && now < cached.expiresAt) {
    return { data: cached.data as T, stale: false }
  }

  // Stale cache hit - return stale data, refresh in background
  if (cached && now < cached.staleAt) {
    // Trigger background refresh without blocking response
    fetcher()
      .then(freshData => {
        // Update cache with fresh data
        cache.set(cacheKey, createCacheEntry(freshData))
      })
      .catch(error => {
        // Background refresh failed - stale data remains in cache
        // Log error for monitoring
        console.error(`Cache refresh failed for key "${cacheKey}":`, error)
      })

    return { data: cached.data as T, stale: true }
  }

  // Cache miss or expired - fetch fresh data
  try {
    const freshData = await fetcher()
    cache.set(cacheKey, createCacheEntry(freshData))
    return { data: freshData, stale: false }
  } catch (error) {
    // If we have expired stale cache, return it instead of throwing
    if (cached) {
      console.warn(`Fetch failed for key "${cacheKey}", serving expired stale cache:`, error)
      return { data: cached.data as T, stale: true }
    }
    // No cache available - rethrow error
    throw error
  }
}

/**
 * Creates a cache entry with appropriate expiration times
 */
function createCacheEntry<T>(data: T): CacheEntry<T> {
  const now = Date.now()
  return {
    data,
    cachedAt: now,
    expiresAt: now + CACHE_TTL, // Fresh cache expires after 5 minutes
    staleAt: now + STALE_TTL // Stale cache expires after 1 hour
  }
}

/**
 * Clears all cache entries
 * Useful for testing or manual cache invalidation
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Clears a specific cache entry
 */
export function clearCacheEntry(key: string): void {
  cache.delete(key)
}

/**
 * Gets cache statistics for monitoring
 */
export function getCacheStats() {
  const now = Date.now()
  const entries = Array.from(cache.entries())

  return {
    totalEntries: entries.length,
    freshEntries: entries.filter(([, entry]) => now < entry.expiresAt).length,
    staleEntries: entries.filter(
      ([, entry]) => now >= entry.expiresAt && now < entry.staleAt
    ).length,
    expiredEntries: entries.filter(([, entry]) => now >= entry.staleAt).length,
    keys: entries.map(([key]) => key)
  }
}
