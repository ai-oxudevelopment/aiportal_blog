---
lane: "done"
agent: "claude"
shell_pid: "3656"
reviewed_by: "ALeks ishmanov"
review_status: "approved"
---
# WP03: Speckits Module Migration

**Work Package ID**: WP03
**Title**: Speckits Module Migration
**Lane**: for_review
**Dependencies**: ["WP01", "WP02"]
**Subtasks**: ["T012", "T013", "T014", "T015", "T016", "T017", "T018"]

**History**:
- 2025-02-21: Created during task generation
- 2025-02-21: Implementation completed - all core components created

---

## Objective

Полностью мигрировать Speckits модуль на новую архитектуру. Это самый сложный контентный модуль с files, diagrams, FAQ. Он устанавливает паттерны для WP04-WP05.

**Success Criteria**:
- Speckit use cases созданы (GetSpeckitList, GetSpeckitDetail, DownloadSpeckitFile)
- StrapiArticlesRepository реализован с кешированием
- Speckit composables созданы
- Speckit pages/components используют только presentation layer
- File download работает через use case
- Diagram data обрабатывается корректно
- Zero regression в функциональности Speckits

---

## Context

**Current State**:
- `pages/speckits/[speckitSlug].vue` — детальная страница speckit
- `server/api/speckits.get.ts` — список speckits
- `server/api/speckits/[slug].get.ts` — детальный speckit
- `server/api/speckits/[slug]/diagram.get.ts` — диаграммы
- `components/speckit/*` — SpeckitCard, SpeckitDetail, etc.
- `composables/useFetchArticles.ts` — текущая логика загрузки

**Target State**:
- `src/application/use-cases/speckits/` — бизнес-логика
- `src/infrastructure/repositories/StrapiArticlesRepository.ts` — с кешированием
- `src/presentation/composables/useSpeckitList.ts`, `useSpeckitDetail.ts`
- Components упрощены до чистого UI

**Key Pattern**: Этот WP устанавливает шаблон для контентных модулей. Prompts и Blogs будут переиспользовать эти паттерны.

---

## Subtasks

### T012: Создать InMemoryCacheProvider реализацию

**Purpose**: Реализовать in-memory кеш для Infrastructure Layer.

**Steps**:

1. Создать `frontend/src/infrastructure/cache/InMemoryCacheProvider.ts`:
   ```typescript
   import type { ICacheProvider } from '@/domain/cache'

   interface CacheEntry<T> {
     value: T
     expires: number
   }

   export class InMemoryCacheProvider<T> implements ICacheProvider<T> {
     private cache = new Map<string, CacheEntry<T>>()
     private cleanupInterval: NodeJS.Timeout | null = null

     constructor(private options = { defaultTtl: 300, maxEntries: 1000 }) {
       // Очистка просроченных записей каждые 60 секунд
       this.cleanupInterval = setInterval(() => {
         this.cleanup()
       }, 60000)
     }

     async get(key: string): Promise<T | null> {
       const entry = this.cache.get(key)
       if (!entry) return null

       if (Date.now() > entry.expires) {
         this.cache.delete(key)
         return null
       }

       return entry.value
     }

     async set(key: string, value: T, ttl?: number): Promise<void> {
       const expires = Date.now() + (ttl || this.options.defaultTtl) * 1000

       // Проверяем лимит записей
       if (this.cache.size >= this.options.maxEntries) {
         // Удаляем самую старую запись (простая стратегия)
         const firstKey = this.cache.keys().next().value
         this.cache.delete(firstKey)
       }

       this.cache.set(key, { value, expires })
     }

     async invalidate(pattern: string): Promise<void> {
       const regex = new RegExp(pattern.replace('*', '.*'))
       for (const key of this.cache.keys()) {
         if (regex.test(key)) {
           this.cache.delete(key)
         }
       }
     }

     async clear(): Promise<void> {
       this.cache.clear()
     }

     private cleanup(): void {
       const now = Date.now()
       for (const [key, entry] of this.cache.entries()) {
         if (now > entry.expires) {
           this.cache.delete(key)
         }
       }
     }

     destroy(): void {
       if (this.cleanupInterval) {
         clearInterval(this.cleanupInterval)
       }
     }
   }
   ```

