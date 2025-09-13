<template>
  <div class="relative group bg-zinc-900/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-full">
    <div>
      <p class="text-white/70 text-sm mb-2">{{ prompt.description }}</p>
      <h3 class="text-white font-medium">{{ prompt.title }}</h3>
    </div>

    <div class="mt-4">
      <div v-if="prompt.tags && prompt.tags.length" class="flex flex-wrap">
        <Pill v-for="tag in prompt.tags" :key="tag.id">{{ tag.name }}</Pill>
      </div>

      <div class="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="bg-gray-700/50 p-2 rounded-full hover:bg-gray-600">
          <Upload class="h-4 w-4 text-white" />
        </button>
        <button class="bg-gray-700/50 p-2 rounded-full hover:bg-gray-600">
          <Copy class="h-4 w-4 text-white" />
        </button>
        <button class="bg-gray-700/50 p-2 rounded-full hover:bg-gray-600">
          <Download class="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Upload, Copy, Download } from 'lucide-vue-next';
import Pill from '~/components/main/Pill.vue';

defineProps({
  prompt: Object,
});
</script>
