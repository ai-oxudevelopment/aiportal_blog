<template>
  <section class="mb-16">
    <div
      class="flex items-center justify-between mb-6"
    >
      <h2
        class="text-2xl font-semibold tracking-tight text-white"
      >
        {{ title }}
      </h2>
      <button
        class="text-sm text-gray-300 hover:text-white transition"
      >
        View all
      </button>
    </div>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
    >
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </section>
</template>

<script setup>
import PostCard from './PostCard.vue';

defineProps({
  title: String,
  posts: Array,
});
</script>
