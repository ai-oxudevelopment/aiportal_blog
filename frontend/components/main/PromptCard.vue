<template>
  <div class="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-full">
    <div>
      <div class="text-white/50 text-sm font-mono">{{ prompt.description }}</div>
      <h3 class="text-white font-medium text-sm mt-2">{{ prompt.title }}</h3>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-gray-400 text-xs">{{ prompt.category.name }}</span>
      <button class="text-gray-400 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  prompt: Object,
});

</script>
