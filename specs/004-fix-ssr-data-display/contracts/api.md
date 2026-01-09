# API Contracts: SSR Data Display Fix

**Feature**: 004-fix-ssr-data-display
**Date**: 2026-01-09

## Overview

This feature fixes SSR data display issues **without changing API contracts**. The existing API endpoints remain unchanged. This document describes the contracts that must be maintained for SSR compatibility.

**Note**: This is a **bug fix**, not a new feature. All API endpoints already exist and must continue working as documented.

---

## Existing API Contracts

### GET /api/articles

**Purpose**: Fetch all articles (prompts and speckits)

**Implementation**: `server/api/articles.get.ts`

**Request**:

```http
GET /api/articles HTTP/1.1
```

**Query Parameters** (optional):
- None currently supported

**Response**:

```typescript
{
  data: Article[]
}
```

**Response Example**:

```json
{
  "data": [
    {
      "id": "1",
      "title": "Pareto Principle Knowledge Accelerator",
      "slug": "pareto-principle-knowledge-accelerator",
      "description": "You are PARETO-MENTOR...",
      "type": "prompt",
      "categories": [
        { "id": 1, "name": "Education" }
      ]
    }
  ]
}
```

**Caching**: Stale-while-revalidate (5min fresh, 1hr stale)

**SSR Requirements**:
- ✅ Must return data synchronously during SSR
- ✅ Response must be serializable
- ✅ Used by `useAsyncData` in `pages/index.vue`

---

### GET /api/speckits

**Purpose**: Fetch all speckit-type articles

**Implementation**: `server/api/speckits.get.ts`

**Request**:

```http
GET /api/speckits HTTP/1.1
```

**Response**:

```typescript
{
  data: SpeckitItem[]
}
```

**Response Example**:

```json
{
  "data": [
    {
      "id": "1",
      "title": "Project Constitution Template",
      "slug": "project-constitution-template",
      "description": "Complete project setup guide...",
      "type": "speckit",
      "categories": [
        { "id": 2, "name": "Development" }
      ]
    }
  ]
}
```

**Caching**: Stale-while-revalidate (5min fresh, 1hr stale)

**SSR Requirements**:
- ✅ Must return data synchronously during SSR
- ✅ Response must be serializable
- ✅ Used by `useAsyncData` in `pages/speckits/index.vue`

---

### GET /api/speckits/{slug}

**Purpose**: Fetch a single speckit by slug with full content

**Implementation**: `server/api/speckits/[slug].get.ts`

**Request**:

```http
GET /api/speckits/project-constitution-template HTTP/1.1
```

**Path Parameters**:
- `slug` (string, required): Speckit slug identifier

**Success Response** (200 OK):

```typescript
{
  data: SpeckitFull
}
```

**Response Example**:

```json
{
  "data": {
    "id": "1",
    "title": "Project Constitution Template",
    "slug": "project-constitution-template",
    "description": "Complete project setup guide...",
    "type": "speckit",
    "categories": [
      { "id": 2, "name": "Development" }
    ],
    "body": "# Project Constitution\n\nThis is a template...",
    "file": {
      "url": "/uploads/project_constitution.md",
      "name": "project_constitution.md",
      "size": 12345
    },
    "diagram": {
      "graph": "TD\nA[Start] --> B[End]"
    }
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "statusCode": 404,
  "statusMessage": "Speckit not found"
}
```

**SSR Requirements**:
- ✅ Must return data synchronously during SSR
- ✅ Response must be serializable (including nested file/diagram objects)
- ✅ Must be used with `useAsyncData` in `pages/speckits/[speckitSlug].vue`

---

## Component-Level Contracts

### useAsyncData Usage

**Contract**: Components MUST use `useAsyncData` for SSR-compatible data fetching

**Pattern**:

```vue
<script setup lang="ts">
// ✅ CORRECT: SSR-compatible
const { data, pending, error } = await useAsyncData(
  'unique-key',
  async () => {
    const response = await $fetch('/api/endpoint')
    return response.data
  }
)

// ❌ INCORRECT: Not SSR-compatible
const { data } = await $fetch('/api/endpoint')
</script>
```

**Requirements**:
- First argument: unique key (string)
- Second argument: async fetcher function
- Must be top-level `await` in `<script setup>`
- Return value must be serializable

---

### Computed Properties for Derived Data

**Contract**: Derived data MUST use computed properties (not `onMounted`)

**Pattern**:

```vue
<script setup lang="ts">
// ✅ CORRECT: SSR-compatible
const { data: prompts } = await useAsyncData('articles', fetchArticles)

const categories = computed(() => {
  if (!prompts.value) return []
  // Extract categories...
  return extractedCategories
})

// ❌ INCORRECT: Not SSR-compatible
const categories = ref([])
onMounted(() => {
  // This only runs on client!
  categories.value = extractCategories(prompts.value)
})
</script>
```

