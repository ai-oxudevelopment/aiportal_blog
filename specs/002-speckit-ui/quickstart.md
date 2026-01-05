# Quickstart Guide: Speckit UI Enhancements

**Feature**: 002-speckit-ui
**Phase**: 1 - Implementation Guide
**Date**: 2026-01-04

## Overview

This guide provides step-by-step instructions for implementing the Speckit UI Enhancements feature. The implementation involves creating two new Vue components and modifying the existing speckit detail page.

## Prerequisites

- Branch: `002-speckit-ui` (already created and checked out)
- Dev server running on port 8080
- Existing composables: `useFetchOneSpeckit`, `useFileDownload`
- Existing component: `components/research/AiPlatformSelector.vue`

## Implementation Steps

### Step 1: Create SpeckitDownloadBar Component

**Location**: `frontend/components/speckit/SpeckitDownloadBar.vue`

**Purpose**: Unified download and help button bar fixed at bottom of page.

**Template Structure**:

```vue
<template>
  <div
    v-if="speckit.file"
    class="fixed bottom-5 right-0 left-0 z-40 mx-auto w-[325px] transition-all duration-300 hover:w-[350px] hover:scale-105"
  >
    <div class="relative rounded-[24px] bg-gradient-animated p-2 shadow-lg backdrop-blur-xl">
      <div class="flex items-center justify-between gap-2">
        <!-- Download Button -->
        <button
          @click="handleDownload"
          :disabled="downloadLoading"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-purple-600/20 hover:bg-purple-600/30 disabled:bg-gray-700 disabled:cursor-not-allowed text-purple-400 hover:text-purple-300 transition-all duration-200 hover:scale-105 border border-purple-600/30 hover:border-purple-500/50"
          :title="'Скачать конфигурацию'"
        >
          <svg v-if="!downloadLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs font-medium">Скачать</span>
        </button>

        <!-- Help Button -->
        <button
          @click="handleHelp"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-105 border border-blue-600/30 hover:border-blue-500/50"
          :title="'Инструкция'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs font-medium">?</span>
        </button>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="downloadError"
      class="fixed bottom-4 right-4 bg-red-900/90 text-white px-4 py-3 rounded-lg shadow-lg border border-red-700 flex items-center gap-3 z-50"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ downloadError }}</span>
    </div>
  </div>
</template>
```

**Script Setup**:

```typescript
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileDownload } from '~/composables/useFileDownload'
import type { SpeckitFull } from '~/types/article'

// Props
const props = defineProps<{
  speckit: SpeckitFull
}>()

// Emits
const emit = defineEmits<{
  help: []
}>()

// Composables
const { downloadFileFromUrl } = useFileDownload()

// State
const downloadLoading = ref(false)
const downloadError = ref<string | null>(null)

// Download handler
const handleDownload = async () => {
  if (!props.speckit.file || downloadLoading.value) return

  downloadLoading.value = true
  downloadError.value = null

  try {
    const fileUrl = props.speckit.file.url.startsWith('http')
      ? props.speckit.file.url
      : `${process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'}${props.speckit.file.url}`

    await downloadFileFromUrl(fileUrl, props.speckit.file.name)
  } catch (err: any) {
    downloadError.value = err.message || 'Не удалось скачать файл. Попробуйте еще раз.'
    console.error('[SpeckitDownloadBar] Download error:', err)
  } finally {
    downloadLoading.value = false
  }
}

// Help handler
const handleHelp = () => {
  emit('help')
}

