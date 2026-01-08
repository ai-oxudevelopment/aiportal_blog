# Research & Technology Decisions: Speckit View Enhancements

**Feature**: Speckit View Enhancements (003-speckit-view-enhancements)
**Date**: 2026-01-08
**Status**: Complete

## Overview

This document captures research findings and technology decisions for the Speckit view enhancements feature. All research topics have been investigated and decisions made with consideration for alternatives, constraints, and best practices.

---

## Research Topic 1: Mermaid.js Integration with Nuxt 3/Vue 3

### Question

What is the recommended way to integrate Mermaid.js for dynamic diagram rendering in Nuxt 3?

### Investigation

**Options Evaluated**:

1. **`mermaid` npm package (official)**
   - Latest version: 11.x
   - Pure JavaScript library, framework-agnostic
   - Requires manual DOM manipulation or Vue component wrapper
   - No SSR support (browser-only API)
   - ~2MB bundle size (minified)

2. **`vue-mermaid-string` package**
   - Vue 3 compatible wrapper around mermaid
   - Simplified props-based API
   - Less flexible than direct mermaid usage
   - Dependency on vue-mermaid-string maintenance status
   - Last updated: 2023 (potential maintenance risk)

3. **Custom Vue component with Mermaid integration**
   - Full control over rendering logic
   - Can leverage Nuxt 3 composables
   - Requires handling lifecycle hooks (onMounted)
   - Can implement lazy loading and error boundaries

**Browser Compatibility**:
- Mermaid.js works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support (polyfills needed for IE11, but not a concern for this project)

**Performance Considerations**:
- Mermaid.js is relatively large (~2MB)
- Should be lazy-loaded only when diagram component is used
- Code splitting recommended for optimal bundle size

**SSR Compatibility**:
- Mermaid.js uses browser APIs (DOM, SVG rendering)
- Cannot run on server side
- Must be loaded client-side only with `client-only` component or dynamic imports

### Decision

**Choice**: Custom Vue component with `mermaid` npm package

**Rationale**:
- **Maximum flexibility**: Custom component allows full control over rendering, error handling, and performance optimizations
- **Active maintenance**: The official `mermaid` package is actively maintained (frequent updates, large community)
- **Lazy loading**: Can implement code splitting to load Mermaid only when needed (P2 priority feature)
- **Framework-agnostic**: Easier to upgrade Mermaid versions independently of Vue wrapper libraries
- **Error handling**: Custom implementation allows graceful fallbacks for invalid diagram syntax

**Alternatives Rejected Because**:
- `vue-mermaid-string`: Less active maintenance, limited flexibility for custom styling and error handling
- Waiting for official Nuxt module: No official Nuxt 3 module exists, and building one is out of scope

### Implementation Strategy

```typescript
// composables/useMermaidDiagram.ts
import { onMounted, ref } from 'vue'

export function useMermaidDiagram() {
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  const loadMermaid = async () => {
    try {
      // Dynamic import for code splitting
      const mermaid = await import('mermaid')
      mermaid.default.initialize({ startOnLoad: false })
      isLoaded.value = true
    } catch (err) {
      error.value = 'Failed to load diagram library'
      console.error('[useMermaidDiagram] Load error:', err)
    }
  }

  return {
    isLoaded,
    error,
    loadMermaid
  }
}
```

```vue
<!-- components/speckit/SpeckitDiagramView.vue -->
<template>
  <div v-if="diagramSource" class="speckit-diagram">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div
      v-else
      ref="diagramContainer"
      class="mermaid"
      v-html="renderedSvg"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useMermaidDiagram } from '~/composables/useMermaidDiagram'

const props = defineProps<{
  diagramSource: string
}>()

const { isLoaded, error, loadMermaid } = useMermaidDiagram()
const renderedSvg = ref('')

onMounted(async () => {
  await loadMermaid()
  await renderDiagram()
})

watch(() => props.diagramSource, renderDiagram)
</script>
```

**Dependencies to Add**:
```json
{
  "devDependencies": {
    "mermaid": "^11.0.0",
    "@types/mermaid": "^11.0.0"
  }
}
```

---

## Research Topic 2: Clipboard API Browser Support & Fallbacks

