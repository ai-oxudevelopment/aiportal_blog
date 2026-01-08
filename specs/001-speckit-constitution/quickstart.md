# Quickstart Guide: Speckit Constitution Download Page

**Feature**: 001-speckit-constitution
**Branch**: `001-speckit-constitution`
**Estimated Time**: 4-6 hours
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for implementing the Speckit Constitution page and Catalog browser system. The implementation is divided into two phases:

**Phase 1**: Constitution Page (static content, ~2 hours)
**Phase 2**: Catalog System (Strapi integration, ~3-4 hours)

You can implement Phase 1 first for immediate value, then add Phase 2 later.

---

## Prerequisites

### 1. Environment Setup

Ensure you have the following installed:
- Node.js 18+ and Yarn
- Strapi v5 (for Phase 2)
- Git

### 2. Branch Creation

```bash
# Create feature branch from master
git checkout master
git pull origin master
git checkout -b 001-speckit-constitution

# Verify you're on the right branch
git branch
```

### 3. Start Development Servers

```bash
# Terminal 1: Frontend (Nuxt)
cd frontend
yarn install
yarn dev

# Terminal 2: Strapi (for Phase 2 only)
cd backend
yarn develop
```

Verify frontend is running at `http://localhost:8080` and Strapi at `http://localhost:1337`.

---

## Phase 1: Constitution Page (Static Content)

### Step 1: Create Constitution Content (15 min)

Create the Speckit constitution markdown file.

**Location**: `frontend/public/constitution/speckit-constitution.md`

```markdown
# Speckit Constitution

Best practices for using Speckit with Claude Code.

## Purpose

This constitution provides guidelines and best practices for effectively using Speckit with Claude Code to accelerate AI agent development.

## Core Principles

1. **Specifications First**: Always start with clear feature specifications
2. **Incremental Planning**: Use `/speckit.plan` after specification
3. **Task Breakdown**: Generate actionable tasks with `/speckit.tasks`
4. **Quality Assurance**: Validate specifications with `/speckit.analyze`

## Workflow Recommendations

### 1. Feature Specification

Use `/speckit.specify` to create detailed specifications from user descriptions:

```bash
/speckit.specify "Add user authentication with JWT tokens"
```

### 2. Implementation Planning

After specification, use `/speckit.plan` to create implementation plans:

```bash
/speckit.plan
```

### 3. Task Generation

Break down plans into actionable tasks:

```bash
/speckit.tasks
```

### 4. Clarification Loop

If specifications are unclear, use clarification:

```bash
/speckit.clarify
```

## Best Practices

### Write Clear User Stories

- ✅ GOOD: "As a user, I want to reset my password via email link"
- ❌ BAD: "Add password reset"

### Define Success Criteria

Include measurable outcomes:
- Page load time <3 seconds
- 90% of users complete task on first attempt
- 99%+ uptime

### Validate Before Implementation

Use `/speckit.analyze` to cross-check spec, plan, and tasks for consistency.

## Common Patterns

### Specification Quality Checklist

All specifications must have:
- [x] User stories with acceptance scenarios
- [x] Functional requirements (FR-001, FR-002, etc.)
- [x] Success criteria (measurable outcomes)
- [x] Edge cases identified
- [x] Assumptions documented

### Constitution Compliance

All features must comply with project constitution principles:
- Server-side proxy architecture
- Feature-based component organization
- Dual UI framework (Vuetify + Tailwind)
- Russian-language first
- SPA deployment model

## Troubleshooting

### "/speckit.specify not found"

Ensure Speckit skills are installed in Claude Code configuration.

### "Plan generation failed"

Check that specification has no [NEEDS CLARIFICATION] markers.

### "Tasks missing dependencies"

Run `/speckit.analyze` to validate cross-artifact consistency.

## Additional Resources

- [Speckit Documentation](https://github.com/speckit-ai/speckit)
- [Claude Code Guide](https://code.anthropic.com)
- Project constitution: `.specify/memory/constitution.md`

---

**Version**: 1.0.0
**Last Updated**: 2026-01-04
**License**: MIT
```

### Step 2: Create Download Files (10 min)

**2a. Create Markdown Download**

Copy constitution file to downloads directory:

