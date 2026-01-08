# API Contracts: Speckit View Enhancements

**Feature**: Speckit View Enhancements (003-speckit-view-enhancements)
**Date**: 2026-01-08
**Version**: 1.0.0

## Overview

This document defines the API contracts for new and modified endpoints in the Speckit view enhancements feature. All endpoints follow the Server-Side Proxy Architecture principle, with Nuxt server routes acting as a proxy to Strapi CMS.

---

## Base URL

**Development**: `http://localhost:8080/api/speckits`
**Production**: `https://portal.aiworkplace.ru/api/speckits`

---

## Endpoints

### 1. Get Speckit Diagram Data

Fetches Mermaid diagram source code for a specific Speckit.

#### Endpoint

```
GET /api/speckits/{slug}/diagram
```

#### Description

Retrieves the diagram field from the Speckit article in Strapi. If the Speckit has no diagram data, returns `null`. This endpoint is called by the `SpeckitDiagramView` component to render the Mermaid diagram.

#### Request Parameters

| Parameter | Type   | Location | Required | Description                              | Example        |
|-----------|--------|----------|----------|------------------------------------------|----------------|
| slug      | string | path     | Yes      | Speckit slug (URL identifier)            | `test-spec`    |

#### Request Example

```bash
curl -X GET "http://localhost:8080/api/speckits/test-spec/diagram"
```

```typescript
// Frontend composable
const { data, error } = await useFetch(`/api/speckits/${slug}/diagram`)
```

#### Response Format

**Success Response (200 OK)**:

```json
{
  "data": {
    "source": "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action 1]\n  B -->|No| D[Action 2]\n  C --> E[End]\n  D --> E",
    "type": "flowchart",
    "valid": true
  }
}
```

**Empty Diagram (200 OK)**:

```json
{
  "data": null
}
```

**Not Found (404)**:

```json
{
  "statusCode": 404,
  "statusMessage": "Speckit not found",
  "message": "Speckit with slug 'test-spec' does not exist"
}
```

**Server Error (500)**:

```json
{
  "statusCode": 500,
  "statusMessage": "Не удалось загрузить диаграмму. Попробуйте позже.",
  "message": "Internal server error"
}
```

#### Response Fields

| Field          | Type   | Nullable | Description                          |
|----------------|--------|----------|--------------------------------------|
| data.source    | string | No       | Mermaid diagram source code           |
| data.type      | string | Yes      | Diagram type (auto-detected)          |
| data.valid     | boolean | Yes      | Syntax validation flag                |
| data.error     | string | Yes      | Validation error message (if invalid) |

#### Strapi Query

This endpoint queries Strapi with the following parameters:

```typescript
const apiUrl = new URL('/api/articles', strapiUrl)
apiUrl.searchParams.append('filters[slug][$eq]', slug)
apiUrl.searchParams.append('filters[type][$eq]', 'speckit')
apiUrl.searchParams.append('fields[0]', 'diagram')
```

**Strapi Response Structure**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "diagram": "graph TD\n  A[Start] --> B[End]"
      }
    }
  ]
}
```

#### Implementation

**Server Route**: `frontend/server/api/speckits/[slug]/diagram.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  const { slug } = event.context.params || {}

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const strapiUrl = process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'
  const apiUrl = new URL('/api/articles', strapiUrl)

  // Filter by slug and type
  apiUrl.searchParams.append('filters[slug][$eq]', slug)
  apiUrl.searchParams.append('filters[type][$eq]', 'speckit')

  // Populate only diagram field
  apiUrl.searchParams.append('fields[0]', 'diagram')

  try {
    console.log(`[speckits/[slug]/diagram.get] Fetching diagram for slug="${slug}"`)

    const response = await $fetch(apiUrl.toString())

    if (!response.data || response.data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Speckit not found'
      })
    }

    const item = response.data[0]
    const attrs = item.attributes || item
    const diagramSource = attrs.diagram || null

    // Validate and return diagram data
    const diagramData = diagramSource
      ? {
          source: diagramSource,
          type: detectDiagramType(diagramSource),
          valid: true
        }
      : null

    console.log(`[speckits/[slug]/diagram.get] Diagram found:`, !!diagramData)

    return {
      data: diagramData
    }
  } catch (error: any) {
    console.error(`[speckits/[slug]/diagram.get] Error:`, error)

    if (error.statusCode === 404) {
      throw error
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Не удалось загрузить диаграмму. Попробуйте позже.'
    })
  }
})

