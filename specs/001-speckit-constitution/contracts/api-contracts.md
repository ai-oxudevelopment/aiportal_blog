# API Contracts: Speckit Constitution Download Page

**Feature**: 001-speckit-constitution
**Date**: 2026-01-04
**Status**: Phase 1 - Design & Contracts

## Overview

This feature uses a hybrid approach:
- **Constitution page**: Static file serving (no server routes required)
- **Catalog/Detail pages**: Strapi CMS integration via Nuxt server routes

This document specifies the server route contracts for catalog functionality and static file endpoints.

---

## Static File Endpoints (Constitution)

No server routes required. Files served directly from `public/` directory.

| Method | Endpoint | Response Type | Description |
|--------|----------|---------------|-------------|
| GET | `/constitution/speckit-constitution.md` | `text/markdown` | Constitution content (for display) |
| GET | `/downloads/speckit-constitution.md` | `text/markdown` | Markdown file download |
| GET | `/downloads/speckit-constitution.zip` | `application/zip` | ZIP archive download |

**Note**: These are static file URLs handled automatically by Nuxt's static file serving. No server route implementation needed.

---

## Server-Side API Contracts (Catalog)

### GET /api/speckit-catalog

Fetches all catalog items from Strapi CMS.

**Request**:
```http
GET /api/speckit-catalog HTTP/1.1
```

**Query Parameters**: None

**Response** (Success - 200):
```json
{
  "data": [
    {
      "id": "1",
      "title": "Example Speckit Constitution",
      "description": "A sample constitution for AI agent development",
      "category": "constitutions",
      "downloadUrl": "http://localhost:1337/uploads/example_constitution.md",
      "previewContent": "# Example Constitution\n\nThis is a sample...",
      "metadata": {
        "createdAt": "2026-01-04T10:00:00.000Z",
        "updatedAt": "2026-01-04T10:00:00.000Z",
        "fileSize": 15360,
        "fileType": "md"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 25
  }
}
```

**Response** (Error - 500):
```json
{
  "statusCode": 500,
  "statusMessage": "Ошибка при загрузке данных с сервера"
}
```

**Implementation Contract**:
```typescript
// server/api/speckit-catalog.get.ts
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
      statusMessage: 'Ошибка при загрузке данных с сервера'
    })
  }
})
```

**Error Handling**:
- Strapi connection failure → 500 with Russian error message
- Strapi API error (4xx/5xx) → Forward status code with Russian message
- Timeout → 500 with timeout message
- Log all errors with context (endpoint, status, timestamp)

---

### GET /api/speckit-detail/:id

Fetches a single catalog item from Strapi CMS by ID.

**Request**:
```http
GET /api/speckit-detail/1 HTTP/1.1
```

**Path Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Strapi item ID |

**Response** (Success - 200):
```json
{
  "data": {
    "id": "1",
    "title": "Example Speckit Constitution",
    "description": "A sample constitution for AI agent development",
    "category": "constitutions",
    "downloadUrl": "http://localhost:1337/uploads/example_constitution.md",
    "previewContent": "# Example Constitution\n\nThis is a sample...",
    "metadata": {
      "createdAt": "2026-01-04T10:00:00.000Z",
      "updatedAt": "2026-01-04T10:00:00.000Z",
      "fileSize": 15360,
      "fileType": "md"
    }
  }
}
```

**Response** (Error - 404):
```json
{
  "statusCode": 404,
  "statusMessage": "Элемент не найден"
}
```

**Response** (Error - 500):
```json
{
  "statusCode": 500,
  "statusMessage": "Ошибка при загрузке данных с сервера"
}
```

**Implementation Contract**:
```typescript
// server/api/speckit-detail/[id].get.ts
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
      statusMessage: 'Ошибка при загрузке данных с сервера'
    })
  }
})
```

**Error Handling**:
- Missing ID parameter → 400 with Russian error message
- Item not found in Strapi (404) → 404 with "Элемент не найден"
- Strapi connection failure → 500 with Russian error message
- Log all errors with context (id, endpoint, status, timestamp)

---

## Shared Utilities

### fetchFromStrapi

Shared utility for making authenticated requests to Strapi API.

```typescript
// server/utils/strapi-client.ts
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

### normalizeSpeckitItem

Normalization function to convert Strapi response to frontend domain model.

```typescript
// server/utils/normalizeSpeckitItem.ts
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

---

## Environment Variables

### Required Variables

```bash
# Strapi CMS Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token-here

# Nuxt Application
PORT=8080
```

### Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
    strapiApiToken: process.env.STRAPI_API_TOKEN,
    port: process.env.PORT || 8080
  }
})
```

**Security Note**:
- `strapiApiToken` is NOT available on client (server-only)
- Client components never access Strapi directly
- All Strapi communication happens via server routes

---

## Composable Contracts

### useSpeckitCatalog

Client-side composable for fetching catalog data.

**Location**: `composables/useSpeckitCatalog.ts`

**Signature**:
```typescript
function useSpeckitCatalog(): {
  data: Ref<SpeckitCatalogItem[] | null>
  error: Ref<string | null>
  pending: Ref<boolean>
  refresh: () => Promise<void>
}
```

**Implementation**:
```typescript
export const useSpeckitCatalog = () => {
  return useFetch('/api/speckit-catalog', {
    transform: (response) => response.data,
    key: 'speckit-catalog'
  })
}
```

**Usage**:
```vue
<script setup lang="ts">
const { data, error, pending } = await useSpeckitCatalog()
</script>
```

### useSpeckitDetail

Client-side composable for fetching single catalog item.

**Location**: `composables/useSpeckitDetail.ts`

**Signature**:
```typescript
function useSpeckitDetail(id: string): {
  data: Ref<SpeckitCatalogItem | null>
  error: Ref<string | null>
  pending: Ref<boolean>
  refresh: () => Promise<void>
}
```

**Implementation**:
```typescript
export const useSpeckitDetail = (id: string) => {
  return useFetch(`/api/speckit-detail/${id}`, {
    transform: (response) => response.data,
    key: `speckit-detail-${id}`
  })
}
```

**Usage**:
```vue
<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string
const { data, error, pending } = await useSpeckitDetail(id)
</script>
```

---

## Strapi Content Type Definition

### Speckit Content Type

**Fields**:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| title | Text | Yes | Item title |
| description | Text | Yes | Brief description |
| category | Enumeration | Yes | One of: constitutions, templates, examples, guides |
| file | Media (Single) | Yes | Downloadable file |
| preview_content | Rich Text/Markdown | No | Preview content for display |

**Strapi Schema**:
```json
{
  "kind": "collectionType",
  "collectionName": "speckits",
  "info": {
    "singularName": "speckit",
    "pluralName": "speckits",
    "displayName": "Speckit",
    "description": "Speckit catalog items"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text",
      "required": true
    },
    "category": {
      "type": "enumeration",
      "enum": ["constitutions", "templates", "examples", "guides"],
      "required": true,
      "default": "templates"
    },
    "file": {
      "type": "media",
      "multiple": false,
      "required": true,
      "allowedTypes": ["files", "documents"]
    },
    "preview_content": {
      "type": "richtext",
      "required": false
    }
  }
}
```

**Permissions** (Public API):
- Find: ✅ Public (GET /api/speckits)
- FindOne: ✅ Public (GET /api/speckits/:id)
- Create: ❌ Auth required
- Update: ❌ Auth required
- Delete: ❌ Auth required

---

## Testing Contracts

### Manual Testing Scenarios

**1. Catalog API Test**:
```bash
# Test fetching all items
curl http://localhost:8080/api/speckit-catalog

# Expected: JSON array with all catalog items
```

**2. Detail API Test**:
```bash
# Test fetching single item
curl http://localhost:8080/api/speckit-detail/1

# Expected: JSON object with single item
# Test 404
curl http://localhost:8080/api/speckit-detail/99999

# Expected: 404 error with Russian message
```

**3. Static File Test**:
```bash
# Test constitution display
curl http://localhost:8080/constitution/speckit-constitution.md

# Expected: Markdown content

# Test download
curl -O http://localhost:8080/downloads/speckit-constitution.md

# Expected: File downloaded
```

**4. Error Handling Test**:
```bash
# Test with Strapi stopped
curl http://localhost:8080/api/speckit-catalog

# Expected: 500 error with Russian message

# Check server logs for error details
```

---

## Performance Considerations

### Caching Strategy

**Server-Side Caching** (Optional):
```typescript
// server/api/speckit-catalog.get.ts
const cache = await useCache('speckit-catalog')

if (cache.data) {
  return cache.data
}

const response = await fetchFromStrapi('/speckits', event, { ... })
await cache.set(response, { maxAge: 60 }) // 60 seconds

return response
```

**Client-Side Caching**:
- `useFetch` automatically caches responses with key
- Nuxt handles cache invalidation on navigation
- Set appropriate `key` in composables for cache busting

### Response Size Optimization

- Strapi `populate: '*'` may return more data than needed
- Consider selective populate: `populate: [file, preview_content]`
- Monitor response sizes and adjust if needed
- Target: <100KB per catalog response

---

## Summary

**API Contracts**:
- Static file serving (constitution): 3 endpoints (no server routes)
- Server routes (catalog): 2 endpoints (speckit-catalog, speckit-detail)
- Shared utilities: fetchFromStrapi, normalizeSpeckitItem
- Client composables: useSpeckitCatalog, useSpeckitDetail

**Strapi Integration**:
- Content type: Speckit (5 fields)
- Public permissions: Find, FindOne
- Server-side token: Runtime config (not exposed to client)

**Error Handling**:
- All errors return Russian error messages
- Server routes log errors with context
- Client displays user-friendly alerts

**Next Steps**:
- Quickstart guide (implementation details)
- Agent context update
