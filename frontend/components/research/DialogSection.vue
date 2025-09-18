<template>
  <div class="flex flex-col gap-3 pt-8 lg:flex-row" data-query-display="true">
    <!-- Main Content Section -->
    <div class="flex max-h-fit min-w-0 flex-1 flex-shrink-0 flex-col xl:[flex-grow:4]">
      <!-- Header -->
      <div class="mb-4">
        <div class="flex flex-col">
            <NuxtLink
              :to="return_to"
              class="flex items-center gap-2 text-base text-neutral-400 transition-colors hover:text-white mb-3"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
            return to {{ repository }}

          </NuxtLink>

          <div class="min-w-0 flex-1">
            <div class="flex flex-col items-start gap-2 text-white">
              <span class="text-xl xl:text-2xl w-full [overflow-wrap:break-word] group">
                {{ query }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Metadata -->
        <div class="py-3">
          <div class="text-neutral-400 flex flex-col items-start justify-between text-sm">
            <div class="mb-1">
              <div class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-[#ef9541]/20 text-[#ef9541]">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" class="mr-1">
                  <path d="M212,76V72a44,44,0,0,0-74.86-31.31,3.93,3.93,0,0,0-1.14,2.8v88.72a4,4,0,0,0,6.2,3.33A47.67,47.67,0,0,1,167.68,128a8.18,8.18,0,0,1,8.31,7.58,8,8,0,0,1-8,8.42,32,32,0,0,0-32,32v33.88a4,4,0,0,0,1.49,3.12,47.92,47.92,0,0,0,74.21-17.16,4,4,0,0,0-4.49-5.56A68.06,68.06,0,0,1,192,192h-7.73a8.18,8.18,0,0,1-8.25-7.47,8,8,0,0,1,8-8.53h8a51.6,51.6,0,0,0,24-5.88v0A52,52,0,0,0,212,76Z"/>
                </svg>
                Deep
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Response Content -->
      <div class="h-fit rounded-lg">
        <div class="relative flex flex-col gap-1 rounded-md border-[0.5px] border-[#2F2F2F] bg-[#141414] p-4 text-white [overflow-wrap:anywhere]">
          <!-- Thought Process -->
          <div v-if="thoughtProcess" class="mb-4">
            <div class="flex flex-col gap-2">
              <button type="button" aria-controls="radix-r1" aria-expanded="true" data-state="open" @click="setIsThoughtProcessOpen(!isThoughtProcessOpen)" class="flex w-fit items-center gap-1.5 text-sm text-neutral-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" :class="`size-4 transition-transform ${isThoughtProcessOpen ? 'rotate-90' : ''}`">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
                <span>Размышления</span>
              </button>
              <div v-if="isThoughtProcessOpen" data-state="open" id="radix-r1" class="relative flex flex-col gap-1 text-neutral-400">
                <div class="absolute left-[7px] top-0 h-full w-[2px] rounded-md bg-neutral-700"></div>
                <div class="pl-5 text-sm italic" v-for="line in thoughtProcess.split('\n')" :key="line">
                  {{ line }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="content" class="markdown-content">
            <div class="prose prose-invert max-w-none markdown-body">
              <NuxtMarkdown :source="content" class="markdown-content" />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex justify-end gap-2">
            <button @click="handleCopyResponse" class="border-border hover:border-border-hover bg-surface hover:border-border-hover hover:bg-component flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-white transition-all" aria-label="Copy Response">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15V5a2 2 0 0 1 2-2h8"></path>
              </svg>
              <span>Копировать ответ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- File Sidebar -->
    <div class="min-w-0 flex-1 xl:[flex-grow:3]">
      <div class="sticky left-0 top-20 overflow-y-auto rounded-md" :style="{ maxHeight: 'calc(-135px + 100vh)' }">
        <div class="flex flex-col gap-3 p-0 pb-[90px]">
          <!-- Prompt Section -->
          <PromptViewComponent :content="promptContent" :isExpanded="isPromptExpanded" @onToggle="setIsPromptExpanded(!isPromptExpanded)" />

          <!-- Uploaded Files Section -->
          <div v-if="uploadedFiles && uploadedFiles.length > 0">
            <FileUploadedComponent :files="uploadedFiles" :isExpanded="isFilesExpanded" @onToggle="setIsFilesExpanded(!isFilesExpanded)" />
          </div>

          <!-- Additional Text Section -->
          <div v-if="additionalText">
            <TextViewComponent :content="additionalText" title="Additional Context" variant="muted" :isExpanded="isAdditionalTextExpanded" @onToggle="setIsAdditionalTextExpanded(!isAdditionalTextExpanded)" />
          </div>

          <!-- Code Files -->
          <div v-for="file in (files || [])" :key="file.id" class="flex flex-col gap-2 scroll-smooth rounded-md">
            <CodeFileComponent 
              :file="file"
              :repository="repository" 
              :expandedFiles="expandedFiles"
              @onToggle="toggleFile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PromptViewComponent from './PromptViewComponent.vue';
import CodeFileComponent from './CodeFilePreview.vue'; 
// import FileUploadedComponent from './FileUploadedComponent.vue';
// import TextViewComponent from './TextViewComponent.vue';
import { ChevronRight, Copy } from 'lucide-vue-next';
import { codeToHtml } from 'shiki';


type CodeFile = {
  id: string;
  path: string;
  content: string;
  lineStart: number;
};

const props = defineProps<{
  query: string;
  repository: string;
  content?: string | null;
  thoughtProcess: string;
  prompt?: string | null;
  uploadedFiles?: Array<unknown> | null;
  return_to?: string | '/';
  additionalText?: string | null;
  files?: Array<CodeFile> | null;
}>();

const promptContent = ref(props.prompt);
const isThoughtProcessOpen = ref(false);
const isPromptExpanded = ref(false);
const isFilesExpanded = ref(false);
const isAdditionalTextExpanded = ref(false);
const expandedFiles = ref<Record<string, boolean>>({});

const highlightedContent = ref<string>('');

async function renderHighlight() {
  if (props.content) {
    highlightedContent.value = await codeToHtml(props.content, {
      lang: 'md',
      theme: 'github-dark',
    });
  }
}

onMounted(async () => {
  await renderHighlight();
});

function setIsThoughtProcessOpen(value: boolean) {
  isThoughtProcessOpen.value = value;
}

function setIsPromptExpanded(value: boolean) {
  isPromptExpanded.value = value;
}

function setIsFilesExpanded(value: boolean) {
  isFilesExpanded.value = value;
}

function setIsAdditionalTextExpanded(value: boolean) {
  isAdditionalTextExpanded.value = value;
}

function toggleFile(fileId: string) {
  expandedFiles.value[fileId] = !expandedFiles.value[fileId];
}

function handleCopyResponse() {
  // Implement copy response logic
}

function handleCopyThread() {
  // Implement copy thread logic
}

function handleShare() {
  // Implement share logic
}
</script>

<style> 

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  background: transparent;
  color: #e5e5e5;
}

.markdown-body pre {
  background-color: #1e1e1e;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 16px;
  overflow: auto;
}

.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 14px;
  background-color: rgba(110, 118, 129, 0.4);
  padding: 0.2em 0.4em;
  border-radius: 6px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: #e5e5e5;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
</style>