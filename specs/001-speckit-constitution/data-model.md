# Data Model: Speckit Constitution Download Page

**Feature**: 001-speckit-constitution
**Date**: 2026-01-04
**Status**: Phase 1 - Design & Contracts

## Overview

This feature displays static content and provides file downloads. As such, it requires minimal data modeling. The primary "entity" is the constitution content itself, which is stored as a static Markdown file rather than in a database.

---

## Domain Types

### ConstitutionContent

Represents the structure of the Speckit constitution document. Note: This is a conceptual type for documentation purposes. Actual content is stored as raw Markdown and rendered directly.

```typescript
interface ConstitutionContent {
  /** Raw markdown content */
  markdown: string

  /** Content metadata (if needed for future enhancements) */
  metadata?: {
    title: string
    description: string
    lastUpdated: string // ISO date
    version: string
  }
}
```

**Usage**:
```typescript
// composables/useConstitution.ts
import content from '~/public/constitution/speckit-constitution.md?raw'

export const useConstitution = (): ConstitutionContent => {
  return {
    markdown: content,
    metadata: {
      title: 'Speckit Constitution',
      description: 'Best practices for using Speckit with Claude Code',
      lastUpdated: '2026-01-04',
      version: '1.0.0'
    }
  }
}
```

---

## Download Types

### DownloadFormat

Represents the available download formats for the constitution.

```typescript
type DownloadFormat = 'md' | 'zip'

interface DownloadOption {
  /** Format identifier */
  format: DownloadFormat

  /** Human-readable label (Russian) */
  label: string

  /** Download URL path */
  url: string

  /** Download filename */
  filename: string

  /** File MIME type */
  mimeType: string

  /** Estimated file size in bytes */
  sizeBytes: number
}
```

**Usage**:
```typescript
// composables/useConstitution.ts
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
```

---

## Component State

### ConstitutionPageState

Minimal state management needed for this feature. Can be handled entirely within the component using Vue 3 Composition API.

```typescript
interface ConstitutionPageState {
  /** Currently displayed content */
  content: ConstitutionContent

  /** Available download options */
  downloads: DownloadOption[]

  /** Error state (null if no error) */
  error: string | null

  /** Loading state (if async loading in future) */
  isLoading: boolean
}
```

**Usage**:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useConstitution, DOWNLOAD_OPTIONS } from '~/composables/useConstitution'

const content = useConstitution()
const downloads = DOWNLOAD_OPTIONS
const error = ref<string | null>(null)
const isLoading = ref(false)
</script>
```

---

## State Management Decision

### No Pinia Store Required

**Rationale**:
1. **Single Page Feature**: Constitution page is standalone, doesn't share state with other components
2. **Read-Only Content**: No mutations or complex state transitions
3. **Simple Downloads**: Download actions are one-way (no state to track)
4. **Local State Sufficient**: Vue 3 Composition API `ref()` and `computed()` are sufficient

**Future Consideration**: If constitution becomes:
- User-customizable (requires persistence)
- Integrated into other features (shared state)
- Dynamically generated from API (caching, loading states)

Then a Pinia store may be warranted.

---

## File Structure Data

### Static Assets

No database required. All data stored as static files:

```text
frontend/public/
├── constitution/
│   └── speckit-constitution.md          # Source content (displayed & downloaded)
└── downloads/
    └── speckit-constitution.zip         # Pre-built ZIP archive with:
        ├── README.md                     # Quick start guide
        ├── speckit-constitution.md       # Main constitution
        ├── examples/
        │   ├── example-spec.md           # Example specification
        │   ├── example-plan.md           # Example implementation plan
        │   └── custom-constitution-template.md
        └── resources/
            └── speckit-commands.md       # Common commands reference
