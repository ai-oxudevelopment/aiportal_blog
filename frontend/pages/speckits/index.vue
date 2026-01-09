<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
      <div class="text-center py-8 xs:py-12 sm:py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-lg shadow-xl mb-4 xs:mb-6 sm:mb-8">
        <h1 class="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          Для проектирования
        </h1>
        <p class="mt-4 xs:mt-6 sm:mt-8 text-base xs:text-lg sm:text-xl text-gray-400">
          Speckit - готовые конфигурации для структурирования работы с AI-ассистентами.<br class="hidden xs:block">
          Конституции проектов, шаблоны планирования и лучшие практики для разработки.
        </p>
      </div>

      <!-- Main Layout -->
      <div class="flex flex-col md:flex-row gap-4 md:gap-8">
        <!-- Categories Sidebar (Desktop) -->
        <aside v-if="categories.length > 0" class="w-full md:w-64 flex-shrink-0 hidden lg:block">
          <CategoriesFilter
            :categories="categories"
            :selected-categories="selectedCategories"
            @update:selected-categories="updateSelectedCategories"
          />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 w-full">
          <!-- Search Bar -->
          <div v-if="categories.length > 0" class="mb-6 xs:mb-8">
            <PromptSearch
              v-model="searchQuery"
              placeholder="Поиск по speckits"
            />
          </div>

          <!-- Mobile Categories (Horizontal Scroll) -->
          <div v-if="categories.length > 0" class="lg:hidden mb-4 xs:mb-6">
            <MobileCategoriesFilter
              :categories="categories"
              :selected-categories="selectedCategories"
              @update:selected-categories="updateSelectedCategories"
            />
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
            <p class="text-gray-400">Загрузка...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <div class="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-4">
              <p class="text-red-400 mb-2">Не удалось загрузить speckits</p>
              <p class="text-red-300 text-sm">Проверьте подключение к серверу и попробуйте снова.</p>
            </div>
            <button
              @click="retryFetch"
              class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              Попробовать снова
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredSpeckits.length === 0" class="text-center py-12">
            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
              <svg class="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-400 text-lg mb-2">IDE инструкции пока не добавлены</p>
              <p class="text-gray-500 text-sm">Контент скоро появится в каталоге</p>
            </div>
          </div>

          <!-- Speckit Cards Grid -->
          <PromptGrid
            v-else
            :prompts="filteredSpeckits as unknown as (PromptPreview | SpeckitPreview)[]"
            :loading="false"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Category, PromptPreview, SpeckitPreview } from '~/types/article'

// Nuxt composables (auto-imported in Nuxt 3, but needed for TypeScript)
declare function useAsyncData(key: string, fn: () => Promise<any>): any

// Components
import CategoriesFilter from '~/components/prompt/CategoriesFilter.vue'
import MobileCategoriesFilter from '~/components/prompt/MobileCategoriesFilter.vue'
import PromptSearch from '~/components/prompt/PromptSearch.vue'
import PromptGrid from '~/components/prompt/PromptGrid.vue'

// Types for speckits (similar to PromptPreview)
interface SpeckitItem {
  id: string
  title: string
  slug: string
  description: string
  type: 'speckit'
  categories: Category[]
}

// State
const searchQuery = ref('')
const selectedCategories = ref<number[]>([])

// Data fetching with SSR support
const { data: speckits, pending: loading, error, refresh } = await useAsyncData(
  'speckits-list',
  async () => {
    const response = await $fetch('/api/speckits') as any
    return response.data || []
  }
)

// Computed: Extract categories reactively (works on both server AND client for SSR)
const categories = computed(() => {
  if (speckits.value && speckits.value.length > 0) {
    const uniqueCategories = new Map<number, Category>()
    speckits.value.forEach((speckit: any) => {
      speckit.categories?.forEach((cat: Category) => {
        // Debug: log categories without type or with wrong type
        if (!cat.type) {
          console.warn('[speckits/index] Category missing type field:', cat)
        } else if (cat.type !== 'speckit') {
          console.log('[speckits/index] Excluding non-speckit category:', cat)
        } else if (cat.type === 'speckit') {
          // Only include categories with type="speckit"
          uniqueCategories.set(cat.id, cat)
        }
      })
    })
    return Array.from(uniqueCategories.values())
  }
  return []
})

// Computed
const filteredSpeckits = computed(() => {
  let filtered = speckits.value as unknown as SpeckitItem[]

  // Filter by categories - if nothing selected, show all
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter((speckit: SpeckitItem) =>
      speckit.categories?.some((cat: Category) =>
        selectedCategories.value.includes(cat.id)
      )
    )
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((speckit: SpeckitItem) =>
      speckit.title.toLowerCase().includes(query) ||
      speckit.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const updateSelectedCategories = (newCategories: number[]) => {
  selectedCategories.value = newCategories
}

const retryFetch = () => {
  refresh()
}
</script>
