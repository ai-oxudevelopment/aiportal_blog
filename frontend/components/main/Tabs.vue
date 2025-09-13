<template>
  <div class="flex flex-wrap gap-2 text-sm">
    <button
      v-for="(c, i) in cats"
      :key="c"
      :class="`px-3 h-8 rounded-full border transition-colors text-gray-300 hover:text-white hover:border-white/30 ${
        i === 0 ? 'border-white/30 text-white' : 'border-white/10'
      }`"
    >
      {{ c }}
    </button>
  </div>
</template>

<script setup>
const cats = [
  "All",
  "Company",
  "Research",
  "Product",
  "Safety",
  "Security",
  "Global Affairs"
];
</script>
