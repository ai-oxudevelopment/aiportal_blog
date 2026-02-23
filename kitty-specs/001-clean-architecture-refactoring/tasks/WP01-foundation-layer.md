---
lane: "done"
dependencies: []
base_branch: main
base_commit: e2f981ed4afa6f2028f90ce348b83ea3f212996c
created_at: '2026-02-21T11:23:31.355429+00:00'
agent: "claude"
shell_pid: "3576"
reviewed_by: "ALeks ishmanov"
review_status: "approved"
---
# WP01: Foundation Layer Setup

**Work Package ID**: WP01
**Title**: Foundation Layer Setup
**Lane**: planned
**Dependencies**: []
**Subtasks**: ["T001", "T002", "T003", "T004", "T005", "T006"]

**History**:
- 2025-02-21: Created during task generation

---

## Objective

Создать базовую структуру слоистой архитектуры для Nuxt 3 приложения. Это foundational work, который не должен менять существующую функциональность, а только добавить новые абстракции.

**Success Criteria**:
- `frontend/src/domain/` создан с базовыми сущностями
- `frontend/src/infrastructure/` создан с cache и API директориями
- TypeScript компилируется без ошибок
- Nuxt auto-imports настроены для новых путей
- Базовые интерфейсные тесты проходят

---

## Context

Это первый work package в последовательности миграции на Clean Architecture. Мы создаём "песочницу" — новую структуру параллельно существующему коду. Старый код остаётся работающим.

**Key References**:
- Data Model: `data-model.md` — определения сущностей
- Repository Contracts: `contracts/repositories.ts` — интерфейсы репозиториев
- Quickstart: `quickstart.md` — примеры использования

**Technical Context**:
- Nuxt 3.2.0 с автозагрузкой composables
- TypeScript 5.9.2
- SSR mode enabled (сохраняем!)
- Текущая структура: `components/`, `pages/`, `server/`, `composables/`

---

## Subtasks

### T001: Создать структуру директорий `frontend/src/`

**Purpose**: Создать каркас новой слоистой архитектуры.

**Steps**:

1. Создать директории Domain Layer:
   ```bash
   mkdir -p frontend/src/domain/entities
   mkdir -p frontend/src/domain/repositories
   mkdir -p frontend/src/domain/cache
   mkdir -p frontend/src/domain/value-objects
   ```

2. Создать директории Application Layer:
   ```bash
   mkdir -p frontend/src/application/use-cases
   mkdir -p frontend/src/application/use-cases/speckits
   mkdir -p frontend/src/application/use-cases/prompts
   mkdir -p frontend/src/application/use-cases/research
   mkdir -p frontend/src/application/use-cases/categories
   mkdir -p frontend/src/application/services
   ```

3. Создать директории Infrastructure Layer:
   ```bash
   mkdir -p frontend/src/infrastructure/repositories
   mkdir -p frontend/src/infrastructure/cache
   mkdir -p frontend/src/infrastructure/api
   ```

4. Создать директории Presentation Layer:
   ```bash
   mkdir -p frontend/src/presentation/composables
   mkdir -p frontend/src/presentation/stores
   ```

5. Создать index files для экспорта:
   - `frontend/src/domain/entities/index.ts` (пустой, будет заполнен позже)
   - `frontend/src/domain/repositories/index.ts`
   - `frontend/src/domain/cache/index.ts`

**Validation**:
- [ ] Все директории созданы
- [ ] Структура соответствует плану из `data-model.md`

**Files**:
- Новые директории (нет файлов)

---

### T002: Определить Domain Entities

**Purpose**: Создать базовые сущности Domain Layer: Article, Category, ResearchSession.

**Steps**:

1. Создать `frontend/src/domain/entities/Article.ts`:
   ```typescript
   export interface Article {
     readonly id: number
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

   export type ArticleType = 'speckit' | 'prompt' | 'blog'

   export interface FileAttachment {
     readonly id: string
     name: string
     url: string
     size: number
     mimeType: string
   }

   export interface DiagramData {
     format: 'mermaid' | 'plantuml'
     content: string
     rendered?: string
   }

   export interface FaqItem {
     question: string
     answer: string
     order: number
   }

   // Value Object for type-safe IDs
   export type ArticleId = number & { readonly __brand: unique symbol }

   export function createArticleId(id: number): ArticleId {
     if (id <= 0) throw new Error('Invalid ArticleId: must be positive')
     return id as ArticleId
   }
   ```