2. Создать factory:
   ```typescript
   // frontend/src/infrastructure/cache/index.ts
   export function createInMemoryCache<T>(
     options?: { defaultTtl?: number; maxEntries?: number }
   ): ICacheProvider<T> {
     return new InMemoryCacheProvider<T>(options)
   }
   ```

**Validation**:
- [ ] Реализует `ICacheProvider<T>` полностью
- [ ] TTL работает (просроченные записи не возвращаются)
- [ ] Invalidate работает с glob patterns
- [ ] Max entries limit соблюдается
- [ ] Cleanup interval очищает просроченные записи

**Files**:
- `frontend/src/infrastructure/cache/InMemoryCacheProvider.ts` (~80 lines)
- `frontend/src/infrastructure/cache/index.ts` (~10 lines)

---

### T013: Создать StrapiClient для работы с Strapi API

**Purpose**: Создать универсальный клиент для Strapi API с нормализацией ответов.

**Steps**:

1. Создать `frontend/src/infrastructure/api/StrapiClient.ts`:
   ```typescript
   interface StrapiConfig {
     url: string
     apiKey?: string
     version: 'v4' | 'v5'
   }

   interface StrapiResponse<T> {
     data: T
     meta?: {
       pagination?: {
         page: number
         pageSize: number
         pageCount: number
         total: number
       }
     }
   }

   interface StrapiError {
     error: {
       status: number
       name: string
       message: string
     }
   }

   export class StrapiClient {
     constructor(private config: StrapiConfig) {}

     async get<T>(endpoint: string, params?: Record<string, any>): Promise<T[]> {
       const url = new URL(endpoint, this.config.url)

       // Add query params
       if (params) {
         // Strapi specific params
         if (params.populate) {
           url.searchParams.set('populate', params.populate)
         }
         if (params.filters) {
           // Strapi v5 filters format
           url.searchParams.set('filters', JSON.stringify(params.filters))
         }
         if (params.sort) {
           url.searchParams.set('sort', params.sort)
         }
         if (params.pagination) {
           url.searchParams.set('pagination', JSON.stringify(params.pagination))
         }
       }

       const headers: Record<string, string> = {
         'Content-Type': 'application/json'
       }

       if (this.config.apiKey) {
         headers['Authorization'] = `Bearer ${this.config.apiKey}`
       }

       const response = await fetch(url.toString(), { headers })

       if (!response.ok) {
         const error: StrapiError = await response.json()
         throw new Error(`Strapi error: ${error.error.message}`)
       }

       const json: StrapiResponse<T[]> = await response.json()

       // Normalize Strapi response
       return this.normalizeData(json.data)
     }

     async getOne<T>(endpoint: string, id: string | number): Promise<T | null> {
       const url = new URL(`${endpoint}/${id}`, this.config.url)

       const headers: Record<string, string> = {
         'Content-Type': 'application/json'
       }

       if (this.config.apiKey) {
         headers['Authorization'] = `Bearer ${this.config.apiKey}`
       }

       const response = await fetch(url.toString(), { headers })

       if (response.status === 404) return null
       if (!response.ok) {
         const error: StrapiError = await response.json()
         throw new Error(`Strapi error: ${error.error.message}`)
       }

       const json: StrapiResponse<T> = await response.json()
       return this.normalizeData(json.data)
     }

     private normalizeData<T>(data: T | T[]): T {
       // Strapi v5 returns data directly, v4 wraps in attributes
       if (this.config.version === 'v5') {
         return data as T
       }

       // v4 normalization
       if (Array.isArray(data)) {
         return data.map(item => this.normalizeItem(item)) as T
      }
       return this.normalizeItem(data) as T
     }

     private normalizeItem(item: any): any {
       if (item.attributes) {
         return {
           id: item.id,
           ...item.attributes
         }
       }
       return item
     }
   }

   export function createStrapiClient(config?: Partial<StrapiConfig>): StrapiClient {
     return new StrapiClient({
       url: process.env.STRAPI_URL || 'http://localhost:1337',
       apiKey: process.env.STRAPI_API_KEY,
       version: 'v5',
       ...config
     })
   }
   ```

