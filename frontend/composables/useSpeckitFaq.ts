// composables/useSpeckitFaq.ts
/**
 * FAQ composable for loading and managing Speckit FAQ data
 * Loads static FAQ content from public/speckit-faq.json
 */

import { ref, onMounted } from 'vue'
import type { SpeckitFaqData, SpeckitFaqCategory } from '~/types/article'

export interface UseSpeckitFaqReturn {
  faqData: Ref<SpeckitFaqData | null>
  categories: Ref<SpeckitFaqCategory[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  loadFaq: () => Promise<void>
  expandedCategories: Ref<Set<string>>
  toggleCategory: (categoryId: string) => void
}

export function useSpeckitFaq(): UseSpeckitFaqReturn {
  const faqData = ref<SpeckitFaqData | null>(null)
  const categories = ref<SpeckitFaqCategory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const expandedCategories = ref<Set<string>>(new Set())

  /**
   * Load FAQ data from static JSON file
   */
  const loadFaq = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/speckit-faq.json')

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: SpeckitFaqData = await response.json()

      faqData.value = data
      categories.value = data.categories || []

      console.log('[useSpeckitFaq] FAQ loaded successfully:', {
        version: data.version,
        categoriesCount: categories.value.length,
        totalQuestions: categories.value.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = `Не удалось загрузить FAQ: ${errorMessage}`
      console.error('[useSpeckitFaq] Load error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle category expansion
   */
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId)
    } else {
      expandedCategories.value.add(categoryId)
    }
    // Force reactivity update
    expandedCategories.value = new Set(expandedCategories.value)
  }

  // Auto-load FAQ on mount
  onMounted(() => {
    loadFaq()
  })

  return {
    faqData,
    categories,
    isLoading,
    error,
    loadFaq,
    expandedCategories,
    toggleCategory
  }
}
