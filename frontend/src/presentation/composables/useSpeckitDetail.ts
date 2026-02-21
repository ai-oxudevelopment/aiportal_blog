// useSpeckitDetail Composable
// Presentation layer composable for managing speckit detail state

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import type { Article } from '@/domain/entities'
import { GetSpeckitDetail, DownloadSpeckitFile } from '@/application/use-cases'
import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

export function useSpeckitDetail(slug: () => string) {
  const speckit: Ref<Article | null> = ref(null)
  const relatedSpeckits: Ref<Article[]> = ref([])
  const isLoading = ref(false)
  const error: Ref<string | null> = ref(null)
  const isDownloading = ref(false)

  const articlesRepo = createStrapiArticlesRepository()
  const getSpeckitDetailUC = new GetSpeckitDetail(articlesRepo)
  const downloadUC = new DownloadSpeckitFile(articlesRepo)

  const fetchSpeckit = async () => {
    const slugValue = slug()
    if (!slugValue) return

    isLoading.value = true
    error.value = null

    try {
      const result = await getSpeckitDetailUC.execute({ slug: slugValue })
      speckit.value = result.speckit
      relatedSpeckits.value = result.relatedSpeckits || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch speckit'
    } finally {
      isLoading.value = false
    }
  }

  const downloadFile = async () => {
    if (!speckit.value) return

    isDownloading.value = true
    error.value = null

    try {
      const result = await downloadUC.execute({ speckitSlug: speckit.value.slug })

      // Trigger browser download
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to download file'
    } finally {
      isDownloading.value = false
    }
  }

  // Watch for slug changes
  watch(
    () => slug(),
    () => {
      fetchSpeckit()
    },
    { immediate: true }
  )

  return {
    speckit: computed(() => speckit.value) as ComputedRef<Article | null>,
    relatedSpeckits: computed(() => relatedSpeckits.value),
    isLoading: computed(() => isLoading.value),
    isDownloading: computed(() => isDownloading.value),
    error: computed(() => error.value),
    fetchSpeckit,
    downloadFile
  }
}