```

### Content Lifecycle

1. **Authoring**: Content created as Markdown file in `public/constitution/`
2. **Build**: Markdown file copied to `public/downloads/` during build process (if needed)
3. **ZIP Creation**: ZIP archive pre-built and committed to repository (not generated at runtime)
4. **Serving**: Nuxt serves files directly from `public/` directory
5. **Caching**: Browser and PWA service worker cache static files

---

## Validation Rules

### Content Validation (Manual)

Since content is static, validation is manual rather than programmatic:

1. **Markdown Syntax**:
   - Valid Markdown syntax
   - Proper heading hierarchy (h1 > h2 > h3)
   - Code blocks properly fenced
   - Links are valid and accessible

2. **Content Quality**:
   - Clear sections and subsections
   - Practical examples included
   - Actionable best practices
   - Appropriate for Claude Code + Speckit workflows

3. **File Size Constraints**:
   - Markdown file <100 KB (well under 1MB limit)
   - ZIP archive <1 MB (per success criteria SC-002 compliance)

### Download Validation

```typescript
// Runtime validation (optional, for defensive programming)
function validateDownloadOption(option: DownloadOption): boolean {
  return !!(
    option.format &&
    option.label &&
    option.url &&
    option.filename &&
    option.mimeType &&
    option.sizeBytes > 0 &&
    option.sizeBytes < 1_000_000 // <1MB
  )
}
```

---

## Relationships

### Entity Relationship Diagram

```text
┌─────────────────────┐
│ ConstitutionContent │ (static markdown file)
└──────────┬──────────┘
           │
           │ contains
           │
           ▼
┌─────────────────────┐
│  DownloadOption[]   │ (array of download formats)
└─────────────────────┘
           │
           │ includes
           │
           ▼
┌─────────────────────────┐
│  DownloadFormat         │ (enum: 'md' | 'zip')
└─────────────────────────┘
```

**No Relationships to Other Features**:
- Constitution page is standalone
- No data shared with prompts, research, or blog features
- No user-specific data (public access)

---

## Data Flow

### Page Load Flow

```text
1. User navigates to /constitution
   ↓
2. Nuxt serves frontend/pages/constitution.vue
   ↓
3. Component imports constitution content via useConstitution()
   ↓
4. Content rendered using nuxt-markdown-render
   ↓
5. Download buttons displayed from DOWNLOAD_OPTIONS array
```

### Download Flow

```text
1. User clicks download button
   ↓
2. Browser initiates download via direct file link
   ↓
3. Nuxt serves static file from public/downloads/
   ↓
4. Browser saves file to disk
   ↓
5. (Optional) Client-side error handler catches failures
   ↓
6. (Optional) Yandex Metrika tracks download event
```

---

## TypeScript Safety

### Type Exports

```typescript
// types/constitution.ts
export type { ConstitutionContent, DownloadFormat, DownloadOption, ConstitutionPageState }
export { DOWNLOAD_OPTIONS }
```

### Component Usage

```vue
<script setup lang="ts">
import type { DownloadOption } from '~/types/constitution'

const handleDownload = (option: DownloadOption) => {
  // TypeScript knows option.format is 'md' | 'zip'
  // TypeScript knows option.url is a string
  console.log(`Downloading ${option.filename}`)
}
</script>
```

---

---

## Catalog Domain Types

### SpeckitCatalogItem

Represents a catalog item fetched from Strapi CMS and normalized to frontend domain model. This is the primary type used throughout the catalog feature.

```typescript
interface SpeckitCatalogItem {
  /** Unique identifier (from Strapi) */
  id: string

  /** Item title */
  title: string

  /** Item description (brief) */
  description: string

  /** Category for filtering */
  category: SpeckitCategory

  /** Download URL (from Strapi file field) */
  downloadUrl: string

  /** Preview content (markdown excerpt or code) */
  previewContent?: string

