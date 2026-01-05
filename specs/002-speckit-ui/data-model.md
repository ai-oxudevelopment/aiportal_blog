# Data Model: Speckit UI Enhancements

**Feature**: 002-speckit-ui
**Phase**: 1 - Design & Contracts
**Date**: 2026-01-04

## Overview

This feature does not introduce new data models. It reuses existing domain types from the codebase as defined in the frontend constitution (Principle VI: API & Data Modeling Standards). All data structures are already defined in `frontend/types/article.ts` and fetched through existing server routes.

## Domain Types

### SpeckitFull

**Source**: `frontend/types/article.ts` (existing)

**Description**: Complete speckit data including content, metadata, and downloadable files.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (stringified number from Strapi) |
| `title` | string | Yes | Speckit title |
| `slug` | string | Yes | URL-friendly identifier |
| `description` | string | No | Short description or summary |
| `type` | "speckit" | Yes | Content type discriminator |
| `categories` | Category[] | No | Associated categories |
| `body` | string | No | Markdown content body |
| `file` | SpeckitFile \| null | No | Optional downloadable configuration file |

**Usage**: Primary data structure for speckit detail page. Fetched via `useFetchOneSpeckit(slug)` composable.

**Validation Rules**:
- `type` must equal "speckit"
- `id` is converted to string for consistency
- `body` and `file` are optional (may be null or undefined)
- `categories` defaults to empty array if not provided

---

### SpeckitFile

**Source**: `frontend/types/article.ts` (existing)

**Description**: Metadata for downloadable speckit configuration file.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | File URL (may be relative or absolute) |
| `name` | string | Yes | Original filename |
| `size` | number | Yes | File size in bytes |

**Usage**: Used to download configuration file. URL is constructed to be absolute (prepends STRAPI_URL if relative).

**Validation Rules**:
- All fields are required when `file` object exists
- `url` may be relative path from Strapi or absolute
- `size` is used for display purposes only (e.g., "123.4 KB")

---

### Category

**Source**: `frontend/types/article.ts` (existing)

**Description**: Category tag associated with content (speckits, prompts, articles).

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Unique category identifier |
| `name` | string | Yes | Category display name (Russian) |

**Usage**: Displayed as badges on speckit detail page. Categories are rendered as colored tags.

**Validation Rules**:
- Both fields required
- `name` is in Russian (follows constitution Principle IV)

---

### AI Platform

**Source**: Inline type in `AiPlatformSelector.vue` (existing)

**Description**: External AI service configuration for opening content in different platforms.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Platform name ("ChatGPT", "Claude", "Perplexity") |
| `urlTemplate` | string | Yes | URL template with `{query}` placeholder |
| `icon` | string (SVG) | Yes | Inline SVG icon markup |
| `color` | string | Yes | CSS color class (e.g., "green", "orange", "blue") |

**Usage**: Used by `AiPlatformSelector` component to generate platform-specific URLs. Not stored in backend - hard-coded in component.

**Platform Configurations** (from existing code):

| Platform | URL Template | Color |
|----------|--------------|-------|
| ChatGPT | `https://chat.openai.com/?q={query}` | Green |
| Claude | `https://claude.ai/new?q={query}` | Orange |
| Perplexity | `https://perplexity.ai/?q={query}` | Blue |

**Validation Rules**:
- `query` parameter is URL-encoded using `encodeURIComponent()`
- Opens in new tab with `target="_blank"` and `rel="noopener noreferrer"`

---

### SpeckitUsageInstructions

**Source**: New (defined in this feature)

**Description**: Structure for help modal content explaining how to use a speckit.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Instructions title |
| `sections` | InstructionSection[] | Yes | Array of instruction sections |

**Usage**: Populated with default Russian content. Rendered as markdown in help modal.

---

### InstructionSection

**Source**: New (defined in this feature)

**Description**: A single section of the usage instructions.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `heading` | string | Yes | Section heading |
| `content` | string | Yes | Section content (markdown) |

**Usage**: Rendered sequentially in help modal using `@nuxtjs/mdc`.

---

## Component State Models