### Question

How to handle clipboard operations in browsers with limited or no Clipboard API support?

### Investigation

**Browser Support for `navigator.clipboard`**:
- Chrome/Edge: 66+ (full support)
- Firefox: 63+ (full support)
- Safari: 13.1+ (full support)
- Opera: 53+ (full support)
- IE: Not supported (not a concern for modern web app)

**Limitations**:
- Requires secure context (HTTPS or localhost)
- Requires user gesture (click, keypress)
- May be blocked in iframe contexts depending on permissions

**Legacy Fallback: `document.execCommand('copy')`**:
- Deprecated but still widely supported
- Works in older browsers (Chrome 43+, Firefox 41+, Safari 10+)
- Requires text selection in DOM (hidden textarea can be used)
- Less reliable than Clipboard API

**Graceful Degradation**:
- Show manual copy instructions if both APIs fail
- Display "Press Ctrl+C to copy" message
- Provide text selection for manual copying

### Decision

**Choice**: Modern Clipboard API with `execCommand` fallback + graceful degradation

**Rationale**:
- **Best user experience**: Clipboard API is async, non-blocking, and doesn't require DOM manipulation
- **Broad support**: Covers 95%+ of modern browsers with Clipboard API
- **Fallback coverage**: `execCommand` covers older browser versions (2016-2019 era)
- **No false promises**: Clear user feedback if copy fails

**Alternatives Rejected Because**:
- Clipboard API only: Would fail in ~5% of browsers without clear feedback
- execCommand only: Deprecated API, poorer UX (requires DOM selection manipulation)
- Copy-to-clipboard libraries (e.g., `clipboard.js`): Unnecessary dependency for this use case, adds bundle size

### Implementation Strategy

```typescript
// composables/useClipboard.ts
import { ref } from 'vue'

export function useClipboard() {
  const isSupported = ref(false)
  const error = ref<string | null>(null)

  // Check support on mount
  if (process.client) {
    isSupported.value = !!(navigator.clipboard || document.queryCommandSupported?.('copy'))
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    error.value = null

    // Try modern Clipboard API first
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err: any) {
        console.warn('[useClipboard] Clipboard API failed:', err)
        // Fall through to legacy method
      }
    }

    // Fallback to execCommand
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)

      if (!successful) {
        throw new Error('execCommand failed')
      }

      return true
    } catch (err: any) {
      error.value = 'Не удалось скопировать. Пожалуйста, выделите и скопируйте текст вручную.'
      console.error('[useClipboard] Copy failed:', err)
      return false
    }
  }

  return {
    isSupported,
    error,
    copyToClipboard
  }
}
```

```vue
<!-- components/speckit/SpeckitCopyCommand.vue -->
<template>
  <div class="copy-command-container">
    <div
      class="command-display"
      :class="{ 'copied': justCopied }"
      @click="handleCopy"
      :title="isSupported ? 'Нажмите, чтобы скопировать' : 'Скопируйте команду вручную'"
    >
      <code class="command-text">{{ truncatedCommand }}</code>
      <span class="copy-icon">
        <svg v-if="!justCopied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </div>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClipboard } from '~/composables/useClipboard'

const props = defineProps<{
  command: string
}>()

const { isSupported, error, copyToClipboard } = useClipboard()
const justCopied = ref(false)

const truncatedCommand = computed(() => {
  const maxLength = 40
  return props.command.length > maxLength
    ? `${props.command.substring(0, maxLength)}...`
    : props.command
})

const handleCopy = async () => {
  const success = await copyToClipboard(props.command)
  if (success) {
    justCopied.value = true
    setTimeout(() => {
      justCopied.value = false
    }, 2000)
  }
}
</script>
```

---

## Research Topic 3: Mermaid Diagram Data Structure in Strapi

### Question

What field type and structure should be used in Strapi to store Mermaid diagram source code?

### Investigation

**Strapi Field Type Options**:

1. **Text field (Long Text)**
   - Stores plain text string (Mermaid syntax)
   - Simple, no validation on Mermaid syntax
   - Easy to edit in Strapi admin panel
   - No metadata storage (diagram type, author, version)