2. Создать `frontend/src/domain/entities/Category.ts`:
   ```typescript
   export interface Category {
     readonly id: number
     slug: string
     name: string
     type: ArticleType
   }

   import type { ArticleType } from './Article'

   export function createCategory(data: CategoryInput): Category {
     if (!data.slug || !data.name) {
       throw new Error('Invalid category: slug and name are required')
     }
     return {
       id: data.id,
       slug: data.slug.toLowerCase(),
       name: data.name,
       type: data.type
     }
   }

   export interface CategoryInput {
     id: number
     slug: string
     name: string
     type: ArticleType
   }
   ```

3. Создать `frontend/src/domain/entities/ResearchSession.ts`:
   ```typescript
   export interface ResearchSession {
     readonly id: string
     messages: ResearchMessage[]
     platform: ResearchPlatform
     status: SessionStatus
     createdAt: Date
     updatedAt: Date
   }

   export type ResearchPlatform = 'openai' | 'claude' | 'perplexity'
   export type SessionStatus = 'active' | 'completed' | 'error'

   export interface ResearchMessage {
     id: string
     role: 'user' | 'assistant' | 'system'
     content: string
     timestamp: Date
   }

   export function createResearchMessage(
     role: ResearchMessage['role'],
     content: string
   ): ResearchMessage {
     return {
       id: crypto.randomUUID(),
       role,
       content,
       timestamp: new Date()
     }
   }
   ```

4. Обновить `frontend/src/domain/entities/index.ts`:
   ```typescript
   export * from './Article'
   export * from './Category'
   export * from './ResearchSession'
   ```

**Validation**:
- [ ] Все файлы компилируются без ошибок TypeScript
- [ ] Типы экспортируются корректно
- [ ] Value Objects (`ArticleId`) используют branded types

**Files**:
- `frontend/src/domain/entities/Article.ts` (~80 lines)
- `frontend/src/domain/entities/Category.ts` (~40 lines)
- `frontend/src/domain/entities/ResearchSession.ts` (~50 lines)
- `frontend/src/domain/entities/index.ts` (~5 lines)

**Notes**:
- Используем `readonly` для immutable полей (good practice)
- Factory functions (`createArticleId`) обеспечивают валидацию
- Брендированные типы (`ArticleId`) предотвращают смешение ID сущностей

---

### T003: Определить Repository Interfaces

**Purpose**: Создать интерфейсы репозиториев в Domain Layer.

**Steps**:

1. Создать `frontend/src/domain/repositories/IArticlesRepository.ts`:
   ```typescript
   import type { Article, ArticleId, ArticleType } from '../entities'

   export interface ArticleFilter {
     type?: ArticleType
     category?: string
     search?: string
     offset?: number
     limit?: number
   }

   export interface IArticlesRepository {
     findAll(filter?: ArticleFilter): Promise<Article[]>
     findBySlug(slug: string): Promise<Article | null>
     findById(id: ArticleId): Promise<Article | null>
   }

   export class RepositoryError extends Error {
     constructor(message: string, public readonly cause?: unknown) {
       super(message)
       this.name = 'RepositoryError'
     }
   }
   ```

2. Создать `frontend/src/domain/repositories/ICategoriesRepository.ts`:
   ```typescript
   import type { Category, ArticleType } from '../entities'

   export interface ICategoriesRepository {
     findAll(type?: ArticleType): Promise<Category[]>
     findBySlug(slug: string): Promise<Category | null>
   }
   ```

