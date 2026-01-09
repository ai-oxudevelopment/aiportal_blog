# Data Model: SSR Data Display Fix

**Feature**: 004-fix-ssr-data-display
**Date**: 2026-01-09

## Overview

This feature fixes SSR data display issues without changing the underlying data model. The problem is in **how data is fetched and processed**, not in the data structure itself. However, we document the existing data structures for clarity and to understand the SSR data flow.

## Key Entities

### Article (PromptPreview)

**Purpose**: Represents an article or prompt in the catalog listing

**Source**: `types/article.ts`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (converted from number to string) |
| `title` | `string` | Yes | Article title |
| `slug` | `string` | Yes | URL-friendly identifier for routing |
| `description` | `string` | No | Short description or summary |
| `type` | `'prompt' \| 'speckit'` | Yes | Content type discriminator |
| `categories` | `Category[]` | No | Associated categories (for filtering) |

**SSR Considerations**:
- Must be serializable for server-to-client transfer
- `id` is stored as string to avoid serialization issues
- `categories` array can be empty, must handle in UI

**Example**:
```typescript
{
  id: "123",
  title: "Pareto Principle Knowledge Accelerator",
  slug: "pareto-principle-knowledge-accelerator",
  description: "You are PARETO-MENTOR...",
  type: "prompt",
  categories: [
    { id: 1, name: "Education" }
  ]
}
```

---

### SpeckitItem

**Purpose**: Speckit-type article (specialized for project configurations)

**Source**: Derived from Article in `pages/speckits/index.vue`

**Fields**: Same as Article, with `type` always `'speckit'`

**SSR Considerations**:
- Used in computed properties for category extraction
- Must be reactive for SSR compatibility

---

### SpeckitFull

**Purpose**: Complete speckit data with body content and file attachments

**Source**: `types/article.ts`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `title` | `string` | Yes | Speckit title |
| `slug` | `string` | Yes | URL-friendly identifier |
| `description` | `string` | No | Short description |
| `type` | `'speckit'` | Yes | Always 'speckit' |
| `categories` | `Category[]` | No | Associated categories |
| `body` | `string` | No | Full content/text body |
| `file` | `FileInfo \| null` | No | Downloadable file attachment |
| `diagram` | `DiagramData \| null` | No | Mermaid diagram configuration |

**SSR Considerations**:
- `body` can be large, still needs to be serialized
- `file` object must be serializable (URL, name, size)
- `diagram` data structure must be plain JavaScript object

---

### Category

**Purpose**: Taxonomy entity for organizing content

**Source**: `types/article.ts`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Unique category identifier |
| `name` | `string` | Yes | Display name |

**SSR Considerations**:
- Simple primitive types, no serialization issues
- Used in computed properties and filters

---

### FileInfo

**Purpose**: File attachment metadata

**Source**: Derived from Strapi response in `server/api/speckits/[slug].get.ts`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | Yes | Download URL (may be relative) |
| `name` | `string` | Yes | File display name |
| `size` | `number` | No | File size in bytes |

**SSR Considerations**:
- URL may be relative, requires prefix logic in components
- Must handle case where `file` is `null`

---

### DiagramData

**Purpose**: Mermaid diagram configuration for speckit visualization

**Source**: `types/article.ts`

**Structure**: Plain JavaScript object with Mermaid diagram syntax

**SSR Considerations**:
- Must be serializable (no functions, classes, etc.)
- Rendered client-side in Mermaid component

---

## State Transitions

### Article Listing State (Home/Speckits Pages)

```
[SSR: Server Fetch]
    ↓
[prompts: Ref<Article[]>] (empty → filled during SSR)
    ↓
[categories: ComputedRef<Category[]>] (derived from prompts)
    ↓
[Client Hydration] (data transferred from server)
    ↓
[User Interaction: Filter/Search]
    ↓
[filteredPrompts: ComputedRef<Article[]>] (reactive updates)
```

**Key SSR Points**:
- `prompts` MUST be filled during SSR (via `useAsyncData`)
- `categories` MUST be computed (not in `onMounted`)
- `filteredPrompts` updates reactively on client

---

### Speckit Detail State

```
[SSR: Server Fetch]
    ↓
[speckit: Ref<SpeckitFull \| null>] (filled via useAsyncData)
    ↓
[Client Hydration] (data transferred from server)
    ↓
[User Interaction: Download/View]
    ↓
[Local component state: downloadLoading, showError, etc.]
```

