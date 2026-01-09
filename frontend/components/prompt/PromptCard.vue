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

// Nuxt composables (auto-imported in Nuxt 3, but needed for TypeScript)
declare function navigateTo(path: string): Promise<void>

const props = defineProps<{ prompt: PromptPreview }>();
const emit = defineEmits<{
  try: [prompt: PromptPreview]
}>();
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
  navigateTo(`/prompts/${encodeURIComponent(s)}`);
};

</script>

<style scoped>
/* No additional styles; using utility classes */
</style>