// Auto-clear error after 5 seconds
watch(downloadError, (newError) => {
  if (newError) {
    setTimeout(() => {
      downloadError.value = null
    }, 5000)
  }
})
</script>
```

**Styles**:

```vue
<style scoped>
.bg-gradient-animated {
  background: linear-gradient(45deg,
    rgba(168, 85, 247, 0.1),
    rgba(59, 130, 246, 0.1),
    rgba(168, 85, 247, 0.1)
  );
  background-size: 300% 300%;
  animation: gradient-shift 6s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
```

---

### Step 2: Create SpeckitHelpModal Component

**Location**: `frontend/components/speckit/SpeckitHelpModal.vue`

**Purpose**: Modal dialog with usage instructions.

**Template Structure**:

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleClickOutside"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div
          class="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 class="text-2xl font-bold text-white">{{ instructions.title }}</h2>
            <button
              @click="close"
              class="text-gray-400 hover:text-white transition-colors"
              title="Закрыть"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <div
              v-for="(section, index) in instructions.sections"
              :key="index"
              class="mb-6 last:mb-0"
            >
              <h3 class="text-lg font-semibold text-purple-400 mb-2">{{ section.heading }}</h3>
              <div class="prose prose-invert prose-sm max-w-none text-gray-300">
                <MDC :value="section.content" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

**Script Setup**:

```typescript
<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import type { SpeckitUsageInstructions } from '~/types/article'

// Props
const props = defineProps<{
  modelValue: boolean
  instructions: SpeckitUsageInstructions
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Close handler
const close = () => {
  emit('update:modelValue', false)
}

// Click outside handler
const handleClickOutside = () => {
  close()
}

// Escape key handler
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
```

**Styles**:

```vue
<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
```

---

### Step 3: Update Speckit Types

**Location**: `frontend/types/article.ts`

**Add** these interfaces if not already present:

```typescript
// Speckit usage instructions
export interface SpeckitUsageInstructions {
  title: string
  sections: InstructionSection[]
}

export interface InstructionSection {
  heading: string
  content: string
}
```

---

### Step 4: Modify Speckit Detail Page

**Location**: `frontend/pages/speckits/[speckitSlug].vue`

**Changes**:

1. **Import new components**:

```typescript
import SpeckitDownloadBar from '~/components/speckit/SpeckitDownloadBar.vue'
import SpeckitHelpModal from '~/components/speckit/SpeckitHelpModal.vue'
import AiPlatformSelector from '~/components/research/AiPlatformSelector.vue'
```

2. **Add state for modal**:

```typescript
const showHelpModal = ref(false)
```

3. **Create default instructions** (add after imports):

```typescript
const defaultInstructions: SpeckitUsageInstructions = {
  title: 'Как использовать Speckit',
  sections: [
    {
      heading: 'Что такое Speckit?',
      content: 'Speckit - это готовая конфигурация для вашего проекта, которая помогает структурировать работу с AI-ассистентами.'
    },
    {
      heading: 'Скачивание конфигурации',
      content: 'Нажмите кнопку **Скачать** внизу страницы, чтобы загрузить файл конфигурации.'
    },
    {
      heading: 'Интеграция в проект',
      content: '1. Скачайте конфигурационный файл\n2. Разместите его в корне вашего проекта\n3. Следуйте инструкциям в файле для настройки'
    },
    {
      heading: 'Использование с AI-ассистентами',
      content: 'Нажмите на одну из кнопок внизу страницы (ChatGPT, Claude или Perplexity), чтобы открыть этот Speckit в выбранной AI-системе.'
    }
  ]
}
```

4. **Remove old download section** (lines 76-113 approximately):

```vue
<!-- REMOVE THIS SECTION -->
<div v-if="speckit.file" class="mb-8 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30 rounded-xl border border-purple-700/50 p-6">
  ...
</div>
```

5. **Add new components at bottom** (before closing `</div>` of main content):

```vue
<!-- Speckit Download Bar -->
<SpeckitDownloadBar
  v-if="speckit"
  :speckit="speckit"
  @help="showHelpModal = true"
/>

<!-- Help Modal -->
<SpeckitHelpModal
  v-model="showHelpModal"
  :instructions="defaultInstructions"
/>

<!-- AI Platform Selector (if body content exists) -->
<AiPlatformSelector
  v-if="speckit?.body"
  :prompt-text="speckit.body"
/>
```

6. **Remove Markdown/ZIP download buttons** (lines 50-73 approximately):

These buttons are now redundant with the configuration file download. If you want to keep them, move them to the download bar component.

---

### Step 5: Test the Implementation

1. **Start dev server**:

```bash
cd frontend
yarn dev
```

2. **Navigate to a speckit page** (e.g., `/speckits/spec-1`)

3. **Test download functionality**:
   - Click "Скачать" button
   - Verify file downloads with correct name
   - Check loading state (spinner during download)
   - Verify error handling (disconnect network, try download)

4. **Test help modal**:
   - Click "?" button
   - Verify modal opens with instructions
   - Close via ESC key, click outside, close button
   - Verify body scroll is prevented when modal is open

5. **Test AI platform buttons**:
   - Verify buttons appear when speckit has body content
   - Click each button (ChatGPT, Claude, Perplexity)
   - Verify new tab opens with correct URL and content

6. **Test edge cases**:
   - Speckit without file (download button hidden)
   - Speckit without body (AI buttons hidden)
   - Mobile responsive (< 768px viewport)

---

## Troubleshooting

### Issue: Download button not appearing

**Check**:
- `speckit.file` exists (check Strapi response)
- Component is imported correctly
- `v-if` condition is satisfied

---

### Issue: Modal not opening

**Check**:
- `showHelpModal` ref is defined
- `v-model` binding is correct
- Teleport is working (check console for errors)

---

### Issue: AI platform buttons not working

**Check**:
- `speckit.body` exists and is not empty
- `AiPlatformSelector` component is imported
- Browser allows popups (check popup blocker)

---

### Issue: Styles don't match AiPlatformSelector

**Check**:
- Tailwind CSS classes match exactly
- Gradient animation keyframes are defined
- No conflicting global styles

---

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement tasks in priority order (P1 → P2 → P3)
3. Test each user story independently
4. Create pull request when all tasks complete
