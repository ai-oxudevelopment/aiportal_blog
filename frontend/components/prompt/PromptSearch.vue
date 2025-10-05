<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      :placeholder="placeholder"
      class="w-full pl-14 pr-12 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-gray-900 transition-all duration-200 shadow-lg"
    >
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-white transition-colors z-10"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>