2. **JSON field**
   - Can store structured object: `{ source: "...", type: "flowchart", version: "1.0" }`
   - Allows metadata alongside diagram source
   - Requires JSON parsing/serialization
   - Slightly more complex editing experience

3. **Rich Text (Markdown)**
   - Can include Mermaid code block with syntax highlighting
   - Supports additional content alongside diagram
   - Overkill for simple diagram storage
   - Unnecessary complexity for this use case

4. **Custom Component field**
   - Build custom Strapi field component for Mermaid
   - Live preview in Strapi admin panel
   - Requires development effort
   - Maintenance overhead for custom component

**Mermaid Syntax Examples**:
```
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

### Decision

**Choice**: Text field (Long Text) named `diagram`

**Rationale**:
- **Simplicity**: Mermaid syntax is plain text, no need for complex structures
- **Direct editing**: Content editors can paste Mermaid code directly without JSON formatting
- **Validation flexibility**: Frontend can validate Mermaid syntax before rendering (handle invalid syntax gracefully)
- **Future-proof**: Easy to migrate to JSON or custom field later if needed
- **Minimal storage overhead**: No unnecessary wrapper structure

**Alternatives Rejected Because**:
- JSON field: Over-engineering for current requirements, adds complexity without clear benefit
- Rich Text: Unnecessary complexity, diagram is standalone content not mixed with other text
- Custom Component: Development effort not justified for MVP, can be added later if preview is needed

### Strapi Schema Update

**Field to Add to Articles Content Type**:
```json
{
  "name": "diagram",
  "type": "text",
  "long": true,
  "required": false,
  "private": false,
  "default": null
}
```

**Example Content in Strapi**:
```yaml
Title: "Sample Speckit"
Slug: "sample-speckit"
Type: "speckit"
Body: "# Documentation\n..."
Diagram: |
  graph TD
    A[Start] --> B[Process]
    B --> C[End]
```

**Frontend Validation**:
- Try rendering Mermaid syntax
- Catch syntax errors and display "invalid diagram" message
- Log syntax errors for debugging

---

## Research Topic 4: Static FAQ Content Management

### Question

Where and how should FAQ content be stored for easy maintenance?

### Investigation

**Storage Options**:

1. **Hardcoded in Vue component**
   - Simple for MVP (3-5 Q&A pairs)
   - Requires code deployment for updates
   - Content editors cannot modify without developer
   - Good for: Static, rarely changing content

2. **JSON file in `public/` directory**
   - Content editors can modify JSON file
   - Requires file access (FTP, file manager)
   - No version control for content changes unless committed
   - Easy to load via `fetch('/speckit-faq.json')`
   - Good for: Semi-static content with occasional updates

3. **Strapi CMS content type**
   - Full CMS editing capabilities
   - Rich text, media uploads, drafts
   - Multi-language support (i18n)
   - Requires API call to fetch
   - Good for: Dynamic, frequently changing content, multi-language

4. **Component props from parent**
   - FAQ passed as prop to `SpeckitFaqSection` component
   - Requires parent component to have FAQ data
   - Reduces reusability of FAQ component
   - Not recommended for this use case

**Content Management Workflow**:
- Hardcoded: Developer updates code → deploy
- JSON file: Content editor edits file → reload page
- Strapi: Content editor logs into admin → publish → instant update

### Decision

**Choice**: JSON file in `frontend/public/speckit-faq.json`

**Rationale**:
- **Balance of simplicity and maintainability**: Easy to edit without code deployment
- **Performance**: Static file served directly, no API overhead
- **Version control**: Can be committed to git for content versioning
- **Caching**: Browser caching works naturally
- **No CMS complexity**: No need for Strapi schema changes for simple FAQ
- **Multi-language ready**: Can add `speckit-faq.ru.json`, `speckit-faq.en.json` later

**Alternatives Rejected Because**:
- Hardcoded in component: Content editors cannot modify without developer involvement
- Strapi content type: Overkill for static FAQ, adds API latency, unnecessary CMS complexity

**Future Migration Path**:
If FAQ becomes dynamic or requires CMS features:
1. Move FAQ to Strapi content type
2. Update component to fetch from API endpoint
3. Component interface remains unchanged (props-based)

### Implementation Strategy

**File Structure**:
```text
frontend/public/
└── speckit-faq.json
```

**FAQ JSON Format**:
```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-08",
  "language": "ru",
  "categories": [
    {
      "id": "getting-started",
      "title": "Начало работы",
      "questions": [
        {
          "id": "what-is-speckit",
          "question": "Что такое Speckit?",
          "answer": "Speckit - это готовая конфигурация для вашего проекта, которая помогает структурировать работу с AI-ассистентами."
        },
        {
          "id": "how-to-download",
          "question": "Как скачать Speckit?",
          "answer": "Нажмите кнопку **Скачать** внизу страницы или скопируйте команду wget и выполните её в терминале."
        }
      ]
    },
    {
      "id": "environment-setup",
      "title": "Настройка окружения",
      "questions": [
        {
          "id": "system-requirements",
          "question": "Какие системные требования?",
          "answer": "Для работы со Speckit вам потребуется Node.js 18+, текстовый редактор (VS Code, Vim) и доступ к терминалу."
        },
        {
          "id": "installation-steps",
          "question": "Как установить Speckit в проект?",
          "answer": "1. Скачайте Speckit файл\n2. Разместите его в корне проекта\n3. Следуйте инструкциям в файле"
        }
      ]
    },
    {
      "id": "troubleshooting",
      "title": "Решение проблем",
      "questions": [
        {
          "id": "download-failed",
          "question": "Файл не скачивается. Что делать?",
          "answer": "Попробуйте скопировать команду wget и выполнить её в терминале. Убедитесь, что у вас есть доступ к интернету."
        }
      ]
    }
  ]
}
```

**Component Loading**:
```typescript
// composables/useSpeckitFaq.ts
import { ref } from 'vue'