```bash
# Create downloads directory
mkdir -p frontend/public/downloads

# Copy constitution
cp frontend/public/constitution/speckit-constitution.md \
   frontend/public/downloads/speckit-constitution.md
```

**2b. Create ZIP Archive**

```bash
cd frontend/public/downloads

# Create ZIP structure
mkdir -p zip-content/examples zip-content/resources

# Create README for ZIP
cat > zip-content/README.md << 'EOF'
# Speckit Constitution

Best practices for using Speckit with Claude Code.

## Contents

- `speckit-constitution.md` - Main constitution document
- `examples/` - Example specifications and plans
- `resources/` - Reference materials

## Quick Start

1. Read the constitution document
2. Review examples for common patterns
3. Use templates for your own specifications

## Version

Version: 1.0.0
Last Updated: 2026-01-04
EOF

# Copy constitution to ZIP
cp speckit-constitution.md zip-content/

# Create example files
cat > zip-content/examples/example-spec.md << 'EOF'
# Example: User Authentication

## User Stories

### US1: Login with Email and Password

As a user, I want to log in with my email and password so that I can access my account.

**Acceptance Criteria**:
- User enters email and password
- System validates credentials
- On success, user is redirected to dashboard
- On failure, error message is displayed
EOF

cat > zip-content/examples/example-plan.md << 'EOF'
# Implementation Plan: User Authentication

## Summary

Implement JWT-based authentication with email/password login.

## Technical Approach

- Backend: Strapi v5 with JWT authentication
- Frontend: Nuxt 3 with Pinia store
- Auth flow: Server-side proxy architecture per constitution
EOF

cat > zip-content/resources/speckit-commands.md << 'EOF'
# Speckit Commands Reference

## Specification

```bash
/speckit.specify "user description"
```

Creates feature specification from user description.

## Planning

```bash
/speckit.plan
```

Generates implementation plan from specification.

## Tasks

```bash
/speckit.tasks
```

Creates actionable task breakdown from plan.

## Clarification

```bash
/speckit.clarify
```

Resolves ambiguities in specification.

## Analysis

```bash
/speckit.analyze
```
Validates cross-artifact consistency.
EOF

# Create ZIP
zip -r speckit-constitution.zip zip-content/
rm -rf zip-content/

# Verify file size (should be <1MB)
ls -lh speckit-constitution.zip
```

### Step 3: Create Composable (15 min)

**Location**: `frontend/composables/useConstitution.ts`

```typescript
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
    sizeBytes: 30 * 1024 // ~30 KB
  },
  {
    format: 'zip',
    label: 'Скачать ZIP-архив',
    url: '/downloads/speckit-constitution.zip',
    filename: 'speckit-constitution.zip',
    mimeType: 'application/zip',
    sizeBytes: 65 * 1024 // ~65 KB
  }
]

export const useConstitution = (): ConstitutionContent => {
  return {
    markdown: constitutionMarkdown,
    metadata: {
      title: 'Speckit Constitution',
      description: 'Best practices for using Speckit with Claude Code',
      lastUpdated: '2026-01-04',
      version: '1.0.0'
    }
  }
}
```

### Step 4: Create Components (30 min)

**4a. Constitution Content Component**

**Location**: `frontend/components/constitution/constitution-content.vue`

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
  font-size: 16px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.constitution-content :deep(h1) {
  border-bottom: 2px solid rgb(var(--v-theme-primary));
  padding-bottom: 0.3em;
  margin-top: 1.5em;
  margin-bottom: 1em;
  font-size: 2em;
}

.constitution-content :deep(h2) {
  border-bottom: 1px solid rgb(var(--v-theme-background));
  padding-bottom: 0.3em;
  margin-top: 1.5em;
  margin-bottom: 1em;
  font-size: 1.5em;
}

.constitution-content :deep(pre) {
  background-color: rgb(var(--v-theme-background));
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  margin: 1em 0;
}

.constitution-content :deep(code) {
  background-color: rgb(var(--v-theme-background));
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 85%;
  font-family: 'Courier New', monospace;
}

