/**
 * Cache Control Utilities
 *
 * Helper functions for cache key generation, expiration checking, and cache state management.
 * Used in conjunction with server/middleware/cache.ts for implementing stale-while-revalidate caching.
 */

import type { H3Event } from 'h3'

/**
 * Generates a consistent cache key from request URL and query parameters
 *
 * @param event - H3 event from server route
 * @param prefix - Optional prefix for namespacing (e.g., "articles", "speckits")
 * @returns Deterministic cache key string
 *
 * Examples:
 * - generateCacheKey(event, "articles") → "articles:list"
 * - generateCacheKey(event, "articles") with ?category=prompts → "articles:list:category=prompts"
 * - generateCacheKey(event, "speckits") with ?page=2 → "speckits:list:page=2"
 */
export function generateCacheKey(event: H3Event, prefix: string): string {
  const url = getRequestURL(event)
  const pathname = url.pathname
  const searchParams = url.searchParams

  // Build cache key parts
  const parts: string[] = [prefix]

  // Add path identifier (remove leading slash)
  if (pathname !== '/') {
    const pathParts = pathname.split('/').filter(Boolean)
    parts.push(...pathParts)
  } else {
    parts.push('list')
  }

  // Add query parameters sorted alphabetically for consistency
  if (searchParams.toString()) {
    const sortedParams = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
    parts.push(sortedParams.join(':'))
  }

  return parts.join(':')
}

/**
 * Checks if a cache entry is expired (beyond stale period)
 *
 * @param expiresAt - Expiration timestamp from cache entry
 * @param staleAt - Stale expiration timestamp from cache entry
 * @returns true if cache entry is expired and should not be used
 */
export function isExpired(expiresAt: number, staleAt: number): boolean {
  const now = Date.now()
  return now >= staleAt
}

/**
 * Checks if a cache entry is stale but still usable
 *
 * @param expiresAt - Expiration timestamp from cache entry
 * @param staleAt - Stale expiration timestamp from cache entry
 * @returns true if cache entry is stale but within stale window
 */
export function isStaleButUsable(expiresAt: number, staleAt: number): boolean {
  const now = Date.now()
  return now >= expiresAt && now < staleAt
}

/**
 * Checks if a cache entry is fresh
 *
 * @param expiresAt - Expiration timestamp from cache entry
 * @returns true if cache entry is fresh (not expired)
 */
export function isFresh(expiresAt: number): boolean {
  const now = Date.now()
  return now < expiresAt
}

/**
 * Calculates cache age in milliseconds
 *
 * @param cachedAt - Timestamp when data was cached
 * @returns Age in milliseconds
 */
export function getCacheAge(cachedAt: number): number {
  return Date.now() - cachedAt
}

/**
 * Formats cache age for human-readable display
 *
 * @param cachedAt - Timestamp when data was cached
 * @returns Formatted age string (e.g., "2 minutes ago", "1 hour ago")
 */
export function formatCacheAge(cachedAt: number): string {
  const age = getCacheAge(cachedAt)
  const seconds = Math.floor(age / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
  }
}

/**
 * Generates cache key for articles list with optional filters
 *
 * @param category - Optional category filter
 * @param tag - Optional tag filter
 * @param page - Page number (defaults to 1)
 * @returns Cache key string
 */
export function generateArticlesCacheKey(
  category?: string,
  tag?: string,
  page: number = 1
): string {
  const parts = ['articles', 'list']

  if (category) {
    parts.push(`category=${category}`)
  }

  if (tag) {
    parts.push(`tag=${tag}`)
  }

  if (page > 1) {
    parts.push(`page=${page}`)
  }

  return parts.join(':')
}

/**
 * Generates cache key for speckits list with optional pagination
 *
 * @param page - Page number (defaults to 1)
 * @returns Cache key string
 */
export function generateSpeckitsCacheKey(page: number = 1): string {
  return page > 1 ? `speckits:list:page=${page}` : 'speckits:list'
}

/**
 * Generates cache key for page by slug
 *
 * @param slug - Page slug
 * @returns Cache key string
 */
export function generatePageCacheKey(slug: string): string {
  return `pages:slug=${slug}`
}

/**
 * Generates cache key for article by ID or slug
 *
 * @param identifier - Article ID or slug
 * @returns Cache key string
 */
export function generateArticleCacheKey(identifier: string): string {
  // Check if identifier looks like an ID (numeric) or slug (alphanumeric)
  return /^\d+$/.test(identifier)
    ? `articles:id=${identifier}`
    : `articles:slug=${identifier}`
}
