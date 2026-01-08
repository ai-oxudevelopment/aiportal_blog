# Research: Speckit Constitution Download Page

**Feature**: 001-speckit-constitution
**Date**: 2026-01-04
**Status**: Phase 0 - Research Complete

## Overview

This document resolves all technical unknowns identified during the planning phase. The primary areas requiring research were language strategy, content rendering approaches, and integration patterns.

---

## Topic 1: Language Strategy (Russian vs English)

### Question

Should the Speckit pages be in Russian (following constitution principle IV) or English (as Speckit/Claude Code documentation is typically in English)?

### Research Findings

**Constitution Requirement**:
- Principle IV states: "Приложение по умолчанию русскоязычное" (Application is Russian by default)
- All UI elements, labels, error messages must be in Russian
- However, this applies to user-facing interface, not necessarily content

**Speckit/Claude Code Context**:
- Speckit is an AI agent development framework
- Documentation and examples in the Speckit ecosystem are primarily in English
- Target users are developers working with Claude Code
- Technical content (code examples, best practices) is conventionally English

**Existing Project Patterns**:
- Review of existing pages (blogs.vue, prompts, research) shows Russian UI
- User comments and content can be mixed (Russian interface, English/mixed content)
- Error messages and system text are consistently in Russian

### Decision: Hybrid Approach (Option D)

**Page UI**: Russian
- Page titles: "Конституция Speckit", "Каталог Speckit"
- Navigation labels: "Главная", "Блог", "Промпты", "Исследования"
- Button labels: "Скачать Markdown", "Скачать ZIP-архив", "Фильтр", "Поиск"
- Category labels: "Конституции", "Шаблоны", "Примеры", "Руководства"
- Error messages: Russian
- Empty states: "Нет элементов", "Загрузка...", "Ошибка загрузки"

**Content**: English
- Constitution markdown text: English (best practices for Claude Code + Speckit)
- Speckit catalog content: English (from Strapi CMS)
- File previews: English (as authored)
- Code examples: English (comments, variable names)

### Rationale

1. **Constitution Compliance**: Satisfies Principle IV (Russian-language first)
2. **User Experience**: Russian-speaking developers can navigate and understand the interface
3. **Ecosystem Alignment**: Content remains in English, matching Speckit/Claude Code conventions
4. **Maintainability**: Clear separation between UI (Russian) and content (English)
5. **Future Flexibility**: Easy to add i18n for UI if needed, without affecting content

### Alternatives Considered

- **A: Russian-only**: Would require translating all Speckit content, losing ecosystem alignment
- **B: English-only**: Violates constitution Principle IV, poor UX for Russian-speaking users
- **C: Bilingual toggle**: Unnecessary complexity for documentation-focused pages, adds development overhead

### Implementation Notes

- Use Russian for all Vuetify component labels, alerts, tooltips
- Store Russian UI strings in component templates or i18n keys (if adding i18n later)
- Serve English content directly from markdown files and Strapi without translation
- Error messages from server routes should be in Russian before sending to client

---

## Topic 2: Markdown Rendering Strategy

### Question

What's the best approach for rendering markdown content for both the constitution page and file previews in Strapi?

### Research Findings

**Project Dependencies**:
- `@nuxtjs/mdc` is already installed (Markdown Content Renderer)
- `github-markdown-css` is already configured
- `nuxt-markdown-render` package is available

**Nuxt MDC (@nuxtjs/mdc)**:
- Pros: Powerful, supports components, syntax highlighting, already installed
- Cons: May be overkill for simple markdown display
- Best for: Rich content with embedded Vue components

**nuxt-markdown-render**:
- Pros: Lightweight, simple API, designed for basic rendering
- Cons: Fewer features than MDC
- Best for: Straightforward markdown-to-HTML conversion

**GitHub Markdown CSS**:
- Already configured in nuxt.config.js
- Provides GitHub-style markdown styling
- Works with any markdown rendering approach

### Decision: Use nuxt-markdown-render

**For Constitution Page**:
```vue
<template>
  <MarkdownRenderer
    :source="content.markdown"
    class="markdown-body"
  />
</template>

<script setup lang="ts">
import { MarkdownRenderer } from 'nuxt-markdown-render'
</script>
```

**For File Previews (Detail Pages)**:
- Use same `MarkdownRenderer` component for markdown files
- For non-markdown files, display code preview or fallback message
- Apply `github-markdown-css` class `markdown-body` for consistent styling

### Rationale

1. **Simplicity**: Lightweight, focused on markdown rendering
2. **Performance**: Faster than full MDC for static content
3. **Sufficient Features**: Handles all standard markdown (headers, lists, code blocks, links)
4. **Consistency**: Same approach for constitution and previews
5. **Existing Configuration**: `github-markdown-css` already provides styling

### Alternatives Considered