.constitution-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.constitution-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
```

**4b. Download Buttons Component**

**Location**: `frontend/components/constitution/download-buttons.vue`

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
      variant="elevated"
    >
      <v-icon start>mdi-download</v-icon>
      {{ option.label }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { DownloadOption } from '~/composables/useConstitution'

interface Props {
  options: DownloadOption[]
}

defineProps<Props>()
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

### Step 5: Create Page (30 min)

**Location**: `frontend/pages/constitution.vue`

```vue
<template>
  <v-container class="constitution-page">
    <!-- Page Header -->
    <header class="constitution-header">
      <h1 class="text-h3 text-center mb-2">Конституция Speckit</h1>
      <p class="text-body-1 text-center text-medium-emphasis">
        Лучшие практики для работы с Claude Code
      </p>
    </header>

    <!-- Download Section -->
    <v-card class="download-section mb-8" elevation="2">
      <v-card-title class="text-h5">Скачать конституцию</v-card-title>
      <v-card-text>
        <DownloadButtons :options="downloads" />
      </v-card-text>
    </v-card>

    <!-- Content Section -->
    <section class="content-section">
      <ConstitutionContent :source="content.markdown" />
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { useConstitution, DOWNLOAD_OPTIONS } from '~/composables/useConstitution'

const content = useConstitution()
const downloads = DOWNLOAD_OPTIONS

// SEO metadata
useHead({
  title: 'Конституция Speckit | Лучшие практики для Claude Code',
  meta: [
    {
      name: 'description',
      content: 'Официальная конституция Speckit с лучшими практиками для работы с Claude Code. Скачать в формате Markdown или ZIP.'
    }
  ]
})
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
  padding: 1.5rem;
}

.content-section {
  margin-top: 2rem;
}
</style>
```

### Step 6: Add Navigation (20 min)

Add constitution link to main navigation (location varies by project structure).

**Example**: If using app bar or header component:

```vue
<!-- In your main navigation component -->
<v-btn to="/constitution" variant="text">
  <v-icon start>mdi-book-open-variant</v-icon>
  Конституция
</v-btn>
```

### Step 7: Verify and Test (20 min)

**7a. Start Dev Server**

```bash
cd frontend
yarn dev
```

**7b. Manual Testing Checklist**

- [ ] Navigate to `http://localhost:8080/constitution`
- [ ] Verify page loads without errors
- [ ] Verify content displays correctly with markdown styling
- [ ] Test "Скачать Markdown" download button
- [ ] Test "Скачать ZIP-архив" download button
- [ ] Verify downloaded files contain correct content
- [ ] Test responsive layout (desktop, tablet, mobile)
- [ ] Verify no console errors

**7c. Accessibility Check**

- [ ] Navigate page using keyboard only (Tab key)
- [ ] Verify focus indicators visible on buttons
- [ ] Test with screen reader (if available)
- [ ] Verify semantic HTML structure

**7d. Performance Check**

- [ ] Page load time <3 seconds (SC-001)
- [ ] Download initiation <2 seconds (SC-002)
- [ ] File sizes <1MB (SC-002 compliance)

---

## Phase 2: Catalog System (Strapi Integration)

### Step 8: Configure Strapi (45 min)

**8a. Create Speckit Content Type in Strapi**

1. Navigate to `http://localhost:1337/admin`
2. Go to Content-Type Builder
3. Create new collection type: "Speckit"
4. Add fields:
   - **Text** field: `title` (Short text, Required)
   - **Text** field: `description` (Long text, Required)
   - **Enumeration** field: `category` (Required)
     - Values: `constitutions`, `templates`, `examples`, `guides`
     - Default: `templates`
   - **Media** field: `file` (Single file, Required, Allowed types: files, documents)
   - **Rich Text** field: `preview_content` (Not required)

5. Save content type

**8b. Configure Permissions**

1. Go to Settings → Users & Permissions Plugin → Roles → Public
2. Find "Speckit" content type
3. Enable:
   - ✅ Find (GET /api/speckits)
   - ✅ FindOne (GET /api/speckits/:id)
4. Save

**8c. Create Sample Data**

1. Go to Content Manager → Speckit
2. Create new entry:
   ```
   Title: "Example Project Constitution"
   Description: "A sample constitution for AI projects"
   Category: "constitutions"
   File: [Upload example-constitution.md]
   Preview Content: "# Example\n\nThis is a sample constitution..."
   ```
3. Save and Publish
4. Create 2-3 more sample entries with different categories

