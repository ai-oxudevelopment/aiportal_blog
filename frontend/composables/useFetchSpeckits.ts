import { ref } from 'vue'

export function useFetchSpeckits() {
  const speckits = ref([])
  const loading = ref(true)
  const error = ref(null)

  const fetchSpeckits = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('[useFetchSpeckits] Starting fetch...')
      const response = await $fetch('/api/speckits')

      console.log('[useFetchSpeckits] Raw API response:', response)

      speckits.value = response.data || []

      console.log(`[useFetchSpeckits] Fetched ${speckits.value.length} speckits`)
      console.log('[useFetchSpeckits] Speckits data:', JSON.stringify(speckits.value, null, 2))

      if (speckits.value.length === 0) {
        console.log('[useFetchSpeckits] No speckits found - will show empty state')
      } else {
        // Extract unique categories for debugging
        const categories = new Set()
        speckits.value.forEach((speckit: any) => {
          console.log(`[useFetchSpeckits] Processing speckit: ${speckit.title} with ${speckit.categories?.length || 0} categories`)
          speckit.categories?.forEach((cat: any) => {
            console.log(`[useFetchSpeckits] Category: ${cat.name}`)
            categories.add(cat.name)
          })
        })
        console.log('[useFetchSpeckits] Available categories:', Array.from(categories))
      }
    } catch (err: any) {
      console.error('[useFetchSpeckits] Failed to fetch speckits:', err)
      console.error('[useFetchSpeckits] Error details:', {
        message: err.message,
        statusCode: err.statusCode,
        data: err.data
      })
      error.value = err
      speckits.value = []
    } finally {
      loading.value = false
      console.log('[useFetchSpeckits] Fetch completed')
    }
  }

  // Auto-fetch on call
  fetchSpeckits()

  return {
    speckits,
    loading,
    error,
    refresh: fetchSpeckits
  }
}
