# Data Model: Speckit Category Filter Display

**Feature**: 001-speckit-category-filter
**Date**: 2026-01-10
**Status**: Draft

## Overview

This document defines the domain entities for the speckit category filter feature. The data model extends the existing types defined in `~/types/article.ts` with clarification on the Category type attribute.

## Domain Entities

### Category

Represents a classification label that can be assigned to speckits for organization and filtering.

**Attributes**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Unique identifier for the category |
| `name` | `string` | Yes | Human-readable display name (Russian language) |
| `type` | `"prompt" \| "speckit"` | Yes | Distinguishes categories: "prompt" for articles page, "speckit" for speckits page |

**Validation Rules**:
- `id` must be a positive integer
- `name` must not be empty
- `type` must be either "prompt" or "speckit"
- Categories with `type !== "speckit"` are excluded from speckits page filter

**TypeScript Interface**:
```typescript
interface Category {
  id: number
  name: string
  type: 'prompt' | 'speckit'
}
```

### SpeckitPreview

Represents a speckit (AI configuration template) in the list view.

**Attributes**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (stringified number) |
| `title` | `string` | Yes | Speckit title |
| `slug` | `string` | Yes | URL-friendly identifier for routing |
| `description` | `string` | No | Short description or excerpt |
| `type` | `"speckit"` | Yes | Content type discriminator |
| `categories` | `Category[]` | No | Array of categories assigned to this speckit |

**Relationships**:
- A Speckit has zero or more Categories (many-to-many)
- A Category can be assigned to zero or more Speckits

**TypeScript Interface**:
```typescript
interface SpeckitPreview {
  id: string
  title: string
  slug: string
  description?: string
  type: 'speckit'
  categories: Category[]
}
```

### CategoryFilterState

Represents the current state of category selection on the speckits page.

**Attributes**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `selectedCategoryIds` | `number[]` | Yes | Array of selected category IDs (empty = show all) |
| `searchQuery` | `string` | Yes | Current search text (empty = no search) |

**Behavior**:
- When `selectedCategoryIds` is empty, all speckits are displayed
- When `selectedCategoryIds` has values, speckits matching ANY selected category are shown (OR logic)
- `searchQuery` filters by title/description in addition to category filtering

**TypeScript Interface**:
```typescript
interface CategoryFilterState {
  selectedCategoryIds: number[]
  searchQuery: string
}
```

## Entity Relationships

```
┌─────────────┐         ┌──────────────┐
│  Speckit    │         │   Category   │
├─────────────┤         ├──────────────┤
│ id          │──┐      │ id           │
│ title       │  │      │ name         │
│ slug        │  │      │ type         │
│ description │  └─────┴│              │
│ type        │         │              │
│ categories  │────────▶│              │
└─────────────┘         └──────────────┘

┌─────────────────────┐
│ CategoryFilterState │
├─────────────────────┤
│ selectedCategoryIds │─────┐ (references Category.id)
│ searchQuery         │     │
└─────────────────────┘     │
                              │
                              ▼
                    (filters Speckit by categories)
```

## State Transitions

### Category Selection

```
Initial State (no categories selected)
    │
    │ User clicks category checkbox
    ▼
One Category Selected
    │
    │ User clicks another category checkbox
    ▼
Multiple Categories Selected (OR logic)
    │
    │ User deselects all categories
    ▼
Back to Initial State
```

### Filtering Logic

```
1. Start with all speckits
2. If selectedCategoryIds.length > 0:
   - Filter: speckit.categories.some(cat => selectedCategoryIds.includes(cat.id))
3. If searchQuery is not empty:
   - Filter: title.toLowerCase().includes(searchQuery) OR
             description?.toLowerCase().includes(searchQuery)
4. Combine both filters with AND logic
```

## Data Flow

```
Strapi CMS (raw data)
    │
    │ GET /api/speckits?populate=categories
    ▼
Server Route (/api/speckits)
    │
    │ Normalize response:
    │ - Extract categories.data → categories
    │ - Map category attributes → Category interface
    │ - Filter categories by type="speckit" if needed
    ▼
SpeckitPreview[] (normalized domain model)
    │
    │ useAsyncData('speckits-list')
    ▼
Client Component (speckits/index.vue)
    │
    │ Computed: extract unique categories
    │ - Filter by type="speckit"
    │ - Build Map<id, Category> for deduplication
    ▼
Category[] (displayed in filter UI)
    │
    │ User selects categories
    ▼
CategoryFilterState (updated reactively)
    │
    │ Computed: filter speckits by selected IDs
    ▼
SpeckitPreview[] (filtered results)
```

## Edge Cases & Validation

### Missing Categories

**Scenario**: Speckit has no categories assigned
**Handling**: Display in "All" view, excluded when any category is selected
**Validation**: `categories` field is optional, default to empty array

### Wrong Category Type

**Scenario**: Category has `type="prompt"` instead of `type="speckit"`
**Handling**: Exclude from category filter list entirely
**Validation**: Filter in computed property: `cat.type === 'speckit'`

### Missing Type Attribute

**Scenario**: Category object missing `type` field
**Handling**: Exclude from category filter list, log warning
**Validation**: Defensive check with optional chaining, filter out invalid categories

### Empty Category List

**Scenario**: No categories with `type="speckit"` exist
**Handling**: Display empty state message, hide filter UI
**Validation**: Check `categories.length === 0` and show appropriate message

### Malformed Category Data

**Scenario**: Category missing required fields (id, name)
**Handling**: Exclude from display, log error for debugging
**Validation**: Validate structure in normalization layer

## Type Definitions

### File: `frontend/types/article.ts`

This file already contains the Category type. It may need to be updated to include the `type` attribute if not already present.

**Current State** (to be verified):
```typescript
interface Category {
  id: number
  name: string
  // Add: type?: 'prompt' | 'speckit'
}
```

**Required Update**:
```typescript
interface Category {
  id: number
  name: string
  type: 'prompt' | 'speckit'
}
```

## Indexing & Performance Considerations

### Client-Side Filtering

- **Complexity**: O(n × m) where n = number of speckits, m = average categories per speckit
- **Optimization**: Vue computed properties cache results, only recompute when dependencies change
- **Scale**: Efficient for <1000 speckits with <10 categories each

### Category Extraction

- **Complexity**: O(n × m) for extracting unique categories
- **Optimization**: Use Map for O(1) deduplication by category ID
- **Caching**: Computed property caches result until speckits data changes

### Memory Usage

- **Minimal**: Category objects are small (~50 bytes each)
- **Shared**: Same Category objects referenced by multiple speckits
- **Cleanup**: Vue automatically cleans up computed properties when component unmounts

## Migration Notes

### From Existing Implementation

The existing `speckits/index.vue` already has:
- ✅ `categories` computed property (needs type filtering added)
- ✅ `filteredSpeckits` computed property (already works correctly)
- ✅ Filter components imported and rendered
- ✅ Conditional rendering with `v-if="categories.length > 0"`

**Required Changes**:
1. Add `type` field to Category interface in `types/article.ts`
2. Update `categories` computed property to filter by `type="speckit"`
3. Ensure server route normalizes category `type` field correctly

### Backward Compatibility

- If `type` field is missing from existing categories, they will be excluded from display
- This is intentional: categories without `type="speckit"` should not appear on speckits page
- Consider a data migration in Strapi to ensure all categories have the correct `type` value
