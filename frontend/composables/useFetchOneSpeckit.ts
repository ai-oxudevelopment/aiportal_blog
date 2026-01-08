import { ref } from 'vue'
import type { SpeckitFull } from '~/types/article'

export function useFetchOneSpeckit(slug: string) {
  const speckit = ref<SpeckitFull | null>(null)
  const loading = ref(true)
  const error = ref(null)

  const fetchSpeckit = async () => {
    if (!slug) {
      error.value = new Error('Slug is required')
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log(`[useFetchOneSpeckit] Fetching speckit with slug="${slug}"`)
      const response = await $fetch(`/api/speckits/${slug}`)

      console.log(`[useFetchOneSpeckit] Response:`, response)

      speckit.value = response.data || null

      if (!speckit.value) {
        throw new Error(`Speckit not found: ${slug}`)
      }

      console.log(`[useFetchOneSpeckit] Successfully fetched speckit: ${speckit.value.title}`)
    } catch (err: any) {
      console.error(`[useFetchOneSpeckit] Failed to fetch speckit with slug="${slug}":`, err)
      error.value = err
      speckit.value = null
    } finally {
      loading.value = false
    }
  }

  // Auto-fetch on call
  fetchSpeckit()

  return {
    speckit,
    loading,
    error,
    refresh: fetchSpeckit
  }
}
