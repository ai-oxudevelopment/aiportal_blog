<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-gray-900/50 border border-gray-800 rounded-lg p-6 animate-pulse"
      >
        <div class="h-4 bg-gray-700 rounded mb-4"></div>
        <div class="h-3 bg-gray-700 rounded mb-2"></div>
        <div class="h-3 bg-gray-700 rounded mb-4"></div>
        <div class="h-8 bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="prompts.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.935-6.072-2.456M15 21H3v-1a6 6 0 0112 0v1z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-300 mb-2">No prompts found</h3>
      <p class="text-gray-400">Try adjusting your search or filter criteria.</p>
    </div>

    <!-- Prompt Cards - Lazy loaded for better TBT -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EnhancedPromptCard
        v-for="prompt in prompts"
        :key="prompt.id"
        :prompt="prompt"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PromptPreview, SpeckitPreview } from '~/types/article'

// CRITICAL: Import EnhancedPromptCard synchronously for immediate interactivity
import EnhancedPromptCard from './EnhancedPromptCard.vue'

defineProps<{
  prompts: (PromptPreview | SpeckitPreview)[]
  loading: boolean
}>()
</script>