**Validation**:
- [ ] Client работает с Strapi v4 и v5
- [ ] Нормализация ответов корректна
- [ ] Ошибки обрабатываются
- [ ] Query params формат правильный

**Files**:
- `frontend/src/infrastructure/api/StrapiClient.ts` (~120 lines)

---

### T014: Создать StrapiArticlesRepository

**Purpose**: Реализовать репозиторий для Articles (Speckits, Prompts) с кешированием.

**Steps**:

1. Создать `frontend/src/infrastructure/repositories/StrapiArticlesRepository.ts`:
   ```typescript
   import type {
     IArticlesRepository,
     ArticleFilter,
     RepositoryError
   } from '@/domain/repositories'
   import type { Article, ArticleId, ArticleType } from '@/domain/entities'
   import type { ICacheProvider } from '@/domain/cache'
   import { StrapiClient, createStrapiClient } from '../api/StrapiClient'

   interface StrapiArticle {
     id: number
     slug: string
     title: string
     description: string
     body: string
     type: ArticleType
     category: {
       data: {
         id: number
         attributes: {
           slug: string
           name: string
           type: ArticleType
         }
       }
     }
     file?: {
       data: {
         id: string
         attributes: {
           name: string
           url: string
           size: number
           mime: string
         }
       }
     }
     diagram?: {
       data: {
         id: string
         attributes: {
           format: string
           content: string
         }
       }
     }
     faq?: {
       data: Array<{
         id: string
         attributes: {
           question: string
           answer: string
           order: number
         }
       }>
     }
     createdAt: string
     updatedAt: string
   }

   export class StrapiArticlesRepository implements IArticlesRepository {
     private cache: ICacheProvider<Article[]>

     constructor(
       private strapiClient: StrapiClient,
       cacheProvider: (ttl: number) => ICacheProvider<Article[]>
     ) {
       this.cache = cacheProvider(300) // 5 минут TTL
     }

     async findAll(filter?: ArticleFilter): Promise<Article[]> {
       const cacheKey = `articles:${JSON.stringify(filter || {})}`

       // Try cache first
       const cached = await this.cache.get(cacheKey)
       if (cached) return cached

       // Build Strapi query params
       const params: Record<string, any> = {
         populate: ['category', 'file', 'diagram', 'faq']
       }

       if (filter?.type) {
         params.filters = {
           type: { $eq: filter.type }
         }
       }

       if (filter?.category) {
         params.filters = {
           ...params.filters,
           category: { slug: { $eq: filter.category } }
         }
       }

       if (filter?.search) {
         params.filters = {
           ...params.filters,
           $or: [
             { title: { $containsi: filter.search } },
             { description: { $containsi: filter.search } }
           ]
         }
       }

       if (filter?.sort) {
         params.sort = filter.sort
       }

       if (filter?.offset || filter?.limit) {
         params.pagination = {
           page: Math.floor((filter.offset || 0) / (filter.limit || 10)) + 1,
           pageSize: filter.limit || 10
         }
       }

       // Fetch from Strapi
       const data = await this.strapiClient.get<StrapiArticle>('/api/articles', params)
       const articles = data.map(item => this.toArticle(item))

       // Store in cache
       await this.cache.set(cacheKey, articles, 300)

       return articles
     }

     async findBySlug(slug: string): Promise<Article | null> {
       // Try cache first
       const cacheKey = `article:slug:${slug}`
       const cached = await this.cache.get<Article[]>(cacheKey)
       if (cached && cached.length > 0) return cached[0]

       // Fetch from Strapi with filter
       const data = await this.strapiClient.get<StrapiArticle>('/api/articles', {
         filters: { slug: { $eq: slug } },
         populate: ['category', 'file', 'diagram', 'faq']
       })

       if (data.length === 0) return null

       const article = this.toArticle(data[0])

      // Cache single result
      await this.cache.set(cacheKey, [article], 300)

      return article
     }

     async findById(id: ArticleId): Promise<Article | null> {
      const cacheKey = `article:id:${id}`
      const cached = await this.cache.get<Article[]>(cacheKey)
      if (cached && cached.length > 0) return cached[0]

      const data = await this.strapiClient.getOne<StrapiArticle>('/api/articles', id)
      if (!data) return null

      const article = this.toArticle(data)
      await this.cache.set(cacheKey, [article], 300)

      return article
    }

    private toArticle(data: StrapiArticle): Article {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        body: data.body,
        type: data.type,
        category: {
          id: data.category.data.id,
          slug: data.category.data.attributes.slug,
          name: data.category.data.attributes.name,
          type: data.category.data.attributes.type
        },
        file: data.file?.data ? {
          id: data.file.data.id,
          name: data.file.data.attributes.name,
          url: data.file.data.attributes.url,
          size: data.file.data.attributes.size,
          mimeType: data.file.data.attributes.mime
        } : undefined,
        diagram: data.diagram?.data ? {
          format: data.diagram.data.attributes.format,
          content: data.diagram.data.attributes.content
        } : undefined,
        faq: data.faq?.data.map(item => ({
          question: item.attributes.question,
          answer: item.attributes.answer,
          order: item.attributes.order
        })),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }
    }
  }

  export function createStrapiArticlesRepository(): IArticlesRepository {
    const strapiClient = createStrapiClient()
    const cacheProvider = (ttl) => createInMemoryCache({ defaultTtl: ttl })
    return new StrapiArticlesRepository(strapiClient, cacheProvider)
  }
   ```

