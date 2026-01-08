# Contracts: Speckit Constitution Download Page

**Feature**: 001-speckit-constitution
**Date**: 2026-01-04
**Status**: Phase 1 - Design & Contracts

## Overview

This feature uses **direct file serving** for downloads, so no server-side API contracts are required. This document specifies the component interfaces, composable contracts, and static file endpoints.

---

## Server-Side API Contracts

### No Server Routes Required

**Decision**: Based on research findings, this feature uses direct file links for downloads. No server routes (Nuxt server API) are implemented.

**Rationale**:
- Static content served from `public/` directory
- Direct file links meet all success criteria
- No authentication, authorization, or business logic required
- Fastest and most reliable approach (SC-002: <2s download initiation)

**Static File Endpoints** (served automatically by Nuxt):

| Method | Endpoint | Response Type | Description |
|--------|----------|---------------|-------------|
| GET | `/constitution/speckit-constitution.md` | `text/markdown` | Constitution content (for display) |
| GET | `/downloads/speckit-constitution.md` | `text/markdown` | Markdown file download |
| GET | `/downloads/speckit-constitution.zip` | `application/zip` | ZIP archive download |

**Note**: These are not server routes - they're static file URLs handled automatically by Nuxt's static file serving.

---

## Composable Contracts

### useConstitution

**Purpose**: Load and provide constitution content and download options

**Location**: `frontend/composables/useConstitution.ts`

**Signature**:
```typescript
function useConstitution(): {
  content: ConstitutionContent
  downloads: DownloadOption[]
  error: Ref<string | null>
}
```

**Return Type**:
```typescript
interface UseConstitutionReturn {
  /** Constitution content (markdown) */
  content: ConstitutionContent

  /** Available download formats */
  downloads: DownloadOption[]

  /** Error state (reactive) */
  error: Ref<string | null>
}
```

**Implementation Contract**:
```typescript
// composables/useConstitution.ts
import { ref } from 'vue'
import constitutionMarkdown from '~/public/constitution/speckit-constitution.md?raw'

export interface ConstitutionContent {
  markdown: string
  metadata?: {
    title: string
    description: string
    lastUpdated: string
    version: string
  }
}

export interface DownloadOption {
  format: 'md' | 'zip'
  label: string
  url: string
  filename: string
  mimeType: string
  sizeBytes: number
}

export const DOWNLOAD_OPTIONS: DownloadOption[] = [
  {
    format: 'md',
    label: 'Скачать Markdown',
    url: '/downloads/speckit-constitution.md',
    filename: 'speckit-constitution.md',
    mimeType: 'text/markdown',
    sizeBytes: 30 * 1024
  },
  {
    format: 'zip',
    label: 'Скачать ZIP-архив',
    url: '/downloads/speckit-constitution.zip',
    filename: 'speckit-constitution.zip',
    mimeType: 'application/zip',
    sizeBytes: 65 * 1024
  }
]

export const useConstitution = () => {
  const error = ref<string | null>(null)

  const content: ConstitutionContent = {
    markdown: constitutionMarkdown,
    metadata: {
      title: 'Speckit Constitution',
      description: 'Best practices for using Speckit with Claude Code',
      lastUpdated: '2026-01-04',
      version: '1.0.0'
    }
  }

  return {
    content,
    downloads: DOWNLOAD_OPTIONS,
    error
  }
}
```

**Usage Contract**:
```typescript
// In component:
const { content, downloads, error } = useConstitution()

// content.markdown - raw markdown string
// downloads[0].url - download URL for MD file
// error.value - error message or null
```

---

## Component Contracts

### Constitution Page Component

**Location**: `frontend/pages/constitution.vue`

**Props**: None

**Emits**: None

**Slots**: None

**Template Contract**:
```vue
<template>
  <div class="constitution-page">
    <!-- Page Header -->
    <header class="constitution-header">
      <h1>Конституция Speckit</h1>
      <p class="subtitle">Лучшие практики для работы с Claude Code</p>
    </header>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- Download Buttons -->
    <section class="download-section">
      <h2>Скачать конституцию</h2>
      <div class="download-buttons">
        <a
          v-for="option in downloads"
          :key="option.format"
          :href="option.url"
          :download="option.filename"
          @error="handleDownloadError(option.format)"
        >
          <v-btn
            :color="option.format === 'md' ? 'primary' : 'secondary'"
            size="large"
          >
            {{ option.label }}
          </v-btn>
        </a>
      </div>
    </section>

    <!-- Constitution Content -->
    <section class="content-section">
      <MarkdownRenderer
        :source="content.markdown"
        class="markdown-body"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useConstitution } from '~/composables/useConstitution'

const { content, downloads, error } = useConstitution()

const handleDownloadError = (format: string) => {
  error.value = `Не удалось скачать ${format === 'md' ? 'Markdown' : 'ZIP'} файл. Попробуйте еще раз.`
  setTimeout(() => { error.value = null }, 5000)
}
</script>

<style scoped>
.constitution-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.constitution-header {
  text-align: center;
  margin-bottom: 3rem;
}

.download-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--v-theme-surface);
  border-radius: 8px;
}

.download-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.content-section {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

---

### ConstitutionContent Component

**Location**: `frontend/components/constitution/constitution-content.vue`

**Purpose**: Display rendered markdown content with proper styling

**Props**:
```typescript
interface Props {
  /** Raw markdown content to render */
  source: string

