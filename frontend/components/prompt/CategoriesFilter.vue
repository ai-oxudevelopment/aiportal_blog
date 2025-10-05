<template>
  <div class="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
    <h2 class="text-xl font-semibold text-white mb-6">Categories</h2>
    <div class="space-y-2">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="toggleCategory(category.id)"
        :class="[
          'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm',
          selectedCategories.includes(category.id)
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
        ]"
      >
        {{ category.name }}
      </button>
    </div>
    
    <!-- Clear All Button -->
    <button
      v-if="selectedCategories.length > 0"
      @click="clearAll"
      class="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
    >
      Сбросить
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types/article'

const props = defineProps<{
  categories: Category[]
  selectedCategories: number[]
}>()

const emit = defineEmits<{
  'update:selected-categories': [categories: number[]]
}>()

const toggleCategory = (categoryId: number) => {
  const newSelected = props.selectedCategories.includes(categoryId)
    ? props.selectedCategories.filter(id => id !== categoryId)
    : [...props.selectedCategories, categoryId]
  
  emit('update:selected-categories', newSelected)
}

const clearAll = () => {
  emit('update:selected-categories', [])
}
</script>