<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
      <div class="text-center py-8 xs:py-12 sm:py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-lg shadow-xl mb-4 xs:mb-6 sm:mb-8">
        <h1 class="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          Библиотека агентов
        </h1>
        <p class="mt-4 xs:mt-6 sm:mt-8 text-base xs:text-lg sm:text-xl text-gray-400">
          Добро пожаловать в aiworkplace — платформу для операционных сотрудников.<br class="hidden xs:block">
          Здесь вы найдете готовые инструкции для AI-моделей и сможете использовать их в своей работе.
        </p>
      </div>

      <!-- Main Layout -->
      <div class="flex flex-col md:flex-row gap-4 md:gap-8">
        <!-- Categories Sidebar (Desktop) - Lazy loaded -->
        <aside class="w-full md:w-64 flex-shrink-0 hidden lg:block">
          <CategoriesFilter
            :categories="categories"
            :selected-categories="selectedCategories"
            @update:selected-categories="updateSelectedCategories"
          />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 w-full">
          <!-- Search Bar - Lazy loaded -->
          <div class="mb-6 xs:mb-8">
            <PromptSearch
              v-model="searchQuery"
              placeholder="Поиск по базе prompt"
            />
          </div>

          <!-- Mobile Categories (Horizontal Scroll) - Lazy loaded -->
          <div class="lg:hidden mb-4 xs:mb-6">
            <MobileCategoriesFilter
              :categories="categories"
              :selected-categories="selectedCategories"
              @update:selected-categories="updateSelectedCategories"
            />
          </div>

          <!-- Prompt Cards Grid - Lazy loaded -->
          <PromptGrid
            :prompts="filteredPrompts"
            :loading="loading"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import type { PromptPreview, Category } from '~/types/article'

// Lazy load non-critical components (filters, search) for better TBT
const CategoriesFilter = defineAsyncComponent(() =>
  import('~/components/prompt/CategoriesFilter.vue')
)
const MobileCategoriesFilter = defineAsyncComponent(() =>
  import('~/components/prompt/MobileCategoriesFilter.vue')
)
const PromptSearch = defineAsyncComponent(() =>
  import('~/components/prompt/PromptSearch.vue')
)

// CRITICAL: Import PromptGrid synchronously for immediate interactivity
import PromptGrid from '~/components/prompt/PromptGrid.vue'

// Nuxt composables (auto-imported in Nuxt 3, but needed for TypeScript)
declare function useAsyncData(key: string, fn: () => Promise<any>): any

// State
const searchQuery = ref('')
const selectedCategories = ref<number[]>([])

// Fallback data when API fails
const fallbackPrompts: PromptPreview[] = [
  {
    id: 1,
    title: "Pareto Principle Knowledge Accelerator",
    slug: "pareto-principle-knowledge-accelerator",
    description: "You are PARETO-MENTOR, an elite learning optimization specialist who has mastered the art of distilling complex topics to their essential core. Your expertise lies in identifying the 20% of knowledge that delivers 80% of understanding.",
    type: "prompt",
    categories: [{ id: 1, name: "Education" }]
  },
  {
    id: 2,
    title: "Strategic Truth-Teller Advisor",
    slug: "strategic-truth-teller-advisor",
    description: "ROLE DEFINITION: You are my Elite Strategic Advisor - a synthesis of the world's top management consultants, executive coaches, and industry pioneers. Your mission is to provide unvarnished, actionable insights that cut through complexity and drive results.",
    type: "prompt",
    categories: [{ id: 2, name: "Assistant" }]
  },
  {
    id: 3,
    title: "Niche Opportunity Analyzer",
    slug: "niche-opportunity-analyzer",
    description: "Purpose: Identify the most financially promising online business opportunities based on market trends, your skills, and available capital to maximize ROI potential.",
    type: "prompt",
    categories: [{ id: 3, name: "Business" }]
  }
]

const fallbackCategories: Category[] = [
  { id: 1, name: "Education" },
  { id: 2, name: "Assistant" },
  { id: 3, name: "Business" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "SEO" }
]

// Data fetching with SSR support
const { data: prompts, pending: loading, error, refresh } = await useAsyncData(
  'articles-home',
  async () => {
    const response = await $fetch('/api/articles') as any
    return response.data || []
  }
)

// Computed: Extract categories reactively (works on both server AND client for SSR)
const categories = computed(() => {
  // If API call succeeded and we have data, extract categories from prompts
  if (prompts.value && prompts.value.length > 0) {
    const uniqueCategories = new Map<number, Category>()
    prompts.value.forEach((prompt: any) => {
      prompt.categories?.forEach((cat: Category) => {
        uniqueCategories.set(cat.id, cat)
      })
    })
    return Array.from(uniqueCategories.values())
  }
  // Use fallback categories when API fails or returns no data
  return fallbackCategories
})

// Computed: Get actual prompts to use (either from API or fallback)
const actualPrompts = computed(() => {
  if (prompts.value && prompts.value.length > 0) {
    return prompts.value as PromptPreview[]
  }
  // Use fallback data when API fails or returns no data
  return fallbackPrompts
})

// Computed
const filteredPrompts = computed(() => {
  let filtered = actualPrompts.value

  // Filter by categories - if nothing selected, show all
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(prompt =>
      prompt.categories?.some((cat: Category) => selectedCategories.value.includes(cat.id))
    )
  }
  // If no categories selected, show all prompts (no filtering)

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(prompt =>
      prompt.title.toLowerCase().includes(query) ||
      prompt.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const updateSelectedCategories = (newCategories: number[]) => {
  selectedCategories.value = newCategories
}
</script>