  /** Optional metadata */
  metadata?: {
    createdAt?: string  // ISO date
    updatedAt?: string  // ISO date
    fileSize?: number   // bytes
    fileType?: string   // 'md', 'zip', 'txt', etc.
  }
}
```

**Usage**:
```typescript
// server/api/speckit-catalog.get.ts - Normalization
function normalizeSpeckitItem(strapiItem: any): SpeckitCatalogItem {
  const attrs = strapiItem.attributes
  return {
    id: String(strapiItem.id),
    title: attrs.title,
    description: attrs.description,
    category: attrs.category as SpeckitCategory,
    downloadUrl: attrs.file?.data?.attributes?.url || '',
    previewContent: attrs.preview_content,
    metadata: {
      createdAt: attrs.createdAt,
      updatedAt: attrs.updatedAt,
      fileSize: attrs.file?.data?.attributes?.size,
      fileType: attrs.file?.data?.attributes?.ext?.replace('.', '')
    }
  }
}
```

### SpeckitCategory

Enumeration of predefined categories for catalog filtering.

```typescript
type SpeckitCategory = 'constitutions' | 'templates' | 'examples' | 'guides'

// Russian labels for UI display
const CATEGORY_LABELS: Record<SpeckitCategory, string> = {
  constitutions: 'Конституции',
  templates: 'Шаблоны',
  examples: 'Примеры',
  guides: 'Руководства'
}
```

**Usage**:
```typescript
// components/speckit-catalog/category-filter.vue
const categories: SpeckitCategory[] = ['constitutions', 'templates', 'examples', 'guides']

function getCategoryLabel(category: SpeckitCategory): string {
  return CATEGORY_LABELS[category]
}
```

---

## Catalog State Management (Pinia Store)

### SpeckitCatalogStore

Pinia store for managing catalog state across components.

```typescript
// stores/speckitCatalog.ts
interface SpeckitCatalogState {
  /** All catalog items */
  items: SpeckitCatalogItem[]

  /** Currently selected category filter */
  selectedCategory: SpeckitCategory | 'all'

  /** Search query text */
  searchQuery: string

  /** Loading state */
  isLoading: boolean

  /** Error message (null if no error) */
  error: string | null
}

interface SpeckitCatalogGetters {
  /** Items filtered by category and search */
  filteredItems: SpeckitCatalogItem[]

  /** Unique categories available in items */
  availableCategories: SpeckitCategory[]

  /** Count of items matching filters */
  filteredCount: number
}

interface SpeckitCatalogActions {
  /** Fetch catalog items from API */
  fetchItems(): Promise<void>

  /** Set category filter */
  setCategory(category: SpeckitCategory | 'all'): void

  /** Set search query */
  setSearch(query: string): void

