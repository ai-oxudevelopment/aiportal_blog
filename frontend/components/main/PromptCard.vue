<template>
  <div class="bg-zinc-900/90 border border-zinc-800/50 rounded-lg overflow-hidden h-full flex flex-col cursor-pointer" @click="goToPrompt">
    <!-- Main Content Area -->
    <div class="p-3 flex-grow flex flex-col overflow-hidden">
      <!-- Description Text - Monospace like cursor.directory -->
      <div class="group relative bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2 mb-3 flex-grow overflow-hidden">
        <code class="block text-gray-300 text-[12px] font-mono">
          <p class="line-clamp-3">
            {{ prompt.description }}
          </p>
        </code>

        <!-- Hover overlay: Try in chat -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/0 to-zinc-900/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
        <button
          @click.stop="handleTryPrompt"
          class="pointer-events-auto absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-800/80 text-gray-200 border border-zinc-700/70 shadow-sm backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-zinc-700/80 hover:text-blue-300"
          title="Попробовать в чате"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-[10px] font-medium hidden sm:inline">Попробовать</span>
        </button>
      </div>

      <!-- Title and Technologies -->
      <div class="mt-1 mb-3">
        <p class="text-white font-semibold text-xs mt-1 line-clamp-2 leading-snug truncate">
          {{ prompt.title }}
        </p>

        <!-- Category Name -->
        <div class="relative">
          <div class="flex items-center gap-2 text-[10px] text-gray-400">
            <span class="text-gray-300 font-medium">
              {{ categoryName }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import type { PromptPreview, Category } from '~/types/article';

const props = defineProps<{ prompt: PromptPreview }>();
const router = useRouter();

const categoryName = computed(() => {
  const categories = props.prompt.categories || [];
  if (categories.length > 0) {
    return categories.map((cat: Category) => cat.name).join(', ');
  }
  return 'Без категории';
});

const handleTryPrompt = (): void => {
  emit('try', props.prompt);
};

const goToPrompt = (): void => {
  const s = props.prompt.slug;
  if (!s) return;
  router.push({ path: `/prompts/${encodeURIComponent(s)}` });
};

</script>

<style scoped>
/* No additional styles; using utility classes */
</style>