**8d. Generate API Token**

1. Go to Settings → API Tokens
2. Create new token:
   - Name: "Frontend Access"
   - Token duration: Unlimited
   - Token type: Full access
3. Copy token (save to `.env` as `STRAPI_API_TOKEN`)

### Step 9: Create Domain Types (15 min)

**Location**: `frontend/types/speckit.ts`

```typescript
export type SpeckitCategory = 'constitutions' | 'templates' | 'examples' | 'guides'

export interface SpeckitCatalogItem {
  id: string
  title: string
  description: string
  category: SpeckitCategory
  downloadUrl: string
  previewContent?: string
  metadata?: {
    createdAt?: string
    updatedAt?: string
    fileSize?: number
    fileType?: string
  }
}

export const CATEGORY_LABELS: Record<SpeckitCategory, string> = {
  constitutions: 'Конституции',
  templates: 'Шаблоны',
  examples: 'Примеры',
  guides: 'Руководства'
}
```

### Step 10: Create Server Utilities (30 min)

**10a. Strapi Client Utility**

**Location**: `frontend/server/utils/strapi-client.ts`

```typescript
interface FetchFromStrapiOptions {
  query?: Record<string, any>
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
}

export async function fetchFromStrapi(
  endpoint: string,
  event: H3Event,
  options: FetchFromStrapiOptions = {}
): Promise<any> {
  const config = useRuntimeConfig()
  const strapiUrl = config.strapiUrl || 'http://localhost:1337'
  const strapiToken = config.strapiApiToken

  const headers: Record<string, string> = {}

  if (strapiToken) {
    headers['Authorization'] = `Bearer ${strapiToken}`
  }

  try {
    const response = await $fetch(`${strapiUrl}/api${endpoint}`, {
      method: options.method || 'GET',
      headers,
      query: options.query,
      body: options.body
    })

    return response
  } catch (error: any) {
    console.error('[Strapi API Error]', {
      endpoint,
      method: options.method || 'GET',
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
```

**10b. Normalization Utility**

**Location**: `frontend/server/utils/normalizeSpeckitItem.ts`

```typescript
import type { SpeckitCatalogItem } from '~/types/speckit'

export function normalizeSpeckitItem(strapiItem: any): SpeckitCatalogItem {
  const attrs = strapiItem.attributes
  const file = attrs.file?.data?.attributes

  return {
    id: String(strapiItem.id),
    title: attrs.title || '',
    description: attrs.description || '',
    category: attrs.category || 'templates',
    downloadUrl: file?.url || '',
    previewContent: attrs.preview_content || '',
    metadata: {
      createdAt: attrs.createdAt,
      updatedAt: attrs.updatedAt,
      fileSize: file?.size,
      fileType: file?.ext?.replace('.', '') || 'unknown'
    }
  }
}
```

### Step 11: Create Server Routes (20 min)

**11a. Catalog List Route**

**Location**: `frontend/server/api/speckit-catalog.get.ts`

```typescript
import { fetchFromStrapi } from '~/server/utils/strapi-client'
import { normalizeSpeckitItem } from '~/server/utils/normalizeSpeckitItem'

export default defineEventHandler(async (event) => {
  try {
    const response = await fetchFromStrapi('/speckits', event, {
      query: {
        populate: '*',
        sort: 'createdAt:desc'
      }
    })

    return {
      data: response.data.map(normalizeSpeckitItem),
      meta: {
        total: response.meta.pagination.total,
        page: response.meta.pagination.page,
        pageSize: response.meta.pagination.pageSize
      }
    }
  } catch (error: any) {
    console.error('[speckit-catalog]', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Ошибка при загрузке каталога'
    })
  }
})
```

**11b. Detail Route**

**Location**: `frontend/server/api/speckit-detail/[id].get.ts`

```typescript
import { fetchFromStrapi } from '~/server/utils/strapi-client'
import { normalizeSpeckitItem } from '~/server/utils/normalizeSpeckitItem'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Не указан идентификатор элемента'
    })
  }

  try {
    const response = await fetchFromStrapi(`/speckits/${id}`, event, {
      query: {
        populate: '*'
      }
    })

    return {
      data: normalizeSpeckitItem(response.data)
    }
  } catch (error: any) {
    console.error('[speckit-detail]', { id, error })

    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Элемент не найден'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Ошибка при загрузке данных'
    })
  }
})
```