  /** Clear all filters */
  clearFilters(): void
}
```

**Implementation**:
```typescript
export const useSpeckitCatalogStore = defineStore('speckitCatalog', (): SpeckitCatalogState & SpeckitCatalogGetters & SpeckitCatalogActions => {
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
      const { data, error: fetchError } = await useSpeckitCatalog()
      if (fetchError.value) {
        throw new Error(fetchError.value)
      }
      items.value = data.value || []
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

---

## State Management Decision

### Hybrid Approach: Local + Pinia

**Constitution Page**: Local Component State
- Single page, standalone
- No state sharing needed
- Read-only content
- Simple downloads

**Catalog System**: Pinia Store
- Multiple components share state (catalog page, filters, search)
- Complex filtering and search logic
- Loading and error states
- Reusable across detail page navigation

**Rationale**:
1. **Appropriate Complexity**: Constitution page is simple, catalog is complex
2. **Clear Separation**: Two different approaches for two different scopes
3. **Future Flexibility**: Catalog can be extended without refactoring constitution page
4. **Best Practices**: Using the right tool for each job

---

## File Structure Data (Updated)

### Static Assets + Strapi CMS

```text
frontend/public/
├── constitution/
│   └── speckit-constitution.md          # Constitution (displayed)
└── downloads/
    ├── speckit-constitution.md          # Constitution MD download
    └── speckit-constitution.zip         # Constitution ZIP download

backend/ (Strapi CMS)
└── api/
    └── speckits/                        # Speckit content type
        ├── CREATE                       # POST /api/speckits
        ├── READ                         # GET /api/speckits, GET /api/speckits/:id
        ├── UPDATE                       # PUT /api/speckits/:id
        └── DELETE                       # DELETE /api/speckits/:id
```

### Content Lifecycle

**Constitution**:
1. **Authoring**: Content created as Markdown file in `public/constitution/`
2. **Build**: ZIP archive pre-built and committed to repository
3. **Serving**: Nuxt serves files directly from `public/` directory
4. **Caching**: Browser and PWA service worker cache static files

**Catalog Items**:
1. **Authoring**: Content created via Strapi Admin Panel
2. **Storage**: Strapi CMS database + file uploads
3. **Fetching**: Nuxt server routes fetch from Strapi API
4. **Normalization**: Server routes normalize to frontend domain types
5. **Serving**: Client renders from normalized data
6. **Caching**: Optional server-side cache (60-second TTL)

---

## Relationships (Updated)

### Entity Relationship Diagram

```text
┌─────────────────────┐
│ ConstitutionContent │ (static markdown file)
└──────────┬──────────┘
           │ contains
           ▼
┌─────────────────────┐
│  DownloadOption[]   │ (array of download formats)
└─────────────────────┘

┌─────────────────────┐
│ SpeckitCatalogItem[]│ (from Strapi CMS)
└──────────┬──────────┘
           │ filtered by
           ▼
┌─────────────────────┐
│ SpeckitCategory     │ (enum: 4 values)
└─────────────────────┘
```

**No Relationships Between Constitution and Catalog**:
- Constitution is static content
- Catalog is dynamic from Strapi
- Separate features, separate concerns

---

## Data Flow (Updated)

### Catalog Page Load Flow

```text
1. User navigates to /speckit-catalog
   ↓
2. Nuxt serves frontend/pages/speckit-catalog.vue
   ↓
3. Component accesses Pinia store (useSpeckitCatalogStore)
   ↓
4. Store calls composable (useSpeckitCatalog)
   ↓
5. Composable calls server route (/api/speckit-catalog)
   ↓
6. Server route fetches from Strapi CMS
   ↓
7. Server route normalizes to domain types
   ↓
8. Normalized data returned to store
   ↓
9. Component renders items from store.filteredItems
```

### Detail Page Flow

```text
1. User clicks catalog item
   ↓
2. Navigate to /speckit-detail/:id
   ↓
3. Detail page composable (useSpeckitDetail) calls server route
   ↓
4. Server route fetches single item from Strapi
   ↓
5. Server route normalizes to domain type
   ↓
6. Detail page renders item with preview and download button
```

---

## TypeScript Safety (Updated)

### Type Exports

```typescript
// types/constitution.ts (existing)
export type { ConstitutionContent, DownloadFormat, DownloadOption }
export { DOWNLOAD_OPTIONS }

// types/speckit.ts (NEW)
export type { SpeckitCatalogItem, SpeckitCategory }
export const CATEGORY_LABELS
```

### Component Usage

```vue
<!-- pages/speckit-catalog.vue -->
<script setup lang="ts">
import type { SpeckitCategory } from '~/types/speckit'

const catalogStore = useSpeckitCatalogStore()
const { filteredItems, availableCategories } = storeToRefs(catalogStore)

function onCategoryChange(category: SpeckitCategory) {
  catalogStore.setCategory(category)
}
</script>
```

---

## Summary

**Data Model Complexity**: Moderate

- **2 Primary Entities**: ConstitutionContent (static), SpeckitCatalogItem (Strapi)
- **2 Supporting Types**: DownloadOption, SpeckitCategory
- **0 Database Tables** (frontend): All constitution data is static files
- **1 Strapi Content Type**: Speckit (managed in backend)
- **1 Pinia Store**: useSpeckitCatalogStore (for catalog state)
- **2 Server Routes**: speckit-catalog.get.ts, speckit-detail/[id].get.ts

**State Management**:
- Constitution: Local component state (simple)
- Catalog: Pinia store (complex, shared state)

**Next Steps**:
- API contracts (server route contracts for Strapi integration)
- Quickstart guide (implementation details for both features)
- Agent context update
