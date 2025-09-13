<template>
  <div class="flex flex-wrap gap-2 text-sm">
    <div v-if="loading" class="flex flex-wrap gap-2 text-sm">
      <div class="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
      <div class="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
      <div class="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
    </div>
    <template v-else>
      <button
        v-for="category in categoriesToShow"
        :key="category.slug"
        @click="$emit('categoryChange', category.slug)"
        :class="`px-3 h-8 rounded-full border transition-colors hover:text-white hover:border-white/30 ${
          selectedCategory === category.slug 
            ? 'border-white/30 text-white' 
            : 'border-white/10 text-gray-300'
        }`"
      >
        {{ category.name }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  section: Object,
  loading: Boolean,
  selectedCategory: String,
});

defineEmits(['categoryChange']);

const allCategories = computed(() => {
  const sectionCategories = props.section?.attributes.categories?.data || [];
  return [
    { name: "All", slug: "all" },
    ...sectionCategories.map(cat => ({
      name: cat.attributes.name,
      slug: cat.attributes.slug
    }))
  ];
});

const categoriesToShow = computed(() => {
  return allCategories.value.length > 1 ? allCategories.value : [{ name: "All", slug: "all" }];
});
</script>