**Validation**:
- [ ] Реализует все методы `IArticlesRepository`
- [ ] Кеширование работает для всех методов
- [ ] Strapi response конвертируется в Domain entities
- [ ] Filter поддерживает все параметры (type, category, search)

**Files**:
- `frontend/src/infrastructure/repositories/StrapiArticlesRepository.ts` (~180 lines)
- `frontend/src/infrastructure/repositories/index.ts` (обновления)

---

### T015: Создать GetSpeckitList use case

**Purpose**: Создать use case для получения списка speckits с фильтрацией.

**Steps**:

1. Создать `frontend/src/application/use-cases/speckits/GetSpeckitList.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'
   import type { Article } from '@/domain/entities'

   export interface GetSpeckitListRequest {
     category?: string
     search?: string
     offset?: number
     limit?: number
   }

   export interface GetSpeckitListResponse {
     speckits: Article[]
     total: number
     hasMore: boolean
   }

   export class GetSpeckitList {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: GetSpeckitListRequest = {}): Promise<GetSpeckitListResponse> {
       // Всегда фильтруем только speckits
       const filter = {
         type: 'speckit' as const,
         category: request.category,
         search: request.search,
         offset: request.offset,
         limit: request.limit || 20
       }

       const speckits = await this.articlesRepo.findAll(filter)

       return {
         speckits,
         total: speckits.length,
        hasMore: speckits.length === filter.limit
      }
    }
  }
   ```

**Validation**:
- [ ] Use case возвращает только speckits (type='speckit')
- [ ] Фильтры работают корректно
- [ ] Пагинация поддерживается

**Files**:
- `frontend/src/application/use-cases/speckits/GetSpeckitList.ts` (~40 lines)

---

### T016: Создать GetSpeckitDetail use case

**Purpose**: Создать use case для получения детальной информации о speckit.

**Steps**:

1. Создать `frontend/src/application/use-cases/speckits/GetSpeckitDetail.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'
   import type { Article } from '@/domain/entities'

   export interface GetSpeckitDetailRequest {
     slug: string
   }

   export interface GetSpeckitDetailResponse {
     speckit: Article
     relatedSpeckits?: Article[]
   }

   export class GetSpeckitDetail {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: GetSpeckitDetailRequest): Promise<GetSpeckitDetailResponse> {
       // Получаем speckit по slug
       const speckit = await this.articlesRepo.findBySlug(request.slug)

       if (!speckit || speckit.type !== 'speckit') {
         throw new Error('Speckit not found')
       }

       // Получаем связанные speckits из той же категории
       const relatedSpeckits = await this.articlesRepo.findAll({
         type: 'speckit',
         category: speckit.category.slug,
         limit: 3
       })

       // Фильтруем текущий speckit
       const filtered = relatedSpeckits.filter(s => s.slug !== request.slug).slice(0, 3)

       return {
         speckit,
         relatedSpeckits: filtered.length > 0 ? filtered : undefined
       }
     }
   }
   ```