### Step 12: Create Pinia Store (30 min)

**Location**: `frontend/stores/speckitCatalog.ts`

```typescript
import type { SpeckitCatalogItem, SpeckitCategory } from '~/types/speckit'

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

  const availableCategories = computed(() => {
    const uniqueCategories = new Set(items.value.map(item => item.category))
    return Array.from(uniqueCategories)
  })

  const filteredCount = computed(() => filteredItems.value.length)

  // Actions
  async function fetchItems() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch('/api/speckit-catalog')

      if (fetchError.value) {
        throw new Error(fetchError.value)
      }

      items.value = data.value?.data || []
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

  function clearFilters() {
    selectedCategory.value = 'all'
    searchQuery.value = ''
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
    availableCategories,
    filteredCount,
    // Actions
    fetchItems,
    setCategory,
    setSearch,
    clearFilters
  }
})
```

### Step 13: Create Catalog Components (60 min)

**13a. Category Filter Component**

**Location**: `frontend/components/speckit-catalog/category-filter.vue`

```vue
<template>
  <div class="category-filter">
    <v-chip-group v-model="selectedCategory" mandatory>
      <v-chip
        value="all"
        filter
        @click="onCategoryChange('all')"
      >
        Все категории
      </v-chip>
      <v-chip
        v-for="cat in categories"
        :key="cat"
        :value="cat"
        filter
        @click="onCategoryChange(cat)"
      >
        {{ getCategoryLabel(cat) }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script setup lang="ts">
import type { SpeckitCategory } from '~/types/speckit'
import { CATEGORY_LABELS } from '~/types/speckit'

const catalogStore = useSpeckitCatalogStore()
const { availableCategories } = storeToRefs(catalogStore)

const selectedCategory = ref<SpeckitCategory | 'all'>('all')
const categories: SpeckitCategory[] = ['constitutions', 'templates', 'examples', 'guides']

function getCategoryLabel(category: SpeckitCategory): string {
  return CATEGORY_LABELS[category]
}

function onCategoryChange(category: SpeckitCategory | 'all') {
  catalogStore.setCategory(category)
}
</script>

<style scoped>
.category-filter {
  margin-bottom: 1.5rem;
}
</style>
```

**13b. Catalog Card Component**

**Location**: `frontend/components/speckit-catalog/catalog-card.vue`

```vue
<template>
  <v-card
    class="catalog-card"
    elevation="2"
    hover
    @click="navigateToDetail"
  >
    <v-card-item>
      <v-card-title>
        {{ item.title }}
      </v-card-title>
      <v-card-subtitle>
        <v-chip size="x-small" :color="getCategoryColor(item.category)">
          {{ getCategoryLabel(item.category) }}
        </v-chip>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      {{ item.description }}
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn
        color="primary"
        variant="text"
        size="small"
      >
        Подробнее
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { SpeckitCatalogItem } from '~/types/speckit'
import { CATEGORY_LABELS } from '~/types/speckit'

interface Props {
  item: SpeckitCatalogItem
}

const props = defineProps<Props>()

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    constitutions: 'primary',
    templates: 'secondary',
    examples: 'success',
    guides: 'info'
  }
  return colors[category] || 'grey'
}

function navigateToDetail() {
  navigateTo(`/speckit-detail/${props.item.id}`)
}
</script>

<style scoped>
.catalog-card {
  cursor: pointer;
  height: 100%;
}
</style>
```

### Step 14: Create Catalog Page (30 min)

**Location**: `frontend/pages/speckit-catalog.vue`

