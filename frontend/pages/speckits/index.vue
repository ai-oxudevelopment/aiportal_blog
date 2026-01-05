<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
      <div class="text-center py-8 xs:py-12 sm:py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-lg shadow-xl mb-4 xs:mb-6 sm:mb-8">
        <h1 class="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          IDE инструкции
        </h1>
        <p class="mt-4 xs:mt-6 sm:mt-8 text-base xs:text-lg sm:text-xl text-gray-400">
          Speckit инструкции, шаблоны и примеры для эффективной работы с Claude Code.<br class="hidden xs:block">
          Здесь вы найдете ресурсы для быстрого старта и лучших практик.
        </p>
      </div>

      <!-- Main Layout -->
      <div class="flex flex-col md:flex-row gap-4 md:gap-8">
        <!-- Categories Sidebar (Desktop) -->
        <aside v-if="categories.length > 0" class="w-full md:w-64 flex-shrink-0 hidden lg:block">
          <CategoriesFilter
            :categories="categories"
            :selected-categories="selectedCategory"
            @update:selected-categories="updateSelectedCategory"
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
              :selected-categories="selectedCategory"
              @update:selected-categories="updateSelectedCategory"
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
            :prompts="filteredSpeckits"
            :loading="false"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetchSpeckits } from '~/composables/useFetchSpeckits'
import type { Category } from '~/types/article'

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
const selectedCategory = ref<string | null>(null)
const categories = ref<Category[]>([])

// Data fetching
const { speckits, loading, error, refresh } = useFetchSpeckits()

// Computed
const filteredSpeckits = computed(() => {
  let filtered = speckits.value as unknown as SpeckitItem[]

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((speckit: SpeckitItem) =>
      speckit.categories?.some((cat: Category) => cat.name === selectedCategory.value)
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
const updateSelectedCategory = (category: string | null) => {
  selectedCategory.value = category
}

const retryFetch = () => {
  refresh()
}

// Lifecycle
onMounted(async () => {
  console.log('[speckits/index] Component mounted, waiting for data...')

  // Wait for data to load
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('[speckits/index] Speckits value:', speckits.value)
  console.log('[speckits/index] Speckits length:', speckits.value?.length)

  // If we have data, extract categories
  if (speckits.value && speckits.value.length > 0) {
    console.log('[speckits/index] Extracting categories from speckits...')

    const uniqueCategories = new Map()
    speckits.value.forEach((speckit: any) => {
      console.log(`[speckits/index] Processing speckit: ${speckit.title}, categories:`, speckit.categories)

      speckit.categories?.forEach((cat: Category) => {
        console.log(`[speckits/index] Adding category: ${cat.name}`)
        uniqueCategories.set(cat.id, cat)
      })
    })

    categories.value = Array.from(uniqueCategories.values())
    console.log('[speckits/index] Final categories array:', categories.value)
  } else {
    console.log('[speckits/index] No speckits found, categories will remain empty')
  }
})
</script>
