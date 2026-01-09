# API Contracts: Fix Speckits Page Positioning Error

**Feature**: 006-fix-speckits-positioning
**Date**: 2026-01-09
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature does not introduce new API endpoints. It uses the existing `/api/speckits` endpoint.

## Existing Endpoint

### GET /api/speckits

**Purpose**: Fetch list of speckit articles with categories

**Route**: `frontend/server/api/speckits.get.ts`

**Method**: GET

**Authentication**: None required (public endpoint)

---

## Request

### Query Parameters

None.

### Headers

Standard HTTP headers only. No custom headers required.

---

## Response

### Success (200 OK)

**Content-Type**: `application/json`

**Body Schema**:
```typescript
{
  data: SpeckitPreview[]
}

interface SpeckitPreview {
  id: number
  title: string
  slug: string
  description?: string
  type: "speckit"
  categories: Category[]
}

interface Category {
  id: number
  name: string
}
```

**Example Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Kestra backend",
      "slug": "kestra-backend",
      "description": "Из идеи ETL-пайплайна до готовой конфигурации...",
      "type": "speckit",
      "categories": [
        {
          "id": 1,
          "name": "Разработка"
        }
      ]
    }
  ]
}
```

---

### Error Responses

#### 500 Internal Server Error

**Body Schema**:
```typescript
{
  statusCode: 500
  message: string
  error: string
}
```

**Example**:
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Failed to fetch speckits"
}
```

**Client Handling**: speckits/index.vue catches errors and displays error banner with retry button

---

## Behavior

### Caching

Uses Nuxt's `useAsyncData` with default caching behavior. Data is cached on the client after first fetch.

### Data Source

Endpoint proxies requests to Strapi CMS backend via `@nuxtjs/strapi` module.

### Empty Data Handling

If Strapi returns no speckits:
- Response: `{ data: [] }`
- Client handling: categories computed property returns fallback categories
- UI: Renders filters with fallback categories, displays empty state message for speckit grid

---

## Client Usage

### In speckits/index.vue

```typescript
const { data: speckits, pending: loading, error, refresh } = await useAsyncData(
  'speckits-list',
  async () => {
    const response = await $fetch('/api/speckits') as any
    return response.data || []
  }
)
```

**Key Points**:
- Auto-imported `$fetch` composable (Nuxt 3)
- Response normalized to extract `data` array
- Error handling via `error` ref
- Loading state via `pending` ref
- Refresh capability via `refresh` function

---

## Modifications for This Feature

**No API modifications required.**

The fix is entirely client-side:
1. Add fallback categories constant in page component
2. Modify `categories` computed to return fallback when API data is empty/unavailable
3. Remove `v-if="categories.length > 0"` conditions from component usage

API endpoint behavior remains unchanged.

---

## Testing

### Manual Testing

1. **Normal Operation**: Verify API returns speckits with categories
2. **Empty Data**: Mock API returning `{ data: [] }`, verify fallback categories used
3. **Error State**: Mock API error, verify error banner appears with retry button
4. **Network Delay**: Verify fallback categories render immediately while API loads

### Integration Testing

No integration test additions required. Existing API contract remains valid.

---

## Related Endpoints

### GET /api/articles

Used by homepage for fetching prompts (not speckits).

**Difference**: Returns `type: "prompt"` items instead of `type: "speckit"`.

**Not used by**: speckits/index.vue

---

**Status**: ✅ API contracts documented. No new endpoints required.
