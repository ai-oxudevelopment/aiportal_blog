<template>
  <div class="overflow-x-auto">
    <div class="flex space-x-3 pb-2">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="toggleCategory(category.id)"
        :class="[
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedCategories.includes(category.id)
            ? 'bg-gray-700 text-white'
            : 'text-gray-300 hover:bg-gray-800/50'
        ]"
      >
        {{ category.name }}
      </button>
    </div>
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
</script>