// Helper function to detect diagram type
function detectDiagramType(source: string): string {
  const firstLine = source.split('\n')[0].trim()
  const type = firstLine.split(/\s+/)[0]

  const validTypes = [
    'graph', 'flowchart', 'sequenceDiagram',
    'classDiagram', 'stateDiagram', 'erDiagram',
    'gantt', 'pie', 'mindmap', 'gitGraph'
  ]

  return validTypes.includes(type) ? type : 'flowchart'
}
```

#### Error Handling

| Error Code | Description                           | User Message (Russian)                |
|------------|---------------------------------------|---------------------------------------|
| 400        | Missing slug parameter                | Не указан идентификатор Speckit       |
| 404        | Speckit not found                     | Speckit не найден                     |
| 500        | Strapi connection error               | Не удалось загрузить диаграмму. Попробуйте позже. |

#### Usage Example

```typescript
// In SpeckitDiagramView.vue component
const props = defineProps<{
  speckitSlug: string
}>()

const { data: diagramData, error, pending } = await useFetch(
  `/api/speckits/${props.speckitSlug}/diagram`,
  {
    transform: (response) => response.data
  }
)

watchEffect(() => {
  if (diagramData.value?.source) {
    renderDiagram(diagramData.value.source)
  }
})
```

---

### 2. Get Speckit Full Details (Modified)

Existing endpoint modified to include diagram field.

#### Endpoint

```
GET /api/speckits/{slug}
```

#### Changes

- **Before**: Returns `SpeckitFull` without diagram field
- **After**: Returns `SpeckitFull` with optional `diagram` field

#### New Response Format

**Success Response (200 OK)**:

```json
{
  "data": {
    "id": "1",
    "title": "Test Speckit",
    "slug": "test-spec",
    "description": "A test speckit",
    "type": "speckit",
    "categories": [
      {
        "id": 1,
        "name": "Automation"
      }
    ],
    "body": "# Test Speckit\n\nThis is a test...",
    "file": {
      "url": "/uploads/test_spec_md.pdf",
      "name": "test-spec.md",
      "size": 12345
    },
    "diagram": "graph TD\n  A[Start] --> B[End]"
  }
}
```

#### Implementation Changes

**Modified File**: `frontend/server/api/speckits/[slug].get.ts`

**Change**: Add `diagram` to populate parameters

```typescript
// BEFORE
apiUrl.searchParams.append('populate', 'categories')
apiUrl.searchParams.append('populate', 'body')
apiUrl.searchParams.append('populate[file]', '*')

// AFTER
apiUrl.searchParams.append('populate', 'categories')
apiUrl.searchParams.append('populate', 'body')
apiUrl.searchParams.append('populate[file]', '*')
apiUrl.searchParams.append('populate', 'diagram')  // NEW
```

**Change**: Add diagram to normalized response

```typescript
// BEFORE
const normalizedData = {
  id: String(item.id),
  title: attrs.title,
  slug: attrs.slug,
  description: attrs.description,
  type: 'speckit',
  categories: categories,
  body: attrs.body || '',
  file: fileInfo
}

// AFTER
const normalizedData = {
  id: String(item.id),
  title: attrs.title,
  slug: attrs.slug,
  description: attrs.description,
  type: 'speckit',
  categories: categories,
  body: attrs.body || '',
  file: fileInfo,
  diagram: attrs.diagram || null  // NEW
}
```

---

### 3. Download Speckit File (Existing)

No changes required. Existing endpoint remains functional.

**Endpoint**: `GET /api/speckits/{slug}/download` (if exists)
**Alternative**: Direct file URL from Strapi (proxied through `useFileDownload` composable)

---

### 4. Get FAQ Data (Static)

FAQ content is served as static JSON file, not API endpoint.

**Endpoint**: `GET /speckit-faq.json`

#### Description

Returns static FAQ content from `frontend/public/speckit-faq.json`. This endpoint is called by the `SpeckitFaqSection` component.

#### Request Example

```bash
curl -X GET "http://localhost:8080/speckit-faq.json"
```

```typescript
// Frontend composable
const response = await fetch('/speckit-faq.json')
const faqData = await response.json()
```

#### Response Format

**Success Response (200 OK)**:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-08",
  "language": "ru",
  "categories": [
    {
      "id": "getting-started",
      "title": "Начало работы",
      "order": 1,
      "questions": [
        {
          "id": "what-is-speckit",
          "question": "Что такое Speckit?",
          "answer": "Speckit - это готовая конфигурация...",
          "order": 1
        }
      ]
    }
  ]
}
```

#### Implementation

**Static File**: `frontend/public/speckit-faq.json`

Served directly by Nuxt static file handler. No server route required.

#### Browser Caching

FAQ file includes version field for cache busting:
```typescript
const response = await fetch(`/speckit-faq.json?v=${faqData.version}`)
```

---

## Error Handling Standards

All endpoints follow consistent error response format:

```json
{
  "statusCode": 400,
  "statusMessage": "Russian error message for user",
  "message": "Detailed error message (optional)",
  "stack": "Error stack trace (development only)"
}
```

### Error Status Codes

| Code | Description                        | Example User Message                          |
|------|------------------------------------|-----------------------------------------------|
| 400  | Bad Request                        | Неверный запрос                               |
| 404  | Not Found                          | Speckit не найден                             |
| 500  | Internal Server Error              | Не удалось загрузить данные. Попробуйте позже. |
| 503  | Service Unavailable                | Сервис временно недоступен. Попробуйте позже.  |