3. Создать `frontend/src/domain/repositories/IResearchRepository.ts`:
   ```typescript
   import type { ResearchSession, ResearchPlatform, SessionStatus, ResearchMessage } from '../entities'

   export interface IResearchRepository {
     createSession(platform: ResearchPlatform): Promise<ResearchSession>
     addMessage(sessionId: string, message: Omit<ResearchMessage, 'id' | 'timestamp'>): Promise<void>
     getSession(sessionId: string): Promise<ResearchSession | null>
     updateStatus(sessionId: string, status: SessionStatus): Promise<void>
   }
   ```

4. Обновить `frontend/src/domain/repositories/index.ts`:
   ```typescript
   export * from './IArticlesRepository'
   export * from './ICategoriesRepository'
   export * from './IResearchRepository'
   ```

**Validation**:
- [ ] Интерфейсы соответствуют контрактам из `contracts/repositories.ts`
- [ ] Все типы импортируются из `entities/`
- [ ] RepositoryError определён для обработки ошибок

**Files**:
- `frontend/src/domain/repositories/IArticlesRepository.ts` (~30 lines)
- `frontend/src/domain/repositories/ICategoriesRepository.ts` (~15 lines)
- `frontend/src/domain/repositories/IResearchRepository.ts` (~20 lines)
- `frontend/src/domain/repositories/index.ts` (~5 lines)

---

### T004: Создать ICacheProvider интерфейс

**Purpose**: Определить интерфейс для кеширования данных.

**Steps**:

1. Создать `frontend/src/domain/cache/ICacheProvider.ts`:
   ```typescript
   export interface ICacheProvider<T> {
     get(key: string): Promise<T | null>
     set(key: string, value: T, ttl?: number): Promise<void>
     invalidate(pattern: string): Promise<void>
     clear(): Promise<void>
   }

   export interface CacheOptions {
     defaultTtl: number        // seconds
     staleWhileRevalidate?: number
     maxEntries?: number
   }
   ```

2. Создать `frontend/src/domain/cache/index.ts`:
   ```typescript
   export * from './ICacheProvider'
   ```

**Validation**:
- [ ] Интерфейс соответствует контракту из `contracts/repositories.ts`
- [ ] Generic тип `<T>` позволяет кешировать любые данные
- [ ] Метод `invalidate` принимает glob pattern (например, "articles:*")

**Files**:
- `frontend/src/domain/cache/ICacheProvider.ts` (~20 lines)
- `frontend/src/domain/cache/index.ts` (~3 lines)

---

### T005: Настроить Nuxt imports для новой структуры

**Purpose**: Настроить Nuxt 3 автозагрузку для новых директорий.

**Steps**:

1. Обновить `frontend/nuxt.config.ts`:
   ```typescript
   export default defineNuxtConfig({
     // ... existing config ...

     imports: {
       // ... existing imports ...

       // Добавить новые директории для автозагрузки
       dirs: [
         'composables',  // existing
         'src/presentation/composables',  // NEW: Presentation layer
         // Примечание: use cases НЕ автоимпортируем - импортируем явно
       ]
     },

     // Добавить alias для удобства импортов
     alias: {
       // ... existing aliases ...
       '@domain': './src/domain',
       '@application': './src/application',
       '@infrastructure': './src/infrastructure',
       '@presentation': './src/presentation',
     }
   })
   ```

2. Проверить что Nuxt видит новые пути:
   - Запустить `yarn dev`
   - Проверить `console.log` в компоненте: `import { Article } from '@domain/entities'`

**Validation**:
- [ ] Nuxt запускается без ошибок
- [ ] Алиасы работают (можно импортировать `@domain/entities`)
- [ ] Auto-imports для `src/presentation/composables` работает

**Files**:
- `frontend/nuxt.config.ts` (изменения)

**Notes**:
- Use cases НЕ должны быть автоимпортируемы — импортируем явно для ясности зависимостей
- Алиасы упрощают импорты и делают архитектуру явной

---

### T006: Создать базовые unit тесты для interfaces

**Purpose**: Создать простые тесты для проверки интерфейсных контрактов.

**Steps**:

