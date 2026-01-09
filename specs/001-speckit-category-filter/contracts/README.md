# API Contracts: Speckit Category Filter Display

**Feature**: 001-speckit-category-filter
**Date**: 2026-01-10

## Overview

This feature does not require new API contracts. It reuses the existing `/api/speckits` endpoint and modifies client-side logic.

## Existing API

### GET /api/speckits

Fetches all speckits with their associated categories.

**Request**:
- Method: `GET`
- Headers: None (public endpoint)
- Query Params: None

**Response**:
```json
{
  "data": [
    {
      "id": "123",
      "title": "Example Speckit",
      "slug": "example-speckit",
      "description": "An example speckit description",
      "type": "speckit",
      "categories": [
        {
          "id": 1,
          "name": "Конституция",
          "type": "speckit"
        },
        {
          "id": 2,
          "name": "Планирование",
          "type": "speckit"
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "total": 1
    }
  }
}
```

**Notes**:
- Categories are already populated via Strapi's `populate` parameter
- The `type` field on categories should be present and set to "speckit"
- If categories are missing, the array will be empty `[]`

## Modifications Required

### Server Route: `/api/speckits`

**File**: `frontend/server/api/speckits.get.ts`

**Change**: Ensure category normalization includes the `type` field.

**Current normalization** (lines 62-66):
```typescript
const categoriesData = attrs.categories?.data || attrs.categories || []
const categories = categoriesData.map((cat: any) => ({
  id: cat.id,
  name: cat.attributes?.name || cat.name
}))
```

**Required update**:
```typescript
const categoriesData = attrs.categories?.data || attrs.categories || []
const categories = categoriesData.map((cat: any) => ({
  id: cat.id,
  name: cat.attributes?.name || cat.name,
  type: cat.attributes?.type || cat.type || 'speckit' // Default to 'speckit' for backward compatibility
}))
```

## No New Endpoints

This feature does not introduce any new API endpoints. All filtering happens client-side using Vue computed properties.
