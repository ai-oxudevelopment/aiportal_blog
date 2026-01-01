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
        <!-- Categories Sidebar (Desktop) -->
        <aside class="w-full md:w-64 flex-shrink-0 hidden lg:block">
          <CategoriesFilter
            :categories="categories"
            :selected-categories="selectedCategories"
            @update:selected-categories="updateSelectedCategories"
          />
        </aside>

        <!-- Main Content -->
        <main class="flex-1 w-full">
          <!-- Search Bar -->
          <div class="mb-6 xs:mb-8">
            <PromptSearch
              v-model="searchQuery"
              placeholder="Поиск по базе prompt"
            />
          </div>

          <!-- Mobile Categories (Horizontal Scroll) -->
          <div class="lg:hidden mb-4 xs:mb-6">
            <MobileCategoriesFilter
              :categories="categories"
              :selected-categories="selectedCategories"
              @update:selected-categories="updateSelectedCategories"
            />
          </div>

          <!-- Prompt Cards Grid -->
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
import { ref, computed, onMounted } from 'vue'
import { useFetchArticles } from '~/composables/useFetchArticles'
import type { PromptPreview, Category } from '~/types/article'

// Components
import CategoriesFilter from '~/components/prompt/CategoriesFilter.vue'
import MobileCategoriesFilter from '~/components/prompt/MobileCategoriesFilter.vue'
import PromptSearch from '~/components/prompt/PromptSearch.vue'
import PromptGrid from '~/components/prompt/PromptGrid.vue'

// State
const searchQuery = ref('')
const selectedCategories = ref<number[]>([])
const categories = ref<Category[]>([])

// Data fetching
const { articles: prompts, loading, error, fetchArticles } = useFetchArticles()

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

// Computed
const filteredPrompts = computed(() => {
  let filtered = prompts.value as PromptPreview[]

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

// Lifecycle
onMounted(async () => {
  try {
    await fetchArticles()
    
    // If API call succeeded and we have data
    if (prompts.value && prompts.value.length > 0) {
      // Extract unique categories from prompts
      const uniqueCategories = new Map()
      prompts.value.forEach((prompt: any) => {
        prompt.categories?.forEach((cat: Category) => {
          uniqueCategories.set(cat.id, cat)
        })
      })
      categories.value = Array.from(uniqueCategories.values())
    } else {
      // Use fallback data when API fails or returns no data
      console.warn('API returned no data, using fallback prompts')
      prompts.value = fallbackPrompts as any
      categories.value = fallbackCategories
    }
  } catch (err) {
    console.error('Failed to fetch articles, using fallback data:', err)
    // Use fallback data when API fails
    prompts.value = fallbackPrompts as any
    categories.value = fallbackCategories
  }
})
</script>