1. Создать `tests/domain/entities/Article.test.ts`:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { createArticleId } from '@/domain/entities'

   describe('ArticleId', () => {
     it('should create valid ArticleId', () => {
       const id = createArticleId(1)
       expect(id).toBe(1)
     })

     it('should throw error for non-positive ID', () => {
       expect(() => createArticleId(0)).toThrow('Invalid ArticleId')
       expect(() => createArticleId(-1)).toThrow('Invalid ArticleId')
     })
   })
   ```

2. Создать `tests/domain/repositories/IArticlesRepository.test.ts`:
   ```typescript
   import { describe, it } from 'vitest'
   import type { IArticlesRepository } from '@/domain/repositories'

   // Это интерфейсный тест - проверяем что интерфейс корректен
   describe('IArticlesRepository', () => {
     it('should define required methods', async () => {
       // Создаём mock для проверки интерфейса
       const mockRepo: IArticlesRepository = {
         findAll: async () => [],
         findBySlug: async () => null,
         findById: async () => null
       }

       expect(mockRepo.findAll).toBeDefined()
       expect(mockRepo.findBySlug).toBeDefined()
       expect(mockRepo.findById).toBeDefined()
     })
   })
   ```

**Validation**:
- [ ] Тесты запускаются (`yarn test` или `vitest`)
- [ ] Все тесты проходят
- [ ] Тесты проверяют основные контракты интерфейсов

**Files**:
- `tests/domain/entities/Article.test.ts` (~20 lines)
- `tests/domain/repositories/IArticlesRepository.test.ts` (~25 lines)

**Notes**:
- Это базовые тесты — полные тесты будут в следующих WP
- Пока мы только проверяем что структура корректна

---

## Definition of Done

- [ ] Все директории `frontend/src/` созданы
- [ ] Domain Entities определены (Article, Category, ResearchSession)
- [ ] Repository Interfaces определены
- [ ] ICacheProvider интерфейс создан
- [ ] Nuxt.config.ts обновлён с imports и aliases
- [ ] Базовые тесты созданы и проходят
- [ ] TypeScript компилируется без ошибок (`yarn build` или проверка типов)
- [ ] Nuxt dev server запускается (`yarn dev`)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Overengineering | Создавать только минимум абстракций. Не добавлять DDD, агрегаты, etc. |
| Nuxt imports не работают | Тестировать рано в T005. Если не работает, использовать явные импорты |
| SSR mode ломается | НЕ менять существующий код. Только добавлять новые файлы |
| Circular dependencies | Использовать `import type` для type-only импортов |

---

## Reviewer Guidance

**What to verify**:
1. Структура директорий соответствует плану
2. Интерфейсы соответствуют контрактам из `contracts/repositories.ts`
3. TypeScript без ошибок
4. Nuxt конфиг корректен
5. Тесты покрывают базовые контракты

**Red flags**:
- ❌ Изменения в существующем коде (components, pages, server)
- ❌ Слишком сложные абстракции (aggregates, factories, etc.)
- ❌ Circular dependencies в импортах
- ❌ Missing readonly в интерфейсах

**Green flags**:
- ✅ Чистые, простые интерфейсы
- ✅ Явные зависимости через импорты
- ✅ Factory functions для валидации
- ✅ Aliases для архитектурных слоёв

---

## Implementation Command

```bash
spec-kitty implement WP01
```

Эта команда создаст worktree для этого WP и настроит окружение для разработки.

## Activity Log

- 2026-02-21T11:23:10Z – unknown – lane=doing – Moved to doing
- 2026-02-21T11:23:31Z – claude – shell_pid=81618 – lane=doing – Assigned agent via workflow command
- 2026-02-21T11:28:22Z – claude – shell_pid=81618 – lane=for_review – Ready for review: All files committed, foundational structure complete.
- 2026-02-23T20:34:05Z – claude – shell_pid=3576 – lane=doing – Started review via workflow command
- 2026-02-23T20:39:15Z – claude – shell_pid=3576 – lane=done – Review passed: Foundation layer correctly implemented with all domain entities (Article, Category, ResearchSession), repository interfaces (IArticlesRepository, ICategoriesRepository, IResearchRepository), cache provider (ICacheProvider), and Nuxt configuration with aliases and auto-imports. All success criteria verified. Implementation exists in commit 05d8217 on main branch.
