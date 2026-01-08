# Data Model: Speckit View Enhancements

**Feature**: Speckit View Enhancements (003-speckit-view-enhancements)
**Date**: 2026-01-08
**Status**: Complete

## Overview

This document defines the data model for the Speckit view enhancements feature, including TypeScript interfaces, Strapi CMS schema changes, validation rules, and entity relationships.

---

## TypeScript Interfaces

### Core Domain Models

#### SpeckitDiagramData

Represents Mermaid diagram source code and metadata.

```typescript
// types/article.ts

/**
 * Mermaid diagram source code stored in Strapi
 * @example
 * {
 *   source: "graph TD\n  A[Start] --> B[End]",
 *   type: "flowchart",
 *   valid: true
 * }
 */
export interface SpeckitDiagramData {
  /**
   * Mermaid diagram source code (plain text)
   * @format Mermaid syntax (graph TD, sequenceDiagram, etc.)
   * @example "graph TD\n  A[Start] --> B[End]"
   */
  source: string

  /**
   * Diagram type (inferred from source for validation)
   * @enum flowchart | sequenceDiagram | classDiagram | stateDiagram | erDiagram | gantt | pie | mindmap
   * @default "flowchart"
   */
  type?: 'flowchart' | 'sequenceDiagram' | 'classDiagram' |
         'stateDiagram' | 'erDiagram' | 'gantt' | 'pie' | 'mindmap'

  /**
   * Validation flag (set after Mermaid parsing)
   * @default true
   */
  valid?: boolean

  /**
   * Validation error message (if invalid)
   * @example "Parse error: line 3: syntax error"
   */
  error?: string
}
```

**Validation Rules**:
- `source`: Required, max 10,000 characters (to prevent abuse)
- `type`: Optional, auto-detected from source if not provided
- `valid`: Computed property, validated client-side before rendering

**Usage**:
```typescript
// In component
const diagramData: SpeckitDiagramData = {
  source: speckit.diagram || '',
  type: 'flowchart',
  valid: true
}

// Validate before rendering
if (diagramData.source && !diagramData.valid) {
  console.error('[SpeckitDiagramView] Invalid Mermaid syntax:', diagramData.error)
}
```

---

#### SpeckitFaqEntry

Represents a single FAQ question and answer pair.

```typescript
// types/article.ts

/**
 * Single FAQ question/answer entry
 * @example
 * {
 *   id: "what-is-speckit",
 *   question: "Что такое Speckit?",
 *   answer: "Speckit - это готовая конфигурация..."
 * }
 */
export interface SpeckitFaqEntry {
  /**
   * Unique identifier for the FAQ entry
   * @format kebab-case
   * @pattern /^[a-z0-9]+(-[a-z0-9]+)*$/
   */
  id: string

  /**
   * FAQ question (Russian language)
   * @format Plain text or Markdown
   * @minLength 10
   * @maxLength 200
   */
  question: string

  /**
   * FAQ answer (Russian language, supports Markdown)
   * @format Markdown (basic syntax: **bold**, `code`, links)
   * @minLength 20
   * @maxLength 2000
   */
  answer: string

  /**
   * Optional order/priority for sorting
   * @default 0
   * @min 0
   */
  order?: number

  /**
   * Optional category ID for grouping
   * @example "getting-started"
   */
  categoryId?: string
}
```

**Validation Rules**:
- `id`: Required, kebab-case, unique within category
- `question`: Required, 10-200 characters
- `answer`: Required, 20-2000 characters, Markdown format
- `order`: Optional, non-negative integer
- `categoryId`: Optional, must reference existing category

---

#### SpeckitFaqCategory

Groups FAQ entries by topic.

```typescript
// types/article.ts

/**
 * FAQ category for grouping questions
 * @example
 * {
 *   id: "getting-started",
 *   title: "Начало работы",
 *   order: 1
 * }
 */
export interface SpeckitFaqCategory {
  /**
   * Unique category identifier
   * @format kebab-case
   * @pattern /^[a-z0-9]+(-[a-z0-9]+)*$/
   */
  id: string

  /**
   * Category display title (Russian)
   * @minLength 5
   * @maxLength 50
   */
  title: string

  /**
   * Display order (lower = higher priority)
   * @default 0
   * @min 0
   */
  order?: number

  /**
   * FAQ entries in this category
   */
  questions: SpeckitFaqEntry[]
}
```

**Validation Rules**:
- `id`: Required, kebab-case, unique across all categories
- `title`: Required, 5-50 characters
- `order`: Optional, non-negative integer
- `questions`: Required, array of FAQ entries

---

#### SpeckitFaqData

Root container for FAQ content loaded from JSON file.

