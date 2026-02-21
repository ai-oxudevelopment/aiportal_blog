// useSpeckitList Composable
// Presentation layer composable for managing speckit list state

import { ref, computed, type Ref } from 'vue'
import type { Article } from '@/domain/entities'
import { GetSpeckitList } from '@/application/use-cases'
import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

export interface SpeckitListFilters {
  category?: string
  search?: string
}

export function useSpeckitList(filters?: SpeckitListFilters) {
  const speckits: Ref<Article[]> = ref([])
  const isLoading = ref(false)
  const error: Ref<string | null> = ref(null)

  const articlesRepo = createStrapiArticlesRepository()
  const getSpeckitListUC = new GetSpeckitList(articlesRepo)

  const fetchSpeckits = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await getSpeckitListUC.execute(filters || {})
      speckits.value = result.speckits
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch speckits'
    } finally {
      isLoading.value = false
    }
  }

  // Load on mount
  fetchSpeckits()

  return {
    speckits: computed(() => speckits.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchSpeckits,
    refresh: fetchSpeckits
  }
}