export function useSpeckitFaq() {
  const faqData = ref<SpeckitFaq | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const loadFaq = async () => {
    try {
      const response = await fetch('/speckit-faq.json')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      faqData.value = await response.json()
    } catch (err: any) {
      error.value = 'Не удалось загрузить FAQ. Попробуйте позже.'
      console.error('[useSpeckitFaq] Load error:', err)
    } finally {
      loading.value = false
    }
  }

  // Load on call
  loadFaq()

  return {
    faqData,
    loading,
    error
  }
}
```

```vue
<!-- components/speckit/SpeckitFaqSection.vue -->
<template>
  <div class="speckit-faq">
    <h3>Часто задаваемые вопросы</h3>

    <div v-if="loading" class="loading">
      Загрузка FAQ...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <v-expansion-panels v-else-if="faqData" variant="popout">
      <v-expansion-panel
        v-for="category in faqData.categories"
        :key="category.id"
        :title="category.title"
      >
        <v-expansion-panel-text>
          <div v-for="q in category.questions" :key="q.id" class="faq-item">
            <h4 class="faq-question">{{ q.question }}</h4>
            <div class="faq-answer" v-html="renderMarkdown(q.answer)"></div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
```

---

## Research Topic 5: Mobile Responsive Layout for Fixed Width Elements

### Question

How to handle 250px command display and 50px download button on mobile devices (<375px width)?

### Investigation

**Mobile Screen Sizes**:
- Small phones: 320px - 375px (iPhone SE, older Android)
- Medium phones: 375px - 414px (iPhone 12/13, most modern phones)
- Large phones: 414px - 428px (iPhone 14 Pro Max, Android flagships)
- Tablets: 768px+ (iPad, Android tablets)

**Layout Challenges**:
- 250px + 50px = 300px minimum (without margins, padding, gaps)
- On 320px screen: Only 20px for margins/padding/gaps (very tight)
- On 375px screen: 75px for margins/padding/gaps (comfortable)
- Long wget URLs may overflow fixed width containers

**CSS Strategies**:

1. **Responsive widths with percentages**
   - Command: `width: 80%` (240px on 320px screen)
   - Download: `width: 15%` (48px on 320px screen)
   - Pros: Scales to screen size
   - Cons: 250px requirement not met on larger screens

2. **Fixed widths with media queries**
   - Desktop (375px+): 250px + 50px (as specified)
   - Mobile (<375px): Stack vertically or scale down
   - Pros: Meets requirements on desktop
   - Cons: Breaks spec requirements on small screens

3. **Scrollable container (horizontal scroll)**
   - Fixed width container with `overflow-x: auto`
   - User can scroll to see full command
   - Pros: Preserves exact widths
   - Cons: Poor UX, hidden content

4. **Stacked vertical layout on small screens**
   - Command display (full width)
   - Download button below (full width)
   - Pros: All content visible, better UX
   - Cons: Doesn't match horizontal layout on desktop

**User Experience Considerations**:
- Spec states "approximately 250px" - not rigid requirement
- Mobile users expect vertical stacking for cramped layouts
- Horizontal scroll is generally discouraged in mobile UX
- Copy command should be easily tappable (minimum 44x44px touch target)

### Decision

**Choice**: Responsive widths with breakpoints - horizontal on desktop, stacked on mobile

**Rationale**:
- **Desktop (375px+)**: Horizontal layout with 250px command + 50px download (meets spec)
- **Mobile (<375px)**: Stacked vertical layout (better UX)
- **"approximately 250px"**: Interpret as guideline, not rigid constraint
- **Touch-friendly**: Stacked layout ensures minimum 44x44px touch targets
- **Future-proof**: Flexible layout adapts to new device sizes

**Alternatives Rejected Because**:
- Fixed widths everywhere: Breaks layout on small phones (<375px)
- Horizontal scroll: Poor UX, content hidden
- Percentage-only widths: Doesn't meet 250px requirement on desktop

### Implementation Strategy

**CSS with Tailwind**:
```vue
<template>
  <div class="speckit-download-section">
    <!-- Desktop: Horizontal layout -->
    <div class="flex-row md:flex">
      <SpeckitCopyCommand
        :command="wgetCommand"
        class="w-[250px] flex-shrink-0"
      />
      <button
        @click="handleDownload"
        class="w-[50px] flex-shrink-0 ml-2"
      >
        <DownloadIcon />
      </button>
    </div>

    <!-- Mobile: Stacked layout -->
    <div class="flex-col flex md:hidden">
      <SpeckitCopyCommand
        :command="wgetCommand"
        class="w-full max-w-[250px]"
      />
      <button
        @click="handleDownload"
        class="w-full max-w-[50px] mt-2 mx-auto"
      >
        <DownloadIcon />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Desktop: 375px and up */
