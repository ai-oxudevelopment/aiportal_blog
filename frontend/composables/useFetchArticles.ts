import { ref } from 'vue'

/**
 * useFetchArticles Composable
 *
 * Fetches articles from the API with stale content detection.
 * Exposes reactive state for loading, error, data, and stale content status.
 *
 * Usage:
 * ```vue
 * <script setup>
 * const { articles, loading, error, isStale, fetchArticles } = useFetchArticles()
 * </script>
 *
 * <template>
 *   <StaleContentBanner v-if="isStale" />
 *   <SlowConnectionBanner v-if="loading" :pending="loading" />
 *   <div v-for="article in articles">{{ article.title }}</div>
 * </template>
 * ```
 */
export function useFetchArticles() {
  const articles = ref([])
  const loading = ref(true)
  const error = ref(null)
  const isStale = ref(false)

  const fetchArticles = async (filter?: any) => {
    loading.value = true
    error.value = null
    isStale.value = false

    try {
      console.log('[useFetchArticles] Fetching articles...')

      // Use our server-side API endpoint to bypass CORS issues
      const response = await $fetch('/api/articles') as any

      console.log('[useFetchArticles] Response:', response)

      articles.value = response.data || []

      // Log for debugging
      console.log(`[useFetchArticles] Fetched ${articles.value.length} articles via server-side proxy`)

      if (articles.value.length > 0) {
        console.log('[useFetchArticles] Sample article:', articles.value[0])

        // Log available categories for debugging
        const categories = new Set()
        articles.value.forEach((article: any) => {
          article.categories?.forEach((cat: any) => categories.add(cat.name))
        })
        console.log('[useFetchArticles] Available categories:', Array.from(categories))
      }
    } catch (err: any) {
      console.error('[useFetchArticles] Failed to fetch articles via proxy:', err)
      console.error('[useFetchArticles] Error details:', err.message || err)
      error.value = err
      articles.value = []

      // Check if error response has stale header
      if (err.response?.headers?.get('X-Content-Stale') === 'true') {
        isStale.value = true
      }
    } finally {
      loading.value = false
    }
  }

  // Auto-fetch on call
  fetchArticles()

  return { articles, loading, error, isStale, fetchArticles }
}