**Validation**:
- [ ] Use case выбрасывает ошибку если speckit не найден
- [ ] Связанные speckиты получаются корректно
- [ ] Текущий speckit исключается из related

**Files**:
- `frontend/src/application/use-cases/speckits/GetSpeckitDetail.ts` (~45 lines)

---

### T017: Создать DownloadSpeckitFile use case

**Purpose**: Создать use case для скачивания файла speckit.

**Steps**:

1. Создать `frontend/src/application/use-cases/speckits/DownloadSpeckitFile.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'

   export interface DownloadSpeckitFileRequest {
     speckitSlug: string
   }

   export interface DownloadSpeckitFileResponse {
     blob: Blob
     filename: string
     mimeType: string
   }

   export class DownloadSpeckitFile {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: DownloadSpeckitFileRequest): Promise<DownloadSpeckitFileResponse> {
       // Получаем speckit
       const speckit = await this.articlesRepo.findBySlug(request.speckitSlug)

       if (!speckit) {
         throw new Error('Speckit not found')
       }

       if (!speckit.file) {
         throw new Error('Speckit has no file attachment')
       }

       // Скачиваем файл
       const response = await fetch(speckit.file.url)

       if (!response.ok) {
         throw new Error(`Failed to download file: ${response.statusText}`)
       }

       const blob = await response.blob()

       return {
         blob,
         filename: speckit.file.name,
         mimeType: speckit.file.mimeType
       }
     }
   }
   ```

**Validation**:
- [ ] Use case проверяет наличие файла
- [ ] File скачивается корректно
- [ ] Filename и mimeType возвращаются для UI

**Files**:
- `frontend/src/application/use-cases/speckits/DownloadSpeckitFile.ts` (~50 lines)

---

### T018: Создать Speckit composables и рефакторинг компонентов

**Purpose**: Создать Presentation composables и упростить компоненты.

**Steps**:

1. Создать `frontend/src/presentation/composables/useSpeckitList.ts`:
   ```typescript
   import { ref, computed } from 'vue'
   import type { Article } from '@/domain/entities'
   import { GetSpeckitList } from '@/application/use-cases/speckits/GetSpeckitList'
   import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

   export function useSpeckitList(filters?: {
     category?: string
     search?: string
   }) {
     const speckits = ref<Article[]>([])
     const isLoading = ref(false)
     const error = ref<string | null>(null)

     const articlesRepo = createStrapiArticlesRepository()
     const getSpeckitListUC = new GetSpeckitList(articlesRepo)

     const fetchSpeckits = async () => {
       isLoading.value = true
       error.value = null

       try {
         const result = await getSpeckitListUC.execute(filters || {})
         speckits.value = result.speckits
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to fetch speckits'
       } finally {
         isLoading.value = false
       }
     }

     // Load on mount
     fetchSpeckits()

     return {
       speckits: computed(() => speckits.value),
       isLoading: computed(() => isLoading.value),
       error: computed(() => error.value),
      fetchSpeckits,
      refresh: fetchSpeckits
    }
  }
   ```

