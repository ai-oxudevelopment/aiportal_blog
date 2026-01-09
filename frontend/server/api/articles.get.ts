/**
 * Articles API Route with Stale-While-Revalidate Caching
 *
 * Fetches articles from Strapi CMS with caching to improve performance and resilience.
 * - Fresh cache: 5 minutes
 * - Stale cache: 1 hour (served during Strapi outages)
 */

import { withStaleWhileRevalidate } from '../utils/cache-wrapper'
import { generateCacheKey } from '../utils/cache-control'

export default defineEventHandler(async (event) => {
  // Generate cache key from request
  const cacheKey = generateCacheKey(event, 'articles')

  // Wrap Strapi fetch with cache middleware
  const { data, stale } = await withStaleWhileRevalidate(
    cacheKey,
    async () => {
      const query = getQuery(event)

      // Build the Strapi API URL
      const strapiUrl = process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'
      const apiUrl = new URL('/api/articles', strapiUrl)

      // Add basic query parameters with proper handling
      const fields = ['title', 'description', 'slug']
      fields.forEach((field, index) => {
        apiUrl.searchParams.append(`fields[${index}]`, field)
      })

      // Add populate parameter
      apiUrl.searchParams.append('populate[0]', 'categories')

      // Add pagination to get more items
      apiUrl.searchParams.append('pagination[pageSize]', '100')

      console.log('[articles.get] Fetching from Strapi:', apiUrl.toString())

      const response = await $fetch(apiUrl.toString())

      console.log(`[articles.get] Successfully fetched ${response.data?.length || 0} articles from Strapi`)

      return response
    }
  )

  // Add HTTP cache headers for browser and CDN caching (improves LCP)
  // Cache for 5 minutes, stale for 1 hour (matches server-side cache settings)
  setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=3600, stale-if-error=3600')
  setHeader(event, 'X-Content-Cache-TTL', '300')

  // Add header to indicate stale content
  if (stale) {
    setHeader(event, 'X-Content-Stale', 'true')
  }

  return data
})
