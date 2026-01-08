<template>
  <div class="speckit-faq-section mt-12 mb-8">
    <!-- Section Header -->
    <div class="flex items-center gap-2 mb-6">
      <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-200">Вопросы и ответы</h3>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center p-8 bg-gray-950/30 rounded-xl border border-gray-800"
    >
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <span class="text-gray-400 text-sm">Загрузка FAQ...</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-red-900/20 rounded-xl border border-red-800"
      role="alert"
      aria-live="assertive"
    >
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 class="text-red-400 font-semibold mb-1">Ошибка загрузки FAQ</h4>
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- FAQ Content -->
    <div
      v-else-if="categories.length > 0"
      class="space-y-4"
    >
      <div
        v-for="category in sortedCategories"
        :key="category.id"
        class="bg-gray-950/30 rounded-xl border border-gray-800 overflow-hidden"
      >
        <!-- Category Header -->
        <button
          @click="toggleCategory(category.id)"
          class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-900/30 transition-colors"
          :aria-expanded="expandedCategories.has(category.id)"
          :aria-controls="`category-content-${category.id}`"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h4 class="text-base font-semibold text-gray-200">{{ category.title }}</h4>
            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {{ category.questions?.length || 0 }}
            </span>
          </div>
          <svg
            class="w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
            :class="{ 'rotate-180': expandedCategories.has(category.id) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Category Content (Expandable) -->
        <div
          v-if="expandedCategories.has(category.id)"
          :id="`category-content-${category.id}`"
          class="px-6 pb-4 space-y-4"
        >
          <div
            v-for="question in sortedQuestions(category.questions)"
            :key="question.id"
            class="border-l-2 border-blue-900/50 pl-4 py-2"
          >
            <h5 class="text-sm font-medium text-blue-300 mb-2">
              {{ question.question }}
            </h5>
            <div class="text-sm text-gray-300 prose prose-invert prose-sm max-w-none">
              <div v-html="renderMarkdown(question.answer)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="p-8 bg-gray-950/30 rounded-xl border border-gray-800 text-center"
    >
      <svg class="h-12 w-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-500 text-sm">FAQ暂时不可用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSpeckitFaq } from '~/composables/useSpeckitFaq'
import type { SpeckitFaqCategory, SpeckitFaqEntry } from '~/types/article'

// Composables
const {
  categories,
  isLoading,
  error,
  expandedCategories,
  toggleCategory
} = useSpeckitFaq()

/**
 * Sort categories by order field
 */
const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => {
    const orderA = a.order || 999
    const orderB = b.order || 999
    return orderA - orderB
  })
})

/**
 * Sort questions by order field
 */
function sortedQuestions(questions?: SpeckitFaqEntry[]): SpeckitFaqEntry[] {
  if (!questions) return []
  return [...questions].sort((a, b) => {
    const orderA = a.order || 999
    const orderB = b.order || 999
    return orderA - orderB
  })
}

/**
 * Simple markdown rendering (basic formatting)
 * For production, consider using a proper markdown library
 */
const renderMarkdown = (text: string): string => {
  if (!text) return ''

  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`(.*?)`/g, '<code class="bg-gray-800 text-pink-300 px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
/* Smooth transitions for expandable content */
button[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .speckit-faq-section {
    padding: 0;
  }

  button {
    padding: 1rem;
  }

  h4 {
    font-size: 0.95rem;
  }
}
</style>
