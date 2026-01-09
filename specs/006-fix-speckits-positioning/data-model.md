# Data Model: Fix Speckits Page Positioning Error

**Feature**: 006-fix-speckits-positioning
**Date**: 2026-01-09
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature does not introduce new data models. It uses existing types from the codebase and adds a fallback data constant.

## Existing Types (from `~/types/article.ts`)

### Category

**Purpose**: Represents a category for filtering speckits

**Fields**:
- `id: number` - Unique identifier
- `name: string` - Display name (Russian language)

**Source**: `frontend/types/article.ts:2-5`

**Usage**: Used by `CategoriesFilter.vue` and `MobileCategoriesFilter.vue` components

---

### SpeckitPreview

**Purpose**: Preview data for speckit list items

**Fields**:
- `id: number` - Unique identifier
- `title: string` - Speckit title
- `slug: string` - URL slug for detail page
- `description?: string` - Optional description
- `type: "speckit"` - Discriminator for ArticleBase union
- `categories: Category[]` - Associated categories

**Source**: `frontend/types/article.ts:25-28`

**Usage**: Used in speckits list page

---

## New Constants (to be added)

### Fallback Categories

**Purpose**: Default categories to display when API fails or returns no data

**Location**: `frontend/pages/speckits/index.vue` (inside `<script setup>`)

**Type**: `Category[]`

**Value**:
```typescript
const fallbackCategories: Category[] = [
  { id: 1, name: "Разработка" },        // Development
  { id: 2, name: "Планирование" },      // Planning
  { id: 3, name: "Бизнес" },           // Business
  { id: 4, name: "Образование" },      // Education
  { id: 5, name: "DevOps" }            // DevOps
]
```

**Rationale**:
- Provides consistent category structure when API unavailable
- Matches speckit content domain (development tools, planning workflows)
- Enables filter components to render immediately without layout shift

---

## Data Flow

### Categories Rendering Flow

```
┌─────────────────────────────────────────────────────────────┐
│ speckits/index.vue                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. useAsyncData fetches speckits from /api/speckits        │
│     │                                                         │
│     ├─► SUCCESS with data                                   │
│     │   └─► Extract unique categories from speckit items   │
│     │       └─► CategoriesFilter & MobileCategoriesFilter  │
│     │                                                         │
│     ├─► SUCCESS with empty array                            │
│     │   └─► Use fallbackCategories                         │
│     │       └─► CategoriesFilter & MobileCategoriesFilter  │
│     │                                                         │
│     ├─► ERROR                                               │
│     │   └─► Use fallbackCategories                         │
│     │       └─► CategoriesFilter & MobileCategoriesFilter  │
│     │                                                         │
│     └─► LOADING (initial)                                   │
│         └─► Use fallbackCategories immediately              │
│             └─► CategoriesFilter & MobileCategoriesFilter  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component State Management

**No state changes required**. Components are stateless and purely presentational.

**Props**:
- `categories: Category[]` - Array of categories to render (can be fallback or real data)
- `selectedCategories: number[]` - Array of selected category IDs

**Events**:
- `update:selected-categories` - Emits updated array when user toggles category

---

## Validation Rules

### Category Display Names

- **Required**: Yes (string)
- **Language**: Russian (constitution principle IV)
- **Format**: Plain text, no markdown
- **Max Length**: No enforced limit (typically 1-3 words)

### Category IDs

- **Type**: number
- **Uniqueness**: Required within array
- **Fallback Range**: 1-5 (reserved for fallback categories)

---

## Relationships

```
SpeckitPreview (1) ──┬──> Category (many)
                      │
                      └──> Used by CategoriesFilter (render list)
                          Used by MobileCategoriesFilter (render buttons)
```

---

## Migration Notes

**No database migrations required**. This is a frontend-only change using existing API data.

**No type changes required**. Uses existing `Category` interface.

**New constant addition**: `fallbackCategories` added to speckits page component.

---

## Testing Considerations

### Unit Tests (if added)

- Test `categories` computed returns extracted categories from speckit data
- Test `categories` computed returns fallback when speckits array is empty
- Test `categories` computed returns fallback when speckits have no categories

### Integration Tests

- Verify filters render with fallback data on initial page load
- Verify filters update when API data loads
- Verify no layout shift occurs during data transition

### Visual Regression Tests

- Compare speckits page rendering with homepage (should have similar filter behavior)
- Verify filter component positioning is stable across data states

---

**Status**: ✅ Data model defined. No new types, uses existing `Category` interface.