```typescript
// types/article.ts

/**
 * Complete FAQ data structure
 * @example
 * {
 *   version: "1.0",
 *   lastUpdated: "2026-01-08",
 *   language: "ru",
 *   categories: [...]
 * }
 */
export interface SpeckitFaqData {
  /**
   * FAQ content version for cache busting
   * @format semver (major.minor.patch)
   */
  version: string

  /**
   * Last update date (ISO 8601 format)
   * @format YYYY-MM-DD
   */
  lastUpdated: string

  /**
   * Content language code
   * @enum ISO 639-1 language code
   * @default "ru"
   */
  language: string

  /**
   * FAQ categories sorted by order
   */
  categories: SpeckitFaqCategory[]
}
```

**Validation Rules**:
- `version`: Required, semver format
- `lastUpdated`: Required, ISO date format
- `language`: Required, ISO 639-1 code
- `categories`: Required, array sorted by `order` field

---

### Extended Domain Models

#### SpeckitFull (Extended)

Extends existing `SpeckitFull` interface to include diagram data.

```typescript
// types/article.ts (MODIFY EXISTING)

/**
 * Extended Speckit full detail with optional diagram data
 * Adds diagram field to existing SpeckitFull interface
 */
export interface SpeckitFull extends ArticleBase {
  type: "speckit"
  categories?: Category[]
  body: string
  file?: SpeckitFile | null

  /**
   * NEW: Optional Mermaid diagram source code
   * Fetched from Strapi `diagram` field (Long Text)
   * @optional
   */
  diagram?: string | null
}
```

**Migration Notes**:
- Existing `SpeckitFull` interface gains optional `diagram` field
- Backward compatible: `diagram` is optional, defaults to `null`
- No changes required to existing components that don't use diagrams

---

#### SpeckitCopyCommandData

Data structure for copy command component.

```typescript
// types/article.ts

/**
 * Copy command display data
 */
export interface SpeckitCopyCommandData {
  /**
   * Full wget command string
   * @example "wget https://portal.aiworkplace.ru/speckits/test-spec/download"
   */
  command: string

  /**
   * Display truncation length
   * @default 40
   */
  maxLength?: number

  /**
   * Copy success message (Russian)
   * @default "Скопировано!"
   */
  successMessage?: string

  /**
   * Copy error message (Russian)
   * @default "Не удалось скопировать"
   */
  errorMessage?: string
}
```

---

## Strapi CMS Schema

### Articles Content Type (Extension)

**Existing Fields**:
- `title` (Text)
- `slug` (Text, Unique)
- `description` (Text, Long)
- `type` (Enumeration: article, prompt, speckit)
- `body` (Rich Text or Markdown)
- `categories` (Relation to Category)
- `file` (Media - Upload file)

**New Field**:

```json
{
  "name": "diagram",
  "type": "text",
  "long": true,
  "required": false,
  "private": false,
  "default": null,
  "unique": false
}
```

**Field Settings**:
- **Type**: Text (Long Text)
- **Name**: `diagram`
- **Label**: Diagram (Mermaid source)
- **Required**: No (optional field)
- **Default Value**: `null`
- **Validation**: None (client-side validation in frontend)

**Example Content Entry**:
```json
{
  "id": 1,
  "attributes": {
    "title": "Example Speckit",
    "slug": "example-speckit",
    "type": "speckit",
    "description": "An example speckit with diagram",
    "body": "# Example Speckit\n\nThis is documentation...",
    "diagram": "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action]\n  B -->|No| D[Skip]\n  C --> E[End]\n  D --> E",
    "categories": {
      "data": [
        {
          "id": 1,
          "attributes": {
            "name": "Automation"
          }
        }
      ]
    },
    "file": {
      "data": {
        "id": 1,
        "attributes": {
          "name": "example-speckit.md",
          "url": "/uploads/example_speckit_md.pdf",
          "size": 12345
        }
      }
    }
  }
}
```

---

### Static FAQ Data (JSON File)

**File Location**: `frontend/public/speckit-faq.json`

**Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Speckit FAQ Data",
  "type": "object",
  "required": ["version", "lastUpdated", "language", "categories"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
      "description": "FAQ version (semver)"
    },
    "lastUpdated": {
      "type": "string",
      "format": "date",
      "description": "Last update date (YYYY-MM-DD)"
    },
    "language": {
      "type": "string",
      "pattern": "^[a-z]{2}$",
      "description": "ISO 639-1 language code"
    },
    "categories": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "questions"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$"
          },
          "title": {
            "type": "string",
            "minLength": 5,
            "maxLength": 50
          },
          "order": {
            "type": "integer",
            "minimum": 0,
            "default": 0
          },
          "questions": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "question", "answer"],
              "properties": {
                "id": {
                  "type": "string",
                  "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$"
                },
                "question": {
                  "type": "string",
                  "minLength": 10,
                  "maxLength": 200
                },
                "answer": {
                  "type": "string",
                  "minLength": 20,
                  "maxLength": 2000
                },
                "order": {
                  "type": "integer",
                  "minimum": 0,
                  "default": 0
                },
                "categoryId": {
                  "type": "string",
                  "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Example FAQ Data**:
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
          "answer": "Speckit - это готовая конфигурация для вашего проекта, которая помогает структурировать работу с AI-ассистентами.",
          "order": 1
        },
        {
          "id": "how-to-download",
          "question": "Как скачать Speckit?",
          "answer": "Нажмите кнопку **Скачать** внизу страницы или скопируйте команду wget и выполните её в терминале.",
          "order": 2
        }
      ]
    },
    {
      "id": "environment-setup",
      "title": "Настройка окружения",
      "order": 2,
      "questions": [
        {
          "id": "system-requirements",
          "question": "Какие системные требования?",
          "answer": "Для работы со Speckit вам потребуется:\n\n- Node.js 18 или выше\n- Текстовый редактор (VS Code, Vim)\n- Доступ к терминалу\n- npm или yarn",
          "order": 1
        },
        {
          "id": "installation-steps",
          "question": "Как установить Speckit в проект?",
          "answer": "1. Скачайте Speckit файл\n2. Разместите его в корне проекта\n3. Следуйте инструкциям в файле для настройки",
          "order": 2
        }
      ]
    },
    {
      "id": "troubleshooting",
      "title": "Решение проблем",
      "order": 3,
      "questions": [
        {
          "id": "download-failed",
          "question": "Файл не скачивается. Что делать?",
          "answer": "Если файл не скачивается:\n\n1. Проверьте подключение к интернету\n2. Попробуйте скопировать команду wget и выполнить её в терминале\n3. Обновите страницу и попробуйте снова",
          "order": 1
        },
        {
          "id": "diagram-not-showing",
          "question": "Диаграмма не отображается",
          "answer": "Если диаграмма не отображается:\n\n1. Проверьте, что Speckit содержит данные диаграммы\n2. Обновите страницу\n3. Проверьте консоль браузера на наличие ошибок",
          "order": 2
        }
      ]
    }
  ]
}
```

---

## Entity Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│   SpeckitFull   │
│  (Strapi:       │
│   Article)      │
├─────────────────┤
│ id              │──┐
│ title           │  │
│ slug            │  │
│ body            │  │
│ file            │  │
│ diagram (NEW)   │  │
│ categories      │  │
└─────────────────┘  │
                     │
                     │ 1:N
                     │
                     │
         ┌───────────┴───────────┐
         │                       │
         │ Category              │ SpeckitDiagramData
         │                       │ (client-side only)
         ├───────────┐           ├─────────────────┐
         │ id        │           │ source          │
         │ name      │           │ type            │
         └───────────┘           │ valid           │
                                 │ error           │
                                 └─────────────────┘

┌─────────────────┐
│ SpeckitFaqData  │
│ (static JSON)   │
├─────────────────┤
│ version         │──┐
│ lastUpdated     │  │ 1:N
│ language        │  │
│ categories      │  │
└─────────────────┘  │
                     │
         ┌───────────┴───────────┐
         │ SpeckitFaqCategory    │
         ├───────────────────────┤
         │ id                    │──┐
         │ title                 │  │ 1:N
         │ order                 │  │
         │ questions             │  │
         └───────────────────────┘  │
                                    │
                     ┌──────────────┴──────────────┐
                     │ SpeckitFaqEntry             │
                     ├─────────────────────────────┤
                     │ id                          │
                     │ question                    │
                     │ answer                      │
                     │ order                       │
                     │ categoryId                  │
                     └─────────────────────────────┘
```

### Relationship Rules

**SpeckitFull ↔ Category**:
- Type: Many-to-Many (via Strapi relation)
- Cardinality: One speckit can have multiple categories
- Navigation: `speckit.categories` array

**SpeckitFull → SpeckitDiagramData**:
- Type: One-to-One (client-side only)
- Cardinality: One speckit has at most one diagram
- Source: Strapi `diagram` field (plain text)
- Validation: Client-side Mermaid parsing

**SpeckitFaqData → SpeckitFaqCategory**:
- Type: One-to-Many (static JSON)
- Cardinality: One FAQ data has multiple categories
- Sorting: By `order` field (ascending)

**SpeckitFaqCategory → SpeckitFaqEntry**:
- Type: One-to-Many (static JSON)
- Cardinality: One category has multiple questions
- Sorting: By `order` field (ascending)
- Back-reference: `categoryId` in FAQ entry

---

## Validation Rules

### Client-Side Validation

#### Mermaid Diagram Syntax