- **@nuxtjs/mdc**: More powerful but unnecessary complexity for this use case
- **Raw HTML with marked.js**: Requires more setup, less integrated with Nuxt
- **Pre-rendered HTML**: Loses markdown source benefits (not editable, harder to maintain)

---

## Topic 3: Pinia Store Structure for Catalog

### Question

What's the optimal Pinia store structure for managing catalog state (filters, search, loading, items)?

### Research Findings

**Catalog State Requirements**:
- List of catalog items from Strapi
- Selected category filter
- Search query text
- Loading state
- Error state
- Pagination (optional, for future)

**Pinia Best Practices**:
- Stores should be focused on a single domain (catalog)
- Use composition API style (`defineStore`)
- Separate state, getters, and actions clearly
- Use composables for component-level logic, stores for shared state

### Decision: Single `useSpeckitCatalogStore` with Focused State

```typescript
// stores/speckitCatalog.ts
export const useSpeckitCatalogStore = defineStore('speckitCatalog', () => {
  // State
  const items = ref<SpeckitCatalogItem[]>([])
  const selectedCategory = ref<SpeckitCategory | 'all'>('all')
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const filteredItems = computed(() => {
    return items.value.filter(item => {
      const matchesCategory = selectedCategory.value === 'all' ||
        item.category === selectedCategory.value
      const matchesSearch = searchQuery.value === '' ||
        item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      return matchesCategory && matchesSearch
    })
  })

  const categories = computed(() => {
    // Extract unique categories from items
    const uniqueCategories = new Set(items.value.map(item => item.category))
    return Array.from(uniqueCategories)
  })

  // Actions
  async function fetchItems() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await useSpeckitCatalog()
      items.value = data.value
    } catch (err) {
      error.value = 'Не удалось загрузить каталог'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function setCategory(category: SpeckitCategory | 'all') {
    selectedCategory.value = category
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  return {
    // State
    items,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    // Getters
    filteredItems,
    categories,
    // Actions
    fetchItems,
    setCategory,
    setSearch
  }
})
```

### Usage in Components

```vue
<!-- pages/speckit-catalog.vue -->
<script setup lang="ts">
const catalogStore = useSpeckitCatalogStore()

// Fetch items on mount
onMounted(() => {
  catalogStore.fetchItems()
})

// Use filtered items from store
const { filteredItems, isLoading, error, selectedCategory } = storeToRefs(catalogStore)
</script>
```

### Rationale

1. **Single Source of Truth**: All catalog state in one place
2. **Computed Filtering**: Filtered items computed reactively from filters
3. **Separation of Concerns**: Store manages data, components manage presentation
4. **Testability**: Store logic can be tested independently
5. **Reusability**: Store can be used across multiple components (catalog page, filters, search)

### Alternatives Considered

- **Local Component State**: Would require prop drilling, no state sharing between filter and grid
- **Multiple Stores** (items, filters, ui): Unnecessary complexity for this scope
- **Composable Only** (no Pinia): Possible but less organized for complex state

---

## Topic 4: Strapi Integration via Server Routes

### Question

What's the proper pattern for integrating Strapi CMS following constitution Principle I (Server-Side Proxy Architecture)?

### Research Findings

**Constitution Principle I Requirements**:
- All external API calls MUST go through Nuxt server routes
- Client components MUST NOT call Strapi directly
- Server routes encapsulate URL, authorization, query logic
- Server routes normalize data to frontend domain models

**Existing Project Patterns**:
- Review of existing server routes (if any) - [To be investigated during implementation]
- Strapi v5 API patterns
- Nuxt 3 server route best practices

### Decision: Server Routes with Normalization Layer

**Server Route Structure**:
```text
server/
├── api/
│   ├── speckit-catalog.get.ts       # GET /api/speckit-catalog
│   └── speckit-detail/
│       └── [id].get.ts              # GET /api/speckit-detail/:id
└── utils/
    └── strapi-client.ts             # Shared Strapi client utilities
```

**Implementation Pattern**:

```typescript
// server/utils/strapi-client.ts
export async function fetchFromStrapi(
  endpoint: string,
  event: H3Event,
  options = {}
) {
  const config = useRuntimeConfig()
  const strapiUrl = config.strapiUrl || 'http://localhost:1337'

  try {
    const response = await $fetch(`${strapiUrl}/api${endpoint}`, {
      headers: {
        Authorization: config.strapiApiToken
          ? `Bearer ${config.strapiApiToken}`
          : undefined
      },
      ...options
    })

    return response
  } catch (error: any) {
    console.error('[Strapi API Error]', {
      endpoint,
      status: error.response?.status,
      message: error.message,
      timestamp: new Date().toISOString()
    })

    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: 'Ошибка при загрузке данных с сервера'
    })
  }
}

// server/api/speckit-catalog.get.ts
export default defineEventHandler(async (event) => {
  const response = await fetchFromStrapi('/speckits', event, {
    query: {
      populate: '*',
      sort: 'createdAt:desc'
    }
  })

  return {
    data: response.data.map(normalizeSpeckitItem),
    meta: response.meta
  }
})

// Normalization function
function normalizeSpeckitItem(strapiItem: any): SpeckitCatalogItem {
  return {
    id: String(strapiItem.id),
    title: strapiItem.attributes.title,
    description: strapiItem.attributes.description,
    category: strapiItem.attributes.category,
    downloadUrl: strapiItem.attributes.file?.data?.attributes?.url,
    previewContent: strapiItem.attributes.preview_content
  }
}
```

