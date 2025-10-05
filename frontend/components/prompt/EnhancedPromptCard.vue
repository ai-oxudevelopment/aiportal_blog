<template>
  <div class="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 hover:bg-gray-900/90 transition-all duration-200 group h-full flex flex-col shadow-lg">
    <!-- Category Tag -->
    <div class="flex items-center justify-between p-4 pb-2 flex-shrink-0">
      <span class="inline-block px-3 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full">{{ categoryName }}</span>
      <button 
        @click="toggleBookmark" 
        class="ml-3 p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800" 
        :title="isBookmarked ? 'Удалить из закладок' : 'Добавить в закладки'">
        <svg class="h-5 w-5" :fill="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    </div>

    <!-- Content - Flex grow to fill available space -->
    <div @click="goToPrompt" class="cursor-pointer px-4 pb-4 flex-grow flex flex-col">
      <!-- Title -->
      <h3 class="text-lg font-semibold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
        {{ prompt.title }}
      </h3>

      <!-- Description - Flex grow to fill remaining space -->
      <p class="text-gray-400 text-sm mb-4 line-clamp-4 flex-grow">
        {{ prompt.description }}
      </p>

      <!-- Actions - Always at bottom -->
      <div class="flex items-center justify-start mt-auto pt-2">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { PromptPreview, Category } from '~/types/article'

const props = defineProps<{
  prompt: PromptPreview
}>()

const router = useRouter()
const isBookmarked = ref(false)

const categoryName = computed(() => {
  const categories = props.prompt.categories || []
  return categories.length > 0 ? categories[0].name : 'Без категории'
})

const goToPrompt = async () => {
  if (props.prompt.slug) {
    await router.push(`/prompts/${encodeURIComponent(props.prompt.slug)}`)
  }
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  // TODO: Implement bookmark functionality
}
</script>