---

## Error Handling Contracts

### API Error Responses

**All API endpoints MUST**:

1. **Log errors** to console for debugging
2. **Return appropriate HTTP status codes** (400, 404, 500, etc.)
3. **Include human-readable error messages** (Russian locale)
4. **Handle Strapi failures gracefully** with fallback data

**Pattern**:

```typescript
export default defineEventHandler(async (event) => {
  try {
    const data = await fetchData()
    return { data }
  } catch (error: any) {
    console.error('[endpoint] Error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Не удалось загрузить данные. Попробуйте позже.'
    })
  }
})
```

---

### Component Error Display

**Components MUST**:

1. **Show loading state** while fetching
2. **Show error message** on fetch failure
3. **Show empty state** when no results
4. **Show content** when data available

**Pattern**:

```vue
<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else-if="!data || data.length === 0">No items found</div>
  <div v-else>
    <!-- Render content -->
  </div>
</template>
```

---

## SSR Data Serialization Contract

### Serializable Data Requirements

**All data transferred from server to client MUST be**:

✅ Primitives: `string`, `number`, `boolean`, `null`
✅ Plain objects (no classes)
✅ Arrays of serializable items
✅ Nested structures of the above

**MUST NOT include**:

❌ Functions
❌ Class instances
❌ Date objects (use ISO strings: `2026-01-09T12:00:00Z`)
❌ RegExp objects
❌ Map/Set (use plain objects/arrays)

**Verification**:

```typescript
// Test serialization
const test = (data: any) => {
  try {
    JSON.stringify(data)
    return true // ✅ Serializable
  } catch {
    return false // ❌ Not serializable
  }
}
```

---

## Performance Contracts

### Response Time Requirements

**API Endpoints**:

- **Cold cache**: < 2000ms (Strapi fetch)
- **Warm cache**: < 50ms (in-memory cache)
- **Stale cache**: < 100ms (stale + background refresh)

**SSR Rendering**:

- **Total TTFB**: < 2000ms (including API fetch)
- **HTML generation**: < 100ms (Vue render)

---

## Caching Strategy

### Cache Headers

**API endpoints include cache metadata**:

```http
X-Content-Stale: true  (if serving stale content)
```

**Cache Keys**:

- `articles:list` - Article listings
- `speckits:list` - Speckit listings
- `speckits:slug={slug}` - Individual speckit

**Cache Behavior**:

- Fresh (0-5 min): Serve immediately, no refresh
- Stale (5-60 min): Serve immediately, background refresh
- Expired (>60 min): Fetch fresh, block response

---

## Versioning

**API Version**: Implicit v1 (no versioning in URLs)

**Breaking Changes**: None in this feature (bug fix only)

**Backward Compatibility**: ✅ Fully maintained

---

## Testing Requirements

### SSR Testing

**Must verify**:

1. ✅ Page source HTML contains actual content (not loading spinners)
2. ✅ No hydration warnings in console
3. ✅ Content visible immediately (no flash)
4. ✅ Direct URL access works (not just navigation)

**Test Command**:

```bash
# Start SSR server
cd frontend && npm run dev

# Test pages
curl -s http://localhost:3000/ | grep -o "<title>.*</title>"
curl -s http://localhost:3000/speckits | grep -o "<h1>.*</h1>"
curl -s http://localhost:3000/speckits/spec-1 | grep -o "<h1>.*</h1>"
```

### Console Testing

**Must verify**:

1. ✅ No JavaScript errors
2. ✅ No Vue hydration warnings
3. ✅ No "undefined" access errors
4. ✅ Clean console during navigation

---

## Security Considerations

### Input Validation

**API endpoints MUST validate**:

- Path parameters (e.g., `slug` is non-empty string)
- Query parameters (if supported)
- Type checking before processing

### Error Messages

**Error messages MUST**:

- Be user-friendly (Russian locale)
- Not expose internal implementation details
- Not leak sensitive data (URLs, tokens, etc.)

---

## Dependencies

### Internal Dependencies

- `server/utils/cache-wrapper.ts` - Caching layer
- `server/utils/cache-control.ts` - Cache key generation
- `@nuxtjs/strapi` - Strapi integration

### External Dependencies

- Strapi v5 CMS
- Nuxt 3.2.0
- Vue 3.4.21

---

## Migration Notes

**No API changes required** - this is a bug fix in component logic only.

**Contract Compliance**: All existing contracts remain unchanged.

**Breaking Changes**: None