**Client-Side Composable**:
```typescript
// composables/useSpeckitCatalog.ts
export const useSpeckitCatalog = () => {
  return useFetch('/api/speckit-catalog')
}
```

### Rationale

1. **Constitution Compliance**: All Strapi calls go through server routes
2. **Centralized Error Handling**: Unified error handling in `fetchFromStrapi`
3. **Security**: Strapi API token never exposed to client
4. **Normalization**: Frontend works with domain types, not Strapi shapes
5. **Testability**: Server routes can be tested independently
6. **Caching**: Can add caching at server route level if needed

### Alternatives Considered

- **Direct Strapi calls from client**: Violates constitution Principle I
- **@nuxtjs/strapi module**: Could be used, but custom client provides more control
- **BFF (Backend for Frontend) pattern**: Overkill for this scope, server routes sufficient

---

## Topic 5: File Download Approach

### Question

How should file downloads be handled? Direct links vs server routes with tracking?

### Research Findings

**Constitution Downloads**:
- Static files in `public/downloads/`
- Two formats: Markdown (.md) and ZIP archive
- No authentication required
- No download tracking required (not in spec)

**Catalog Item Downloads**:
- Files stored in Strapi CMS
- Strapi provides direct URLs to files
- No authentication required for public access

**Success Criteria**:
- SC-002: Download initiates within 2 seconds
- SC-003: 99%+ download success rate
- SC-006: Downloaded file contains 100% of content

### Decision: Direct File Links (No Server Routes for Downloads)

**For Constitution**:
```vue
<template>
  <a
    href="/downloads/speckit-constitution.md"
    download="speckit-constitution.md"
  >
    <v-btn>Скачать Markdown</v-btn>
  </a>
  <a
    href="/downloads/speckit-constitution.zip"
    download="speckit-constitution.zip"
  >
    <v-btn>Скачать ZIP-архив</v-btn>
  </a>
</template>
```

**For Catalog Items**:
```vue
<template>
  <a
    :href="item.downloadUrl"
    :download="getFileName(item.downloadUrl)"
  >
    <v-btn>Скачать</v-btn>
  </a>
</template>

<script setup lang="ts">
function getFileName(url: string): string {
  // Extract filename from Strapi URL
  return url.split('/').pop() || 'download'
}
</script>
```

**Error Handling**:
```vue
<script setup lang="ts">
const downloadError = ref<string | null>(null)

function handleDownloadError(url: string) {
  downloadError.value = 'Не удалось скачать файл. Попробуйте еще раз.'
  setTimeout(() => { downloadError.value = null }, 5000)
}

// Add @error handler to anchor tags if needed
</script>
```

### Rationale

1. **Simplicity**: Direct links are simplest approach
2. **Performance**: Meets SC-002 (<2s initiation) - fastest possible
3. **Reliability**: Meets SC-003 (99%+ success) - browser handles downloads
4. **Caching**: Browser and CDN cache static files
5. **No Tracking Required**: Spec doesn't mention download analytics
6. **Strapi URLs**: Strapi already provides optimized file serving

### Future Consideration

If download tracking is needed later:
- Add server route `/api/track-download`
- Use event tracking (e.g., Yandex Metrika) on button click
- Implement download logging via analytics, not server routes

### Alternatives Considered

- **Server routes for all downloads**: Unnecessary overhead, no benefit
- **Blob generation on client**: More complex, slower, no advantage
- **Streaming downloads**: Overkill for small files (<1MB per SC-002)

---

## Summary

All technical unknowns have been resolved:

| Topic | Decision | Key Points |
|-------|----------|------------|
| **Language Strategy** | Hybrid (Russian UI + English content) | Satisfies constitution, aligns with ecosystem |
| **Markdown Rendering** | nuxt-markdown-render | Lightweight, sufficient, already configured |
| **Pinia Store** | Single `useSpeckitCatalogStore` | Centralized state, computed filtering |
| **Strapi Integration** | Server routes with normalization | Constitution-compliant, secure, testable |
| **File Downloads** | Direct file links | Simplest, fastest, most reliable |

**Next Steps**: Proceed to Phase 1 (Design & Contracts) to create:
- data-model.md (domain types, state management)
- contracts/api-contracts.md (server route contracts)
- quickstart.md (implementation guide)
- Agent context update (CLAUDE.md)