### SpeckitDownloadBar Component State

**Reactive State**:

```typescript
interface SpeckitDownloadBarState {
  downloadLoading: boolean    // True while download in progress
  downloadError: string | null  // Error message or null
  showModal: boolean          // Controls modal visibility
}
```

**Props**:

```typescript
interface SpeckitDownloadBarProps {
  speckit: SpeckitFull        // Speckit data (required)
}
```

**Emits**:

```typescript
interface SpeckitDownloadBarEmits {
  download: (file: SpeckitFile) => void    // Download button clicked
  help: () => void                         // Help button clicked
}
```

**Behavior**:
- `downloadLoading` is true during file fetch, false otherwise
- `downloadError` is set on failure, auto-clears after 5 seconds
- `showModal` toggles help modal visibility
- Download button disabled if `!speckit.file` or `downloadLoading`

---

### SpeckitHelpModal Component State

**Reactive State**:

```typescript
interface SpeckitHelpModalState {
  isOpen: boolean  // Modal open/closed state
}
```

**Props**:

```typescript
interface SpeckitHelpModalProps {
  modelValue: boolean  // v-model binding for modal visibility
  instructions: SpeckitUsageInstructions  // Help content to display
}
```

**Emits**:

```typescript
interface SpeckitHelpModalEmits {
  'update:modelValue': (value: boolean) => void  // v-model update
}
```

**Behavior**:
- Modal closes on: Escape key, click outside, close button click
- Focus trap when open (keyboard navigation)
- Returns focus to trigger button when closed

---

## Data Flow

### 1. Speckit Data Fetching

```
[Page Component]
    ↓
useFetchOneSpeckit(slug)
    ↓
GET /api/speckits/[slug] (Nuxt server route)
    ↓
Strapi API (with fallback for missing fields)
    ↓
Normalize to SpeckitFull type
    ↓
[Page Component receives { speckit, loading, error }]
```

### 2. Download Flow

```
[User clicks download]
    ↓
SpeckitDownloadBar @click handler
    ↓
useFileDownload().downloadFileFromUrl(url, filename)
    ↓
[Browser downloads file]
    ↓
[Show error toast on failure]
```

### 3. Help Modal Flow

```
[User clicks ? button]
    ↓
SpeckitDownloadBar emits 'help'
    ↓
[Page component sets showModal = true]
    ↓
SpeckitHelpModal opens with default instructions
    ↓
[User reads instructions]
    ↓
[User closes modal]
    ↓
showModal = false
```

### 4. AI Platform Flow

```
[User clicks ChatGPT/Claude/Perplexity]
    ↓
AiPlatformSelector @click handler
    ↓
Construct URL: platformUrl + ?q=encodeURIComponent(speckit.body)
    ↓
window.open(url, '_blank', 'noopener,noreferrer')
    ↓
[New tab opens with AI platform]
```

---

## Edge Case Handling

### Missing Configuration File

**Condition**: `speckit.file === null || speckit.file === undefined`

**Behavior**:
- Download button is hidden (or disabled with visual cue)
- Help button remains visible
- No error thrown (graceful degradation)

**Rationale**: FR-012 requires handling speckits without configuration files.

---

### Missing Body Content

**Condition**: `!speckit.body || speckit.body.trim() === ''`

**Behavior**:
- AI platform buttons are hidden (or disabled)
- Download button remains functional (if file exists)
- Help modal remains accessible

**Rationale**: FR-013 requires handling speckits without body content.

---

### Network Error During Download

**Condition**: Fetch fails (timeout, CORS, 404, etc.)

**Behavior**:
- `downloadError` set to error message
- Toast displayed at bottom-right for 5 seconds
- `downloadLoading` reset to false
- Error logged to console with context

**Rationale**: FR-009 requires error messages for 5 seconds before auto-dismissing.

---

## Type Safety

All components use TypeScript with strict mode. Props are fully typed and validated at compile time. No `any` types used (constitution Principle VI).

---

## Next Steps

1. Create component implementation files with proper TypeScript types
2. Write unit tests for component state management
3. Implement integration tests for data flow
