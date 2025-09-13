<template>
  <div
    class="inline-flex flex-col rounded-2xl bg-white text-black/90 px-4 py-3 shadow-lg"
  >
    <span class="text-base font-semibold leading-none">
      {{ title }}
    </span>
    <span
      v-if="subtitle"
      class="text-[13px] text-black/60 leading-tight mt-1"
    >
      {{ subtitle }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
});
</script>
