<template>
  <section class="mb-12">
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="bg-zinc-900/50 border border-white/10 rounded-lg p-4 animate-pulse">
        <div class="h-4 bg-gray-700 rounded mb-2"></div>
        <div class="h-3 bg-gray-700 rounded mb-3"></div>
        <div class="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    
    <div v-else-if="articles && articles.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> 
      
      <PromptCard 
        v-for="article in articles" 
        :key="article.slug" 
        :prompt=article
      />

    </div>
    <div v-else class="text-center py-8">
      <div class="max-w-sm mx-auto">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-500/10 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h4 class="text-md font-medium text-white mb-2">Нет промптов</h4>
        <p class="text-gray-400 text-sm">
          В этой категории пока нет промптов.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';

const { articles, loading, error, fetchArticles } = useFetchArticles();

import PromptCard from '~/components/main/PromptCard.vue';

onMounted(() => {
  fetchArticles();
});

defineProps({
  articles: Array,
  loading: Boolean,
});


</script>
