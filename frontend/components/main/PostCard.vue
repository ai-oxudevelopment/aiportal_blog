<template>
  <a :href="href" class="block">
    <Thumb :tone="post.tone" />
    <div class="mt-3">
      <h4 class="text-sm font-medium text-white/95">
        {{ post.title }}
      </h4>
      <div class="mt-1 text-xs text-gray-400">
        <span class="uppercase tracking-wide">
          {{ post.tag }}
        </span>
        <span class="mx-2">
          •
        </span>
        <time>{{ post.date }}</time>
      </div>
    </div>
  </a>
</template>

<script setup>
import Thumb from './Thumb.vue';
import { computed } from 'vue';

const props = defineProps({
  post: Object,
});

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const slug = computed(() => createSlug(props.post.title));
const href = computed(() => `/${props.post.category}/${slug.value}`);
</script>