  /** Optional CSS class for custom styling */
  class?: string
}
```

**Emits**: None

**Template Contract**:
```vue
<template>
  <div :class="['markdown-body', 'constitution-content', props.class]">
    <MarkdownRenderer :source="props.source" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  source: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})
</script>

<style scoped>
.constitution-content {
  /* GitHub markdown styles applied via github-markdown-css */
  font-size: 16px;
  line-height: 1.6;
}

.constitution-content :deep(h1) {
  border-bottom: 2px solid var(--v-theme-primary);
  padding-bottom: 0.3em;
}

.constitution-content :deep(h2) {
  border-bottom: 1px solid var(--v-theme-background);
  padding-bottom: 0.3em;
}

.constitution-content :deep(pre) {
  background-color: var(--v-theme-background);
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.constitution-content :deep(code) {
  background-color: var(--v-theme-background);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 85%;
}
</style>
```

---

### DownloadButtons Component

**Location**: `frontend/components/constitution/download-buttons.vue`

**Purpose**: Display download action buttons with error handling

**Props**:
```typescript
interface Props {
  /** Array of download options */
  options: DownloadOption[]
}

interface Emits {
  /** Emitted when download fails */
  error: [format: 'md' | 'zip']
}
```

**Template Contract**:
```vue
<template>
  <div class="download-buttons">
    <v-btn
      v-for="option in options"
      :key="option.format"
      :href="option.url"
      :download="option.filename"
      :color="option.format === 'md' ? 'primary' : 'secondary'"
      size="large"
      class="download-btn"
      @error="handleError(option.format)"
    >
      <v-icon start>mdi-download</v-icon>
      {{ option.label }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { DownloadOption } from '~/types/constitution'

interface Props {
  options: DownloadOption[]
}

interface Emits {
  error: [format: 'md' | 'zip']
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleError = (format: 'md' | 'zip') => {
  emit('error', format)
}
</script>

<style scoped>
.download-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.download-btn {
  min-width: 200px;
}
</style>
```

---

## File Structure Contracts

### Static File Locations

```text
frontend/public/
├── constitution/
│   └── speckit-constitution.md
│       ├── Front matter (optional metadata)
│       ├── Title
│       ├── Sections
│       └── Best practices content
│
└── downloads/
    └── speckit-constitution.zip
        ├── README.md
        ├── speckit-constitution.md
        ├── examples/
        │   ├── example-spec.md
        │   ├── example-plan.md
        │   └── custom-constitution-template.md
        └── resources/
            └── speckit-commands.md
```

### File Naming Convention

- **Constitution file**: `speckit-constitution.md`
- **ZIP archive**: `speckit-constitution.zip`
- **Download URLs**: `/downloads/{filename}`

---

## Type Exports

### Public Types

```typescript
// types/constitution.ts
export type {
  ConstitutionContent,
  DownloadOption,
  DownloadFormat
}

export type {
  UseConstitutionReturn,
  ConstitutionPageProps,
  ConstitutionContentProps,
  DownloadButtonsProps,
  DownloadButtonsEmits
}
```

---

## Integration Contracts

### Page Route Contract

**Route**: `/constitution`

**Access**: Public (no authentication required)

**Rendering**: Client-side only (SPA mode)

**Page Metadata** (for SEO/social):
```typescript
{
  title: 'Конституция Speckit | Лучшие практики для Claude Code',
  description: 'Официальная конституция Speckit с лучшими практиками для работы с Claude Code. Скачать в формате Markdown или ZIP.',
  keywords: ['Speckit', 'Claude Code', 'конституция', 'лучшие практики', 'AI']
}
```

### Navigation Integration

**Add to main navigation** (e.g., in layout or header component):
```vue
<v-btn to="/constitution">
  <v-icon start>mdi-book-open-variant</v-icon>
  Конституция Speckit
</v-btn>
```

---

## Testing Contracts

### Manual Test Scenarios

1. **Page Display Test**:
   - Navigate to `/constitution`
   - Verify page renders without errors
   - Verify content displays correctly
   - Verify responsive layout (desktop, tablet, mobile)

2. **Download Test**:
   - Click "Скачать Markdown" button
   - Verify file downloads with correct filename
   - Verify file content matches page content
   - Repeat for ZIP download

3. **Error Handling Test**:
   - Simulate network failure (devtools offline mode)
   - Verify error message displays
   - Verify error clears after 5 seconds

4. **Accessibility Test**:
   - Navigate page using keyboard only
   - Verify focus indicators visible
   - Test with screen reader
   - Verify semantic HTML structure

---

## Summary

**API Contracts**: None required (static file serving)

**Component Contracts**:
- `useConstitution` composable
- `pages/constitution.vue` page component
- `components/constitution/constitution-content.vue` content display component
- `components/constitution/download-buttons.vue` download actions component

**Type Safety**: Full TypeScript coverage for all interfaces

**Next Steps**: Quickstart guide with implementation details