```vue
<template>
  <v-container class="catalog-page">
    <!-- Page Header -->
    <header class="catalog-header mb-6">
      <h1 class="text-h4 mb-2">Каталог Speckit</h1>
      <p class="text-body-1 text-medium-emphasis">
        Просмотр и загрузка ресурсов для Claude Code
      </p>
    </header>

    <!-- Error Alert -->
    <v-alert
      v-if="catalogStore.error"
      type="error"
      closable
      @click:close="catalogStore.error = null"
      class="mb-4"
    >
      {{ catalogStore.error }}
    </v-alert>

    <!-- Filters -->
    <CategoryFilter class="mb-6" />

    <!-- Loading State -->
    <div v-if="catalogStore.isLoading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4 text-medium-emphasis">Загрузка каталога...</p>
    </div>

    <!-- Catalog Grid -->
    <v-row v-else>
      <v-col
        v-for="item in catalogStore.filteredItems"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
      >
        <CatalogCard :item="item" />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <div
      v-if="!catalogStore.isLoading && catalogStore.filteredCount === 0"
      class="text-center py-12"
    >
      <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
      <p class="mt-4 text-h6 text-grey">
        Нет элементов по выбранному фильтру
      </p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const catalogStore = useSpeckitCatalogStore()

// Fetch items on mount
onMounted(() => {
  catalogStore.fetchItems()
})

// SEO metadata
useHead({
  title: 'Каталог Speckit | Ресурсы для Claude Code',
  meta: [
    {
      name: 'description',
      content: 'Каталог Speckit с конституциями, шаблонами, примерами и руководствами для работы с Claude Code.'
    }
  ]
})
</script>

<style scoped>
.catalog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.catalog-header {
  text-align: center;
}
</style>
```

### Step 15: Create Detail Page (40 min)

**Location**: `frontend/pages/speckit-detail/[id].vue`

```vue
<template>
  <v-container class="detail-page">
    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4 text-medium-emphasis">Загрузка...</p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <!-- Content -->
    <div v-else-if="data">
      <!-- Back Button -->
      <v-btn
        to="/speckit-catalog"
        variant="text"
        class="mb-4"
        prepend-icon="mdi-arrow-left"
      >
        Вернуться в каталог
      </v-btn>

      <!-- Detail Card -->
      <v-card elevation="2">
        <v-card-item>
          <!-- Title -->
          <v-card-title class="text-h4">
            {{ data.title }}
          </v-card-title>

          <!-- Category Badge -->
          <v-card-subtitle>
            <v-chip :color="getCategoryColor(data.category)">
              {{ getCategoryLabel(data.category) }}
            </v-chip>
          </v-card-subtitle>
        </v-card-item>

        <v-divider />

        <v-card-text>
          <!-- Description -->
          <p class="text-body-1 mb-4">{{ data.description }}</p>

          <!-- Preview -->
          <div v-if="data.previewContent" class="preview-section">
            <h3 class="text-h6 mb-2">Предпросмотр</h3>
            <MarkdownRenderer
              :source="data.previewContent"
              class="markdown-body preview-content"
            />
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            :href="data.downloadUrl"
            :download="getFileName(data.downloadUrl)"
            color="primary"
            size="large"
            prepend-icon="mdi-download"
          >
            Скачать
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Metadata -->
      <div v-if="data.metadata" class="metadata mt-4">
        <v-chip size="x-small" class="mr-2">
          Размер: {{ formatFileSize(data.metadata.fileSize) }}
        </v-chip>
        <v-chip size="x-small" class="mr-2">
          Тип: {{ data.metadata.fileType?.toUpperCase() }}
        </v-chip>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import type { SpeckitCatalogItem } from '~/types/speckit'
import { CATEGORY_LABELS } from '~/types/speckit'

const route = useRoute()
const id = route.params.id as string

const { data, error, pending } = await useFetch(`/api/speckit-detail/${id}`, {
  transform: (response) => response.data
})

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    constitutions: 'primary',
    templates: 'secondary',
    examples: 'success',
    guides: 'info'
  }
  return colors[category] || 'grey'
}

function getFileName(url: string): string {
  return url.split('/').pop() || 'download'
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

// SEO metadata
useHead({
  title: data.value ? `${data.value.title} | Speckit` : 'Speckit',
  meta: [
    {
      name: 'description',
      content: data.value?.description || 'Speckit resource'
    }
  ]
})
</script>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.preview-section {
  margin-top: 2rem;
}

.preview-content {
  background-color: rgb(var(--v-theme-background));
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.metadata {
  text-align: center;
}
</style>
```

### Step 16: Add Navigation Links (10 min)

Add catalog link to main navigation:

```vue
<v-btn to="/speckit-catalog" variant="text">
  <v-icon start>mdi-view-grid</v-icon>
  Каталог Speckit
</v-btn>
```

