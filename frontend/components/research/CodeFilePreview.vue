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
        <button>
          <Copy class="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    </div>

    <!-- File Content -->
    <div v-if="expandedFiles[file.id]" class="scrollbar-hide grid overflow-auto scroll-smooth">
      <div class="relative w-full min-w-max overflow-hidden bg-neutral-800/80">
        <div class="code-container">
          <div class="code-header"></div>
          <div class="code-block" v-html="highlightedHtml" :style="{ '--line-start': String(file.lineStart || 1) }"></div>
        </div>
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
.code-container {
  background: #1e1e1e;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
}
.code-header {
  height: 6px;
  background: #151515;
  border-bottom: 1px solid #2a2a2a;
}
.code-block {
  margin: 0;
  padding: 8px 0;
  overflow: auto;
  font-size: 12px;
}
/* VS Code-like line numbers */
.shiki { background: #1e1e1e !important; }
.shiki code { counter-reset: shiki-line var(--line-start, 1); display: block; }
.shiki code .line { display: block; }
.shiki code .line::before {
  counter-increment: shiki-line;
  content: counter(shiki-line);
  display: inline-block;
  width: 3ch;
  margin-right: 1ch;
  text-align: right;
  color: #008000; /* green like screenshot */
  font-style: italic;
  user-select: none;
}
</style>