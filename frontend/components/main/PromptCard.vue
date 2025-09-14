<template>
  <div class="bg-zinc-900/90 border border-zinc-800/50 rounded-lg overflow-hidden h-full flex flex-col relative">
    <!-- Main Content Area -->
    <div class="p-3 flex-grow flex flex-col overflow-hidden">
      <!-- Description Text - Monospace like cursor.directory -->
      <div class="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2 mb-3 flex-grow">
        <code class="block text-gray-300 text-[12px] font-mono">
          <p class="line-clamp-3">
            {{ contentText }}
          </p>
        </code>
      </div>

      <!-- Title and Technologies -->
      <div class="mt-1 mb-3">
        <p class="text-white font-semibold text-xs mt-1 line-clamp-2 leading-snug truncate">
          {{ titleText }}
        </p>

        <!-- Category Name -->
        <div class="relative">
          <div class="flex items-center gap-2 text-[10px] text-gray-400">
            <span v-if="categoryName" class="text-gray-300 font-medium">
              {{ categoryName }}
            </span>
            <span v-else class="text-gray-500 text-xs">No category</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Blue Try Button - Bottom Right Corner -->
    <div class="absolute bottom-3 right-3">
      <button
        @click.stop="handleTryPrompt"
        class="w-7 h-7 rounded-md bg-zinc-700/50 hover:bg-zinc-600/70 text-gray-300 hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
        title="Try AI Chat"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Maybe<T> = T | null | undefined;

interface CategoryAttributes { name?: string }

// Simplified relation shape to cover both single and many relations
interface Relation<T> { data?: { attributes?: Maybe<T> } | Array<{ attributes?: Maybe<T> }>; }

interface PromptLike {
  title?: string;
  description?: string;
  content?: string;
  category?: { name?: string } | Relation<CategoryAttributes>;
  categories?: Relation<CategoryAttributes>;
  attributes?: {
    title?: string;
    description?: string;
    content?: string;
    category?: Relation<CategoryAttributes>;
    categories?: Relation<CategoryAttributes>;
  };
}

const props = defineProps<{ prompt: PromptLike }>();

const emit = defineEmits<{
  (e: 'try', prompt: PromptLike): void;
}>();

function firstNonEmpty(...values: Array<Maybe<string>>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return '';
}

function getCategoryName(prompt: PromptLike): string {
  const category = prompt.category as Maybe<{ name?: string } | Relation<CategoryAttributes>>;
  const categories = prompt.categories as Maybe<Relation<CategoryAttributes>>;
  const attrs = prompt.attributes;

  const nameFromCategory = (category && !Array.isArray((category as Relation<CategoryAttributes>).data))
    ? (category as Relation<CategoryAttributes>)?.data?.attributes?.name
    : (category as { name?: string })?.name;

  const nameFromCategories = Array.isArray(categories?.data)
    ? categories?.data?.[0]?.attributes?.name
    : undefined;

  const nameFromAttrCategory = !Array.isArray(attrs?.category?.data)
    ? attrs?.category?.data?.attributes?.name
    : undefined;

  const nameFromAttrCategories = Array.isArray(attrs?.categories?.data)
    ? attrs?.categories?.data?.[0]?.attributes?.name
    : undefined;

  return firstNonEmpty(nameFromCategory, nameFromCategories, nameFromAttrCategory, nameFromAttrCategories);
}

const titleText = computed(() => firstNonEmpty(
  props.prompt?.title,
  props.prompt?.attributes?.title,
));

const contentText = computed(() => firstNonEmpty(
  props.prompt?.content,
  props.prompt?.description,
  props.prompt?.attributes?.content,
  props.prompt?.attributes?.description,
));

const categoryName = computed(() => getCategoryName(props.prompt));

function handleTryPrompt() {
  emit('try', props.prompt);
}
</script>

<style scoped>
/* No additional styles; using utility classes */
</style>