### Step 17: Verify and Test (30 min)

**17a. Test Server Routes**

```bash
# Test catalog API
curl http://localhost:8080/api/speckit-catalog

# Test detail API
curl http://localhost:8080/api/speckit-detail/1
```

**17b. Test Catalog Page**

- [ ] Navigate to `http://localhost:8080/speckit-catalog`
- [ ] Verify page loads and displays items
- [ ] Test category filter chips
- [ ] Click on item to navigate to detail page
- [ ] Verify detail page displays correctly
- [ ] Test download button on detail page
- [ ] Test "Back to Catalog" navigation

**17c. Test Error Handling**

- [ ] Stop Strapi server
- [ ] Navigate to catalog page
- [ ] Verify error message displays
- [ ] Restart Strapi and verify recovery

**17d. Cross-Browser Testing**

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browsers

---

## Final Steps

### Step 18: Commit Changes (15 min)

```bash
cd frontend

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add Speckit constitution page and catalog system

- Add constitution page with static content display
- Add download functionality (MD + ZIP formats)
- Add catalog browser with Strapi CMS integration
- Add category filtering and search
- Add detail pages for catalog items
- Add Pinia store for catalog state management
- Add server routes for Strapi API calls
- Full constitution compliance (Russian UI, English content)

Implements: #001-speckit-constitution
"

# Push to remote (when ready)
git push origin 001-speckit-constitution
```

### Step 19: Create Pull Request (10 min)

1. Go to GitHub/GitLab repository
2. Create pull request from `001-speckit-constitution` to `master`
3. Use template:

```markdown
## Summary

Implements Speckit Constitution download page and catalog browser system.

## Features

- Constitution page with static content display and download (MD + ZIP)
- Catalog browser with Strapi CMS integration
- Category filtering and search functionality
- Detail pages with file previews and downloads
- Full WCAG 2.1 AA accessibility compliance

## Testing

- [x] Manual testing completed
- [x] Cross-browser testing completed
- [x] Accessibility testing completed
- [x] Error handling verified

## Checklist

- [x] Constitution compliance verified
- [x] Russian UI, English content
- [x] Server-side proxy for Strapi calls
- [x] Pinia store for catalog state
- [x] Responsive design verified

## Screenshots

[Add screenshots if applicable]

## Breaking Changes

None. All changes are additive.
```

---

## Troubleshooting

### Issue: Module not found errors

**Solution**: Ensure all dependencies are installed
```bash
cd frontend
yarn install
```

### Issue: Strapi connection refused

**Solution**: Verify Strapi is running and environment variables are set
```bash
# Check Strapi is running
curl http://localhost:1337/api/speckits

# Check .env file
cat frontend/.env | grep STRAPI
```

### Issue: Page not found (404)

**Solution**: Verify Nuxt is running and pages are in correct directory
```bash
# Check pages directory
ls frontend/pages/

# Restart dev server
cd frontend
yarn dev
```

### Issue: Download not working

**Solution**: Verify files exist in public directory
```bash
# Check public/downloads
ls frontend/public/downloads/

# Verify file permissions
chmod 644 frontend/public/downloads/*
```

---

## Additional Resources

- **Constitution**: `.specify/memory/constitution.md`
- **Research**: `specs/001-speckit-constitution/research.md`
- **Data Model**: `specs/001-speckit-constitution/data-model.md`
- **API Contracts**: `specs/001-speckit-constitution/contracts/api-contracts.md`

---

## Success Criteria Verification

Before considering the feature complete, verify all success criteria are met:

- [ ] **SC-001**: Page loads within 3 seconds ✅
- [ ] **SC-002**: Download initiates within 2 seconds ✅
- [ ] **SC-003**: 99%+ download success rate ✅
- [ ] **SC-004**: 90% of users complete "find and download" task on first attempt ✅
- [ ] **SC-005**: Page content readable on all device sizes ✅
- [ ] **SC-006**: Downloaded file contains 100% of content ✅

---

**Implementation Complete!** 🎉

You've successfully implemented the Speckit Constitution page and Catalog browser system. Users can now:
1. View and download the Speckit constitution
2. Browse the catalog of speckit resources
3. Filter by category
4. View detail pages and download files

Ready for production deployment after testing and code review.
