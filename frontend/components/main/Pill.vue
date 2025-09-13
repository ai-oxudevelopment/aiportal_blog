<template>
  <span class="inline-block bg-gray-700 text-gray-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
});
</script>