2. Создать `frontend/src/presentation/composables/useSpeckitDetail.ts`:
   ```typescript
   import { ref, computed } from 'vue'
   import type { Article } from '@/domain/entities'
   import { GetSpeckitDetail } from '@/application/use-cases/speckits/GetSpeckitDetail'
   import { DownloadSpeckitFile } from '@/application/use-cases/speckits/DownloadSpeckitFile'
   import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

   export function useSpeckitDetail(slug: () => string) {
     const speckit = ref<Article | null>(null)
     const relatedSpeckits = ref<Article[]>([])
     const isLoading = ref(false)
     const error = ref<string | null>(null)
     const isDownloading = ref(false)

     const articlesRepo = createStrapiArticlesRepository()
     const getSpeckitDetailUC = new GetSpeckitDetail(articlesRepo)
     const downloadUC = new DownloadSpeckitFile(articlesRepo)

     const fetchSpeckit = async () => {
       if (!slug()) return

      isLoading.value = true
      error.value = null

      try {
        const result = await getSpeckitDetailUC.execute({ slug: slug() })
        speckit.value = result.speckit
        relatedSpeckits.value = result.relatedSpeckits || []
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to fetch speckit'
      } finally {
        isLoading.value = false
      }
     }

    const downloadFile = async () => {
      if (!speckit.value) return

      isDownloading.value = true
      error.value = null

      try {
        const result = await downloadUC.execute({ speckitSlug: speckit.value.slug })

        // Trigger browser download
        const url = URL.createObjectURL(result.blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to download file'
      } finally {
        isDownloading.value = false
      }
    }

    // Watch for slug changes
    watch(slug, () => {
      fetchSpeckit()
    }, { immediate: true })

    return {
      speckit: computed(() => speckit.value),
      relatedSpeckits: computed(() => relatedSpeckits.value),
      isLoading: computed(() => isLoading.value),
      isDownloading: computed(() => isDownloading.value),
      error: computed(() => error.value),
      fetchSpeckit,
      downloadFile
    }
  }
   ```

3. Обновить компоненты:
   - `components/speckit/SpeckitCard.vue` — использовать `useSpeckitList`
   - `components/speckit/SpeckitDetail.vue` — использовать `useSpeckitDetail`
   - `pages/speckits/[speckitSlug].vue` — использовать `useSpeckitDetail`

**Validation**:
- [ ] Composables возвращают реактивный state
- [ ] Components используют только composables
- [ ] File download работает
- [ ] Related speckits отображаются

**Files**:
- `frontend/src/presentation/composables/useSpeckitList.ts` (~60 lines)
- `frontend/src/presentation/composables/useSpeckitDetail.ts` (~90 lines)
- `components/speckit/*` (рефакторинг)
- `pages/speckits/[speckitSlug].vue` (рефакторинг)

---

## Definition of Done

- [ ] InMemoryCacheProvider реализован
- [ ] StrapiClient создан
- [ ] StrapiArticlesRepository реализован с кешированием
- [ ] GetSpeckitList, GetSpeckitDetail, DownloadSpeckitFile use cases созданы
- [ ] useSpeckitList, useSpeckitDetail composables созданы
- [ ] Speckit components/pages рефакторены
- [ ] File download работает
- [ ] Diagram data обрабатывается
- [ ] Все тесты проходят
- [ ] Zero regression в функциональности

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Speckits самый сложный модуль | Разбить на подзадачи, тестировать каждую |
| File download может не работать | Тестировать отдельно, обрабатывать ошибки |
| Diagram rendering сложный | Сохранить существующую логику рендеринга, менять только данные |
| Много компонентов для рефакторинга | Приоритизировать: сначала critical path |

---

## Reviewer Guidance

**What to verify**:
1. Кеширование работает (второй запрос быстрее)
2. File скачивается корректно
3. Components не содержат бизнес-логики
4. Связанные speckits получаются из той же категории

**Red flags**:
- ❌ Кеширование не работает (каждый запрос к API)
- ❌ Components знают про Strapi
- ❌ File download ломает CORS

**Green flags**:
- ✅ Components простые и декларативные
- ✅ Use cases покрывают все сценарии
- ✅ Паттерны готовы для переиспользования в WP04

---

## Implementation Command

```bash
spec-kitty implement WP03 --base WP01
```

Основание на WP01, но WP02 patterns тоже полезны.

## Activity Log

- 2026-02-23T20:24:37Z – claude – shell_pid=1237 – lane=doing – Started implementation via workflow command
- 2026-02-23T20:31:10Z – claude – shell_pid=1237 – lane=for_review – Ready for review: Speckits module migration complete with caching, StrapiClient, and use cases
- 2026-02-23T20:34:12Z – claude – shell_pid=3656 – lane=doing – Started review via workflow command
- 2026-02-23T20:39:39Z – claude – shell_pid=3656 – lane=done – Review passed: Speckits module correctly migrated with cache, client, and all use cases
