/**
 * Speckits API Route with Stale-While-Revalidate Caching
 *
 * Fetches speckit-type articles from Strapi CMS with caching.
 * - Fresh cache: 5 minutes
 * - Stale cache: 1 hour (served during Strapi outages)
 */

import { withStaleWhileRevalidate } from '../utils/cache-wrapper'
import { generateCacheKey } from '../utils/cache-control'

export default defineEventHandler(async (event) => {
  // Generate cache key from request
  const cacheKey = generateCacheKey(event, 'speckits')

  // Wrap Strapi fetch with cache middleware
  const { data, stale } = await withStaleWhileRevalidate(
    cacheKey,
    async () => {
      const strapiUrl = process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'

      try {
    // First, try to fetch with type filter
    const apiUrl = new URL('/api/articles', strapiUrl)
    apiUrl.searchParams.append('filters[type][$eq]', 'speckit')

    // Populate categories (don't use fields[] to get proper structure)
    apiUrl.searchParams.append('populate', 'categories')

    // Pagination
    apiUrl.searchParams.append('pagination[pageSize]', '100')
    apiUrl.searchParams.append('sort[0]', 'createdAt:desc')

    console.log('[speckits.get] Fetching speckits from Strapi:', apiUrl.toString())

    const response = await $fetch(apiUrl.toString())

    console.log(`[speckits.get] Raw Strapi response:`, JSON.stringify(response, null, 2))

    // Check if response has data
    if (!response || !response.data) {
      console.error('[speckits.get] Invalid response structure:', response)
      return {
        data: [],
        meta: { pagination: { total: 0 } }
      }
    }

    console.log(`[speckits.get] Found ${response.data.length} articles in response`)

    // Normalize response to SpeckitPreview[] format
    const normalizedData = response.data.map((item: any) => {
      // Handle both flat format (Strapi v5 with fields) and nested format (Strapi v4/v5 without fields)
      const attrs = item.attributes || item

      console.log(`[speckits.get] Processing article:`, {
        id: item.id,
        attrs: attrs
      })

      // Handle categories in both formats
      const categoriesData = attrs.categories?.data || attrs.categories || []
      const categories = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.attributes?.name || cat.name,
        type: cat.attributes?.type || cat.type || 'speckit'
      }))

      return {
        id: String(item.id),
        title: attrs.title,
        slug: attrs.slug,
        description: attrs.description,
        type: 'speckit',
        categories: categories
      }
    })

    console.log(`[speckits.get] Normalized ${normalizedData.length} speckits`)
    console.log('[speckits.get] Normalized data:', JSON.stringify(normalizedData, null, 2))

    return {
      data: normalizedData,
      meta: response.meta
    }
  } catch (error: any) {
    console.error('[speckits.get] Error fetching speckits from Strapi:', error)
    console.error('[speckits.get] Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    })

    // If 400 error (likely type field doesn't exist), try fetching all articles
    if (error.statusCode === 400 || error.message?.includes('400')) {
      console.log('[speckits.get] Type field might not exist, fetching all articles to check...')

      try {
        const fallbackUrl = new URL('/api/articles', strapiUrl)
        fallbackUrl.searchParams.append('populate', 'categories')
        fallbackUrl.searchParams.append('pagination[pageSize]', '10')

        const response = await $fetch(fallbackUrl.toString())

        console.log('[speckits.get] Fallback response:', JSON.stringify(response, null, 2))

        // Filter for items with type="speckit" on client side
        const speckitItems = response.data?.filter((item: any) => {
          const attrs = item.attributes || item
          return attrs.type === 'speckit'
        }) || []

        console.log(`[speckits.get] Found ${speckitItems.length} speckits in all articles`)

        const normalizedData = speckitItems.map((item: any) => {
          const attrs = item.attributes || item
          const categoriesData = attrs.categories?.data || attrs.categories || []
          const categories = categoriesData.map((cat: any) => ({
            id: cat.id,
            name: cat.attributes?.name || cat.name,
            type: cat.attributes?.type || cat.type || 'speckit'
          }))

          return {
            id: String(item.id),
            title: attrs.title,
            slug: attrs.slug,
            description: attrs.description,
            type: 'speckit',
            categories: categories
          }
        })

        return {
          data: normalizedData,
          meta: response.meta
        }
      } catch (fallbackError: any) {
        console.error('[speckits.get] Fallback also failed:', fallbackError)
        // Return empty array instead of throwing error
        return {
          data: [],
          meta: { pagination: { total: 0 } }
        }
      }
    }

        // For other errors, return empty array to show empty state instead of error
        console.error('[speckits.get] Returning empty array due to error')
        return {
          data: [],
          meta: { pagination: { total: 0 } }
        }
      }
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