**Key SSR Points**:
- `speckit` MUST be fetched during SSR (via `useAsyncData`)
- Download state is client-only (doesn't affect SSR)

---

## Data Flow

### Server-Side Rendering Flow

```
1. Nuxt Server receives request
   ↓
2. Page component setup() runs on server
   ↓
3. useAsyncData() fetches from /api/* endpoint
   ↓
4. API endpoint calls Strapi (or cache)
   ↓
5. Data normalized and returned
   ↓
6. Component renders with data
   ↓
7. HTML generated with content
   ↓
8. HTML + data payload sent to client
```

**Critical Requirements**:
- All data fetching MUST use `useAsyncData` or `useFetch`
- Data MUST be serializable (no functions, classes, etc.)
- No `onMounted` for data needed during SSR

---

### Client-Side Hydration Flow

```
1. Browser receives HTML
   ↓
2. Vue app initializes
   ↓
3. Nuxt hydrates with server data
   ↓
4. Client-side state matches server state
   ↓
5. Event listeners attached
   ↓
6. App becomes interactive
```

**Failure Modes**:
- Data mismatch between server/client → hydration error
- Missing data on server → blank HTML
- Non-serializable data → serialization error

---

## Derived Data (Computed Properties)

### Category Extraction (List Pages)

**Input**: `prompts: Ref<Article[]>`

**Output**: `categories: ComputedRef<Category[]>`

**Logic**:
```typescript
const categories = computed(() => {
  if (!prompts.value) return []

  const uniqueCategories = new Map<number, Category>()
  prompts.value.forEach((prompt: Article) => {
    prompt.categories?.forEach((cat: Category) => {
      uniqueCategories.set(cat.id, cat)
    })
  })
  return Array.from(uniqueCategories.values())
})
```

**SSR Safe**: ✅ Yes (computed, reactive)

---

### Filtered Prompts (List Pages)

**Input**: `prompts: Ref<Article[]>`, `selectedCategories: Ref<number[]>`, `searchQuery: Ref<string>`

**Output**: `filteredPrompts: ComputedRef<Article[]>`

**Logic**:
```typescript
const filteredPrompts = computed(() => {
  let filtered = prompts.value || []

  // Filter by categories
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(prompt =>
      prompt.categories?.some(cat =>
        selectedCategories.value.includes(cat.id)
      )
    )
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(prompt =>
      prompt.title.toLowerCase().includes(query) ||
      prompt.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})
```

**SSR Safe**: ✅ Yes (computed, reactive)

**Note**: Initial render shows all items, filtering happens client-side on interaction

---

## Validation Rules

### Input Validation (API Layer)

- `slug` must be non-empty string
- `id` must be positive integer (converted to string for frontend)
- `title` must be non-empty string
- `categories` array can contain 0+ items

### Output Validation (Component Layer)

- Handle `null`/`undefined` data gracefully
- Show loading state while pending
- Show error state on fetch failure
- Show empty state when no results

---

## Serialization Requirements

### Must Be Serializable

✅ All primitive types: string, number, boolean, null
✅ Plain objects with primitive properties
✅ Arrays of serializable items
✅ Nested objects/arrays

### Must NOT Be Serialized

❌ Functions
❌ Classes (instances)
❌ Date objects (use ISO strings)
❌ RegExp
❌ Map/Set (use plain objects/arrays)

**Impact**:
- `onMounted` callbacks cannot transfer data to client
- Composables must return serializable data
- Component refs reset during hydration (use `useAsyncData` instead)

---

## Cache Considerations

### Server-Side Cache

**Location**: `server/utils/cache-wrapper.ts`

**Entries**:
- `articles:list` - Article listings
- `speckits:list` - Speckit listings
- `speckits:slug={slug}` - Individual speckit

**TTL**:
- Fresh: 5 minutes
- Stale: 1 hour

**SSR Impact**:
- Cache shared across SSR requests
- First request may be slow (cache miss)
- Subsequent requests fast (cache hit)

---

## Type Definitions

### Core Types Location

**File**: `frontend/types/article.ts`

```typescript
export interface PromptPreview {
  id: string
  title: string
  slug: string
  description: string
  type: 'prompt'
  categories: Category[]
}

export interface Category {
  id: number
  name: string
}

export interface SpeckitFull {
  id: string
  title: string
  slug: string
  description: string
  type: 'speckit'
  categories: Category[]
  body: string
  file: FileInfo | null
  diagram: DiagramData | null
}

export interface FileInfo {
  url: string
  name: string
  size: number
}

export interface DiagramData {
  // Mermaid diagram syntax (structure varies)
  [key: string]: any
}
```

---

## Migration Notes

**No schema changes required** - this is a bug fix, not a data migration.

**Code Changes Required**:
1. Move data processing from `onMounted` to computed properties
2. Replace `useFetchOneSpeckit` composable with `useAsyncData`
3. Ensure all data fetching uses SSR-aware composables

**Backward Compatibility**: ✅ Full - data structures unchanged