```typescript
// composables/useMermaidDiagram.ts

export function validateMermaidSyntax(source: string): {
  valid: boolean
  error?: string
  type?: string
} {
  if (!source || source.trim().length === 0) {
    return { valid: false, error: 'Diagram source is empty' }
  }

  if (source.length > 10000) {
    return { valid: false, error: 'Diagram source too long (max 10,000 characters)' }
  }

  // Detect diagram type from first word
  const firstLine = source.split('\n')[0].trim()
  const type = firstLine.split(/\s+/)[0]

  const validTypes = [
    'graph', 'flowchart', 'sequenceDiagram',
    'classDiagram', 'stateDiagram', 'erDiagram',
    'gantt', 'pie', 'mindmap', 'gitGraph'
  ]

  if (!validTypes.includes(type)) {
    return { valid: false, error: `Unknown diagram type: ${type}` }
  }

  return { valid: true, type }
}
```

#### FAQ Data Validation

```typescript
// composables/useSpeckitFaq.ts

export function validateFaqData(data: SpeckitFaqData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Version validation
  if (!/^\d+\.\d+\.\d+$/.test(data.version)) {
    errors.push('Version must be in semver format (e.g., 1.0.0)')
  }

  // Date validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastUpdated)) {
    errors.push('lastUpdated must be in YYYY-MM-DD format')
  }

  // Language validation
  if (!/^[a-z]{2}$/.test(data.language)) {
    errors.push('Language must be ISO 639-1 code (e.g., "ru", "en")')
  }

  // Categories validation
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push('FAQ must have at least one category')
  }

  // Validate each category
  data.categories.forEach((cat, idx) => {
    if (!cat.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cat.id)) {
      errors.push(`Category ${idx}: id must be kebab-case`)
    }
    if (!cat.title || cat.title.length < 5 || cat.title.length > 50) {
      errors.push(`Category ${idx}: title must be 5-50 characters`)
    }
    if (!Array.isArray(cat.questions) || cat.questions.length === 0) {
      errors.push(`Category ${idx}: must have at least one question`)
    }

    // Validate each question
    cat.questions.forEach((q, qIdx) => {
      if (!q.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id)) {
        errors.push(`Category ${idx}, Question ${qIdx}: id must be kebab-case`)
      }
      if (!q.question || q.question.length < 10 || q.question.length > 200) {
        errors.push(`Category ${idx}, Question ${qIdx}: question must be 10-200 characters`)
      }
      if (!q.answer || q.answer.length < 20 || q.answer.length > 2000) {
        errors.push(`Category ${idx}, Question ${qIdx}: answer must be 20-2000 characters`)
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### Server-Side Validation (Strapi)

**Diagram Field Validation**:
- Max length: 10,000 characters (Strapi field setting)
- No SQL injection risk (plain text field)
- No XSS risk (rendered as text, not HTML)

**FAQ File Validation** (optional):
- JSON syntax validation on load
- Schema validation (can use Ajv or manual validation)
- Fallback to default FAQ if file missing/invalid

---

## Migration Path

### Existing Data Migration

**Step 1: Update TypeScript Types**
```bash
# Modify frontend/types/article.ts
# Add optional `diagram?: string | null` to SpeckitFull interface
```

**Step 2: Strapi Schema Update**
```bash
# Log into Strapi admin panel
# Navigate to Content Type Builder → Articles
# Add new field "diagram" (Long Text, Optional)
# Save and restart Strapi server
```

**Step 3: Database Migration**
```bash
# Strapi automatically adds column to database
# Existing records have diagram = NULL
# No data migration needed (optional field)
```

**Step 4: Create FAQ File**
```bash
# Create frontend/public/speckit-faq.json
# Add initial FAQ content (see example above)
```

**Step 5: Install Dependencies**
```bash
cd frontend
yarn add mermaid@^11.0.0
yarn add -D @types/mermaid@^11.0.0
```

---

## Summary

### New TypeScript Interfaces
- `SpeckitDiagramData` - Diagram source and metadata
- `SpeckitFaqEntry` - Single Q&A pair
- `SpeckitFaqCategory` - FAQ category
- `SpeckitFaqData` - Root FAQ container
- `SpeckitCopyCommandData` - Copy command data

### Modified Interfaces
- `SpeckitFull` - Extended with optional `diagram` field

### Strapi Changes
- Articles content type: Add `diagram` field (Long Text, Optional)

### Static Files
- `frontend/public/speckit-faq.json` - FAQ content

### Validation
- Client-side: Mermaid syntax, FAQ schema
- Server-side: Strapi field constraints

---

## Next Steps

1. ✅ Data model complete - all interfaces defined
2. ⏭️ Proceed to API Contracts documentation
3. ⏭️ Generate Quick Start guide
