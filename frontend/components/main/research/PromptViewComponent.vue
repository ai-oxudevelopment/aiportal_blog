<template>
  <div class="flex flex-col gap-2 scroll-smooth rounded-md">
    <div class="relative w-full p-0 ring-1 ring-neutral-800 rounded-sm">
      <!-- Header -->
      <div class="bg-neutral-800 sticky top-0 z-10 flex w-full items-center justify-between px-3 py-1.5 text-sm text-neutral-300 rounded-t-sm">
        <div class="flex min-w-0 grow items-center gap-2">
          <button v-if="onToggle" @click="onToggle">
            <ChevronRight :class="`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`" />
          </button>
          <div class="size-4 flex-shrink-0" style="fill: '#3b82f6'">
            <svg viewBox="0 0 32 32">
              <path d="M16 2L3 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L16 2z"/>
            </svg>
          </div>
          <span class="cursor-pointer truncate text-white">Prompt</span>
          <button>
            <Copy class="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div v-if="isExpanded" class="overflow-auto scroll-smooth">
        <div class="relative w-full min-w-max overflow-hidden bg-neutral-800/80">
          <div class="p-4 prose-custom prose-custom-md prose-custom-gray !max-w-none text-neutral-300 [overflow-wrap:anywhere]">
            <div v-html="content" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { ChevronRight, Copy } from 'lucide-vue-next';

interface Props {
  content: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const props = defineProps<Props>();

</script>