### Error Logging

All server routes log errors with context:

```typescript
console.error(`[endpoint] Error:`, {
  statusCode: error.statusCode,
  message: error.message,
  stack: error.stack,
  context: { /* relevant params */ }
})
```

---

## Rate Limiting

No rate limiting required for these endpoints:
- Diagram data: Read-only, cached by browser
- FAQ data: Static file, cached by CDN
- Speckit details: Existing rate limiting applies (if configured)

---

## Caching Strategy

### Client-Side Caching

**Diagram Data**:
```typescript
// useFetch with automatic caching
const { data } = await useFetch(`/api/speckits/${slug}/diagram`, {
  key: `diagram-${slug}`, // Unique cache key
  getCachedData: (key) => useNuxtData(key).data
})
```

**FAQ Data**:
```typescript
// Static file caching with version
const response = await fetch(`/speckit-faq.json?v=${version}`)
```

### Server-Side Caching

Future enhancement (optional):
```typescript
// Cache diagram data for 5 minutes
const cachedData = await useStorage('cache').getItem(`diagram:${slug}`)
if (cachedData && Date.now() - cachedData.timestamp < 300000) {
  return cachedData.data
}
```

---

## Security Considerations

### Input Validation

- **slug parameter**: Validate format (kebab-case, max 100 chars)
- **XSS prevention**: All text fields escaped before rendering
- **SQL injection**: Not applicable (using ORM/ORM-like queries via Strapi)

### Authentication

No authentication required for public endpoints.

### CORS

CORS handled by Nuxt proxy (no direct Strapi access from client).

---

## OpenAPI Specification

For API documentation tools (Swagger, Postman), here's the OpenAPI 3.0 spec:

```yaml
openapi: 3.0.0
info:
  title: Speckit API
  version: 1.0.0
  description: API for Speckit view enhancements

servers:
  - url: http://localhost:8080/api
    description: Development server
  - url: https://portal.aiworkplace.ru/api
    description: Production server

paths:
  /speckits/{slug}/diagram:
    get:
      summary: Get Speckit diagram data
      tags:
        - Speckits
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
          description: Speckit slug identifier
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/SpeckitDiagramData'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/ServerError'

components:
  schemas:
    SpeckitDiagramData:
      type: object
      properties:
        source:
          type: string
          description: Mermaid diagram source code
        type:
          type: string
          enum: [flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, mindmap]
          description: Diagram type
        valid:
          type: boolean
          description: Syntax validation flag
        error:
          type: string
          description: Validation error message

  responses:
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              statusCode:
                type: integer
                example: 404
              statusMessage:
                type: string
                example: "Speckit not found"

    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            type: object
            properties:
              statusCode:
                type: integer
                example: 500
              statusMessage:
                type: string
                example: "Не удалось загрузить данные. Попробуйте позже."
```

---

## Testing

### Unit Tests (Server Routes)

```typescript
// tests/server/api/speckits/[slug]/diagram.get.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('GET /api/speckits/:slug/diagram', () => {
  it('should return diagram data for valid speckit', async () => {
    const response = await $fetch('/api/speckits/test-spec/diagram')
    expect(response.data).toHaveProperty('source')
    expect(response.data).toHaveProperty('type')
    expect(response.data.valid).toBe(true)
  })

  it('should return null for speckit without diagram', async () => {
    const response = await $fetch('/api/speckits/no-diagram/diagram')
    expect(response.data).toBeNull()
  })

  it('should return 404 for non-existent speckit', async () => {
    await expect(
      $fetch('/api/speckits/non-existent/diagram')
    ).rejects.toThrow('404')
  })
})
```

### Integration Tests (Frontend)

```typescript
// tests/components/speckit/SpeckitDiagramView.spec.ts
import { mount } from '@vue/test-utils'
import SpeckitDiagramView from '~/components/speckit/SpeckitDiagramView.vue'

describe('SpeckitDiagramView', () => {
  it('should render diagram when data is loaded', async () => {
    const wrapper = mount(SpeckitDiagramView, {
      props: {
        diagramSource: 'graph TD\n  A[Start] --> B[End]'
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mermaid').exists()).toBe(true)
  })

  it('should show error message for invalid diagram', async () => {
    const wrapper = mount(SpeckitDiagramView, {
      props: {
        diagramSource: 'invalid syntax here'
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.error-message').exists()).toBe(true)
  })
})
```

---

## Summary

### New Endpoints
- `GET /api/speckits/{slug}/diagram` - Fetch diagram data

### Modified Endpoints
- `GET /api/speckits/{slug}` - Include diagram field

### Static Files
- `GET /speckit-faq.json` - FAQ content (static)

### Next Steps
1. ✅ API contracts documented
2. ⏭️ Generate Quick Start guide
3. ⏭️ Update agent context
