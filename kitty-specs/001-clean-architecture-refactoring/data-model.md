# Data Model: Clean Architecture Refactoring

**Feature**: 001-clean-architecture-refactoring
**Date**: 2025-02-21

---

## Domain Entities

### Article

Абстрактная сущность для контента (Speckits, Prompts, Blogs).

```typescript
// src/domain/entities/Article.ts
interface Article {
  readonly id: ArticleId
  slug: string
  title: string
  description: string
  body: string
  type: ArticleType
  category: Category
  file?: FileAttachment
  diagram?: DiagramData
  faq?: FaqItem[]
  createdAt: Date
  updatedAt: Date
}

type ArticleType = 'speckit' | 'prompt' | 'blog'

// Value Object
type ArticleId = number & { readonly __brand: unique symbol }

function createArticleId(id: number): ArticleId {
  if (id <= 0) throw new Error('Invalid ArticleId')
  return id as ArticleId
}
```

**Validation Rules**:
- `id` must be positive
- `slug` must be non-empty and URL-safe
- `title` must be non-empty
- `type` must be one of: 'speckit', 'prompt', 'blog'

### Category

Категория для организации контента.

```typescript
// src/domain/entities/Category.ts
interface Category {
  readonly id: number
  slug: string
  name: string
  type: ArticleType
}

function createCategory(data: CategoryInput): Category {
  if (!data.slug || !data.name) throw new Error('Invalid category')
  return {
    id: data.id,
    slug: data.slug.toLowerCase(),
    name: data.name,
    type: data.type
  }
}
```

**State Transitions**: None (immutable after creation)

### ResearchSession

Сессия AI чата/исследования.

```typescript
// src/domain/entities/ResearchSession.ts
interface ResearchSession {
  readonly id: string
  messages: ResearchMessage[]
  platform: ResearchPlatform
  status: SessionStatus
  createdAt: Date
  updatedAt: Date
}

type ResearchPlatform = 'openai' | 'claude' | 'perplexity'
type SessionStatus = 'active' | 'completed' | 'error'

interface ResearchMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}
```

**State Transitions**:
- `active` → `completed` (user finishes session)
- `active` → `error` (API error)

---

## Value Objects

### SpeckitSlug

```typescript
type SpeckitSlug = string & { readonly __brand: unique symbol }

function createSpeckitSlug(slug: string): SpeckitSlug {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Invalid speckit slug format')
  }
  return slug as SpeckitSlug
}
```

### FileAttachment

```typescript
interface FileAttachment {
  readonly id: string
  name: string
  url: string
  size: number
  mimeType: string
}

function validateFileAttachment(file: FileAttachment): void {
  if (!file.url) throw new Error('File URL is required')
  if (file.size <= 0) throw new Error('Invalid file size')
}
```

### DiagramData

```typescript
interface DiagramData {
  format: 'mermaid' | 'plantuml'
  content: string
  rendered?: string
}
```

### FaqItem

```typescript
interface FaqItem {
  question: string
  answer: string
  order: number
}
```

---

## Aggregates

### SpeckitAggregate

Агрегат для Speckit с связанными сущностями.

```typescript
interface SpeckitAggregate {
  speckit: Article
  categories: Category[]
  relatedSpeckits: Article[]
}
```

**Aggregate Root**: `Article` (speckit type)

---

## Repository Interfaces

```typescript
// src/domain/repositories/IArticlesRepository.ts
interface IArticlesRepository {
  findAll(filter: ArticleFilter): Promise<Article[]>
  findBySlug(slug: string): Promise<Article | null>
  findById(id: ArticleId): Promise<Article | null>
}

interface ArticleFilter {
  type?: ArticleType
  category?: string
  search?: string
}

// src/domain/repositories/ICategoriesRepository.ts
interface ICategoriesRepository {
  findAll(type?: ArticleType): Promise<Category[]>
  findBySlug(slug: string): Promise<Category | null>
}

// src/domain/repositories/IResearchRepository.ts
interface IResearchRepository {
  createSession(platform: ResearchPlatform): Promise<ResearchSession>
  addMessage(sessionId: string, message: Omit<ResearchMessage, 'id' | 'timestamp'>): Promise<void>
  getSession(sessionId: string): Promise<ResearchSession | null>
  updateStatus(sessionId: string, status: SessionStatus): Promise<void>
}
```

---

## Cache Interface

```typescript
// src/domain/cache/ICacheProvider.ts
interface ICacheProvider<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T, ttl?: number): Promise<void>
  invalidate(pattern: string): Promise<void>
  clear(): Promise<void>
}

interface CacheOptions {
  ttl: number        // Time to live in seconds
  staleWhileRevalidate?: number
}
```

---

## Relationships

```
┌─────────────┐
│  Category   │
└──────┬──────┘
       │ 1
       │
       │ *
┌──────▼──────┐
│   Article   │
└──────┬──────┘
       │ 1
       │
       │ *
┌──────▼──────┐     ┌──────────────┐
│FileAttachment│     │ DiagramData  │
└─────────────┘     └──────────────┘

┌─────────────┐
│ResearchSession│
└──────┬──────┘
       │ 1
       │
       │ *
┌──────▼──────┐
│ResearchMessage│
└─────────────┘
```

---

## Migration Notes

**Existing Types** (from `frontend/types/article.ts`):
- `SpeckitPreview`, `SpeckitFull`
- `PromptPreview`, `PromptFull`
- `SpeckitFaqData`, `SpeckitDiagramData`

**Action**: Эти типы будут заменены на Domain Entities выше. Переходный период: используем adapter pattern для конвертации.

```typescript
// Adapter function during migration
function toArticle(strapiData: SpeckitFull): Article {
  return {
    id: createArticleId(strapiData.id),
    slug: strapiData.slug,
    title: strapiData.title,
    description: strapiData.description,
    body: strapiData.body,
    type: 'speckit',
    category: createCategory(strapiData.category),
    file: strapiData.file,
    diagram: strapiData.diagram,
    faq: strapiData.faq,
    createdAt: new Date(strapiData.createdAt),
    updatedAt: new Date(strapiData.updatedAt)
  }
}
```
