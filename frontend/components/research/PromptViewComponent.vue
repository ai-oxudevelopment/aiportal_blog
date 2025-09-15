<template>
  <div class="flex flex-col gap-2 scroll-smooth rounded-md">
    <div class="relative w-full p-0 ring-1 ring-neutral-800 rounded-sm">
      <!-- Header -->
      <div class="bg-neutral-800 sticky top-0 z-10 flex w-full items-center justify-between px-3 py-1.5 text-sm text-neutral-300 rounded-t-sm">
        <div class="flex min-w-0 grow items-center gap-2">
          <button @click="emitToggle">
            <ChevronRight :class="`h-3 w-3 transition-transform ${props.isExpanded ? 'rotate-90' : ''}`" />
          </button>
          <div class="size-4 flex-shrink-0" style="fill: '#a074c4'">
            <svg viewBox="0 0 32 32">
              <path fill-rule="evenodd" d="M17.1 19.3c-.5 0-.8.1-1.1.1h-1.8c.4-4.3.7-8.5 1.1-12.8 1.2 0 2.2-.1 3.2 0 .3 0 .7.5.6.8-.3 2.3-.8 4.7-1.2 7-.2 1.6-.5 3.2-.8 4.9zm.4 4c.1 1.1-.8 2.1-2.1 2.2-1.3.1-2.5-.7-2.6-1.8-.1-1.2.8-2.1 2.2-2.2 1.4-.1 2.4.6 2.5 1.8z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="cursor-pointer truncate text-neutral-500">prompt</span>
          <button>
            <Copy class="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div v-if="props.isExpanded && props.content" class="overflow-auto scroll-smooth">
        <div class="relative w-full min-w-max overflow-hidden bg-neutral-800/80">
          <div class="p-4 prose-custom prose-custom-md prose-custom-gray !max-w-none text-neutral-300 [overflow-wrap:anywhere]">
            <div class="overflow-auto max-h-[70vh] rounded-xl text-white text-sm shadow-lg">
              {{ props.content }}
            </div>
            <!-- <NuxtMarkdown :source="props.content" /> -->
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Copy } from 'lucide-vue-next';
const props = defineProps<{
  content?: string | null,
  isExpanded?: boolean,
}>();

const emit = defineEmits<{ (e: 'onToggle'): void }>();

function emitToggle(): void {
  emit('onToggle');
}

console.log('Prompt View:', props.content);

</script>