@media (min-width: 375px) {
  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

/* Mobile: Under 375px */
@media (max-width: 374px) {
  .flex-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
```

**Tailwind Utility Classes**:
- Desktop: `md:flex md:flex-row md:items-center`
- Mobile: `flex flex-col` (default)
- Command: `w-[250px]` on desktop, `w-full max-w-[250px]` on mobile
- Download: `w-[50px]` on desktop, `w-full max-w-[50px]` on mobile
- Spacing: `ml-2` (desktop), `mt-2` (mobile)

**Visual Feedback**:
- Desktop: Side-by-side layout
- Mobile: Centered stacked layout with generous spacing
- Touch targets: Minimum 44x44px for mobile tapping

---

## Summary of Decisions

| Topic | Decision | Key Rationale |
|-------|----------|---------------|
| **Mermaid.js Integration** | Custom Vue component + `mermaid` npm package | Flexibility, active maintenance, lazy loading |
| **Clipboard API** | Modern API + `execCommand` fallback + graceful degradation | 95%+ coverage, best UX, clear error handling |
| **Diagram Storage** | Strapi Text field (`diagram`) | Simplicity, direct editing, future-proof |
| **FAQ Storage** | JSON file in `public/speckit-faq.json` | Easy maintenance, version control, static performance |
| **Mobile Layout** | Responsive breakpoints (horizontal desktop, stacked mobile) | Meets spec on desktop, better UX on mobile |

---

## Dependencies to Install

```bash
cd frontend
yarn add mermaid@^11.0.0
yarn add -D @types/mermaid@^11.0.0
```

---

## Next Steps

1. ✅ Research complete - all decisions documented
2. ⏭️ Proceed to Phase 1: Data Modeling
3. ⏭️ Generate TypeScript interfaces and API contracts
