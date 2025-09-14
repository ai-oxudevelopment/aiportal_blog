<template>
  <div class="bg-zinc-900/90 border border-zinc-800/50 rounded-lg overflow-hidden h-full flex flex-col">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Maybe<T> = T | null | undefined;

interface CategoryAttributes { name?: string }

interface SingleRelation<T> { data?: Maybe<{ attributes?: Maybe<T> }>; }
interface ManyRelation<T> { data?: Maybe<Array<Maybe<{ attributes?: Maybe<T> }>>>; }

interface PromptLike {
  title?: string;
  description?: string;
  content?: string;
  category?: Maybe<{ name?: string }> | Maybe<SingleRelation<CategoryAttributes>>;
  categories?: Maybe<ManyRelation<CategoryAttributes>>;
  attributes?: {
    title?: string;
    description?: string;
    content?: string;
    category?: Maybe<SingleRelation<CategoryAttributes>>;
    categories?: Maybe<ManyRelation<CategoryAttributes>>;
  };
}

const props = defineProps<{ prompt: PromptLike }>();

const titleText = computed(() =>
  props.prompt?.title ?? props.prompt?.attributes?.title ?? ''
);

const contentText = computed(() =>
  props.prompt?.content ?? props.prompt?.description ?? props.prompt?.attributes?.content ?? props.prompt?.attributes?.description ?? ''
);

const categoryName = computed(() => {
  const direct = (props.prompt as any)?.category?.name as Maybe<string>;
  if (direct) return direct;

  const singleRel = props.prompt?.category as Maybe<SingleRelation<CategoryAttributes>>;
  const fromSingle = singleRel?.data?.attributes?.name;
  if (fromSingle) return fromSingle;

  const manyRel = props.prompt?.categories as Maybe<ManyRelation<CategoryAttributes>>;
  const firstName = manyRel?.data?.[0]?.attributes?.name;
  if (firstName) return firstName;

  const singleInAttrs = props.prompt?.attributes?.category as Maybe<SingleRelation<CategoryAttributes>>;
  const fromAttrsSingle = singleInAttrs?.data?.attributes?.name;
  if (fromAttrsSingle) return fromAttrsSingle;

  const manyInAttrs = props.prompt?.attributes?.categories as Maybe<ManyRelation<CategoryAttributes>>;
  const firstAttrsName = manyInAttrs?.data?.[0]?.attributes?.name;
  if (firstAttrsName) return firstAttrsName;

  return '';
});
</script>

<style scoped>
/* No additional styles; using utility classes */
</style>
