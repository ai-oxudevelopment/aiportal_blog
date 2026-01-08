# API Contracts: Speckit UI Enhancements

**Feature**: 002-speckit-ui
**Phase**: 1 - Design & Contracts
**Date**: 2026-01-04

## Overview

This feature does not introduce new API contracts. It is a frontend-only UI enhancement that reuses existing server routes and data structures.

## Existing API Contracts Used

### GET /api/speckits/{slug}

**Source**: `frontend/server/api/speckits/[slug].get.ts` (existing)

**Description**: Fetches a single speckit by slug with all associated data (body, file, categories).

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Speckit identifier from URL path |

**Response Structure**:

```typescript
interface SpeckitResponse {
  data: {
    id: string
    title: string
    slug: string
    description: string
    type: "speckit"
    categories: Category[]
    body: string
    file: SpeckitFile | null
  }
}
```

**Response Codes**:
- `200` - Success
- `404` - Speckit not found
- `400` - Bad request (fallback to alternative query)
- `500` - Server error

**Behavior**:
- Filters by `slug` and `type="speckit"`
- Populates `categories`, `body`, `file` (with fallback if fields don't exist)
- Returns 404 if no matching speckit found

---

## External API Calls

### File Download

**Description**: Downloads speckit configuration file from Strapi or external URL.

**Implementation**: Client-side using `useFileDownload` composable.

**Request**:

```typescript
// Direct browser download (not proxied through Nuxt server)
const fileUrl = speckit.file.url  // May be relative or absolute
const fullUrl = fileUrl.startsWith('http')
  ? fileUrl
  : `${STRAPI_URL}${fileUrl}`

// Browser creates hidden <a> tag with download attribute
<a href={fullUrl} download={filename} />
```

**Response**: Binary file download triggered by browser.

**Error Handling**:
- Network errors caught and displayed as toast message
- CORS handled by browser (Strapi must allow cross-origin requests)

---

### AI Platform URLs

**Description**: Opens speckit content in external AI platform (ChatGPT, Claude, Perplexity).

**Implementation**: Client-side using `window.open()`.

**Request**:

```typescript
// Direct navigation to external platform (not proxied)
const platformUrls = {
  chatgpt: 'https://chat.openai.com/?q=',
  claude: 'https://claude.ai/new?q=',
  perplexity: 'https://perplexity.ai/?q='
}

const url = platformUrl + encodeURIComponent(speckit.body)
window.open(url, '_blank', 'noopener,noreferrer')
```

**Response**: New browser tab opens with external AI platform.

**Security**: Uses `rel="noopener noreferrer"` to prevent security issues.

---

## Component Props (Internal Contracts)

### SpeckitDownloadBar

**Props Interface**:

```typescript
interface Props {
  speckit: SpeckitFull  // Required: Speckit data
}
```

**Emits Interface**:

```typescript
interface Emits {
  download: (file: SpeckitFile) => void
  help: () => void
}
```

---

### SpeckitHelpModal

**Props Interface**:

```typescript
interface Props {
  modelValue: boolean  // Required: Modal visibility (v-model)
  instructions: SpeckitUsageInstructions  // Required: Help content
}
```

**Emits Interface**:

```typescript
interface Emits {
  'update:modelValue': (value: boolean) => void
}
```

---

### AiPlatformSelector (Existing)

**Props Interface**:

```typescript
interface Props {
  promptText: string  // Required: Content to open in AI platform
}
```

**No Emits**: Component handles clicks internally with `window.open()`.

---

## No New Contracts Required

**Rationale**:
1. Feature is frontend-only - no backend changes
2. Reuses existing `/api/speckits/{slug}` endpoint
3. File downloads are direct browser downloads (not proxied)
4. AI platform integration is direct URL navigation (not proxied)

**Constitution Compliance**:
- ✅ Principle I: Server-Side Proxy Architecture - No new proxy routes needed (existing route sufficient)
- ✅ Principle VI: API & Data Modeling Standards - Uses existing domain types (no new models)

---

## Next Steps

1. Implement components with defined prop/emit interfaces
2. Test API integration with existing server routes
3. Verify error handling for network failures
