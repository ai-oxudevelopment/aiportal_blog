<template>
  <div class="relative w-full p-0 ring-1 ring-neutral-800 rounded-sm">

    <!-- File Header -->
    <div class="bg-neutral-800 sticky top-0 z-10 flex w-full items-center justify-between px-3 py-1.5 text-sm text-neutral-300 rounded-t-sm">
      <div class="flex min-w-0 grow items-center gap-2">
        <button @click="toggleFile(file.id)">
          <ChevronRight :class="`h-3 w-3 transition-transform ${expandedFiles[file.id] ? 'rotate-90' : ''}`" />
        </button>
        <div class="size-4 flex-shrink-0" style="fill: '#a074c4'">
          <svg viewBox="0 0 32 32">
            <path fill-rule="evenodd" d="M17.1 19.3c-.5 0-.8.1-1.1.1h-1.8c.4-4.3.7-8.5 1.1-12.8 1.2 0 2.2-.1 3.2 0 .3 0 .7.5.6.8-.3 2.3-.8 4.7-1.2 7-.2 1.6-.5 3.2-.8 4.9zm.4 4c.1 1.1-.8 2.1-2.1 2.2-1.3.1-2.5-.7-2.6-1.8-.1-1.2.8-2.1 2.2-2.2 1.4-.1 2.4.6 2.5 1.8z" clip-rule="evenodd" />
          </svg>
        </div>
        <a href="#" class="cursor-pointer truncate text-neutral-500 hover:underline">{{ repository }}</a>
        <a href="#" class="cursor-pointer truncate text-white hover:underline">{{ file.path }}</a>
        <button @click="copyToClipboard(file.content)">
          <Copy class="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    </div>

    <!-- File Content -->
    <div v-if="expandedFiles[file.id]" class="overflow-auto scroll-smooth">
      <div class="relative w-full min-w-max overflow-hidden bg-neutral-800/80">
        <div
          class="code-wrapper"
          v-html="highlightedHtml"
          :style="{ '--line-start': String((file.lineStart || 1) - 1) }"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ChevronRight, Copy } from 'lucide-vue-next';
import { codeToHtml } from 'shiki';

const props = defineProps<{
  file: {
    id: string;
    path: string;
    content: string;
    lineStart: number;
  };
  expandedFiles: Record<string, boolean>;
  repository: string;
}>();
const emit = defineEmits<{ (e: 'onToggle', id: string): void }>();

function toggleFile(id: string): void {
  emit('onToggle', id);
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch {
    // no-op
  }
}

// --- Shiki highlighting ---
const highlightedHtml = ref<string>('');

const detectLang = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': return 'ts';
    case 'tsx': return 'tsx';
    case 'js': return 'js';
    case 'vue': return 'vue';
    case 'json': return 'json';
    case 'md':
    case 'mdx': return 'md';
    case 'sh':
    case 'bash': return 'bash';
    case 'css': return 'css';
    case 'html':
    case 'htm': return 'html';
    default: return 'txt';
  }
};

async function renderHighlight(): Promise<void> {
  const lang = detectLang(props.file.path);
  highlightedHtml.value = await codeToHtml(props.file.content, {
    lang,
    theme: 'github-dark',
  });
}

watch(
  () => props.expandedFiles[props.file.id],
  async (isOpen) => {
    if (isOpen && !highlightedHtml.value) {
      await renderHighlight();
    }
  },
  { immediate: false }
);

onMounted(async () => {
  if (props.expandedFiles[props.file.id]) {
    await renderHighlight();
  }
});

</script>

<style scoped>
.code-wrapper{font-family:'Fira Mono','Menlo','Consolas',monospace}
::deep(pre.shiki){background:transparent!important;margin:0;padding:16px;overflow-x:auto;font-size:12px;line-height:1.6;color:#d1d5db}
::deep(pre.shiki code){counter-reset:shiki-line var(--line-start,0);display:block;padding-left:calc(2.5em + 1.2em);padding-right:16px}
::deep(pre.shiki code .line){display:block;white-space:pre;line-height:1.4;padding-right:12px}
::deep(pre.shiki code .line::before){counter-increment:shiki-line;content:counter(shiki-line);display:inline-block;width:2.5em;margin-left:-2.5em;margin-right:1.2em;text-align:right;color:#6b7280;font-size:12px;user-select:none;opacity:.8}
::deep(pre.shiki::-webkit-scrollbar){height:8px}
::deep(pre.shiki::-webkit-scrollbar-thumb){background:#232527;border-radius:8px}
::deep(pre.shiki::-webkit-scrollbar-track){background:transparent}

</style>