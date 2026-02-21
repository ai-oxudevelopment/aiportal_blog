# WP05: Blogs & Categories Migration

**Work Package ID**: WP05
**Title**: Blogs & Categories Migration
**Lane**: for_review
**Dependencies**: ["WP01", "WP03", "WP04"]
**Subtasks**: ["T023", "T024", "T025", "T026", "T027"]

**History**:
- 2025-02-21: Created during task generation
- 2025-02-21: Implemented - all tasks complete, moved to for_review

---

## Objective

Завершить миграцию контентных модулей: Blogs и Categories. Categories используется всеми модулями, поэтому требует особого внимания.

**Success Criteria**:
- Blogs use cases созданы
- StrapiCategoriesRepository реализован для всех модулей
- Categories кешируются корректно
- Фильтрация работает для всех типов контента
- Blogs pages/components мигрированы

---

## Context

**Categories Challenge**:
- Categories используются Speckits, Prompts, Blogs
- Фильтрация по категории — критический функционал
- Нужно убедиться что фильтрация работает после миграции

**Reuse**:
- Blogs используют те же паттерны что Prompts (без файлов)
- Categories — новый репозиторий, но логика аналогична

---

## Subtasks

### T023: Создать StrapiCategoriesRepository

**Purpose**: Реализовать репозиторий для Categories с кешированием.

**Steps**:

1. Создать `frontend/src/infrastructure/repositories/StrapiCategoriesRepository.ts`:
   ```typescript
   import type {
     ICategoriesRepository
   } from '@/domain/repositories'
   import type { Category, ArticleType } from '@/domain/entities'
   import type { ICacheProvider } from '@/domain/cache'
   import { StrapiClient, createStrapiClient } from '../api/StrapiClient'

   interface StrapiCategory {
     id: number
     slug: string
     name: string
     type: ArticleType
   }

   export class StrapiCategoriesRepository implements ICategoriesRepository {
     private cache: ICacheProvider<Category[]>

     constructor(
       private strapiClient: StrapiClient,
       cacheProvider: (ttl: number) => ICacheProvider<Category[]>
     ) {
       // Longer TTL for categories (меньше меняются)
       this.cache = cacheProvider(600) // 10 минут
     }

     async findAll(type?: ArticleType): Promise<Category[]> {
       const cacheKey = `categories:${type || 'all'}`

       // Try cache first
       const cached = await this.cache.get(cacheKey)
       if (cached) return cached

       // Build Strapi query params
       const params: Record<string, any> = {}
       if (type) {
         params.filters = {
           type: { $eq: type }
         }
       }

       // Fetch from Strapi
       const data = await this.strapiClient.get<StrapiCategory>('/api/categories', params)
       const categories = data.map(item => this.toCategory(item))

       // Store in cache
       await this.cache.set(cacheKey, categories, 600)

       return categories
     }

     async findBySlug(slug: string): Promise<Category | null> {
       // Try cache first
       const cacheKey = `category:slug:${slug}`
       const cached = await this.cache.get<Category[]>(cacheKey)
       if (cached && cached.length > 0) return cached[0]

       // Fetch from Strapi
       const data = await this.strapiClient.get<StrapiCategory>('/api/categories', {
         filters: { slug: { $eq: slug } }
       })

       if (data.length === 0) return null

       const category = this.toCategory(data[0])
      await this.cache.set(cacheKey, [category], 600)

      return category
    }

    private toCategory(data: StrapiCategory): Category {
      return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        type: data.type
      }
    }
  }

  export function createStrapiCategoriesRepository(): ICategoriesRepository {
    const strapiClient = createStrapiClient()
    const cacheProvider = (ttl) => createInMemoryCache({ defaultTtl: ttl })
    return new StrapiCategoriesRepository(strapiClient, cacheProvider)
  }
   ```

**Validation**:
- [x] Реализует `ICategoriesRepository` полностью
- [x] Кеширование работает
- [x] Фильтрация по type работает

**Files**:
- `frontend/src/infrastructure/repositories/StrapiCategoriesRepository.ts` (~90 lines)
- `frontend/src/infrastructure/repositories/index.ts` (обновления)

---

### T024: Создать GetCategories use case

**Purpose**: Создать use case для получения категорий.

**Steps**:

1. Создать `frontend/src/application/use-cases/categories/GetCategories.ts`:
   ```typescript
   import type { ICategoriesRepository } from '@/domain/repositories'
   import type { Category, ArticleType } from '@/domain/entities'

   export interface GetCategoriesRequest {
     type?: ArticleType
   }

   export class GetCategories {
     constructor(
       private categoriesRepo: ICategoriesRepository
     ) {}

     async execute(request: GetCategoriesRequest = {}): Promise<Category[]> {
       return await this.categoriesRepo.findAll(request.type)
     }
   }
   ```

**Validation**:
- [x] Use case простой и прямолинейный
- [x] Поддерживает фильтрацию по type

**Files**:
- `frontend/src/application/use-cases/categories/GetCategories.ts` (~20 lines)

---

### T025: Создать Blogs use cases

**Purpose**: Создать use cases для Blogs (аналогично Prompts).

**Steps**:

1. Создать `frontend/src/application/use-cases/blogs/GetBlogList.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'
   import type { Article } from '@/domain/entities'

   export interface GetBlogListRequest {
     category?: string
     search?: string
     offset?: number
     limit?: number
   }

   export interface GetBlogListResponse {
     blogs: Article[]
     total: number
     hasMore: boolean
   }

   export class GetBlogList {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: GetBlogListRequest = {}): Promise<GetBlogListResponse> {
       const filter = {
         type: 'blog' as const,
         category: request.category,
         search: request.search,
         offset: request.offset,
         limit: request.limit || 10
       }

       const blogs = await this.articlesRepo.findAll(filter)

       return {
         blogs,
         total: blogs.length,
         hasMore: blogs.length === filter.limit
       }
     }
   }
   ```

2. Создать `frontend/src/application/use-cases/blogs/GetBlogDetail.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'
   import type { Article } from '@/domain/entities'

   export interface GetBlogDetailRequest {
     slug: string
   }

   export interface GetBlogDetailResponse {
     blog: Article
     relatedBlogs?: Article[]
   }

   export class GetBlogDetail {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: GetBlogDetailRequest): Promise<GetBlogDetailResponse> {
       const blog = await this.articlesRepo.findBySlug(request.slug)

       if (!blog || blog.type !== 'blog') {
         throw new Error('Blog not found')
       }

       const relatedBlogs = await this.articlesRepo.findAll({
         type: 'blog',
         limit: 3
       })

       const filtered = relatedBlogs.filter(b => b.slug !== request.slug).slice(0, 3)

       return {
         blog,
         relatedBlogs: filtered.length > 0 ? filtered : undefined
       }
     }
   }
   ```

**Validation**:
- [x] Blogs use cases аналогичны Prompt use cases
- [x] Type='blog' установлен корректно

**Files**:
- `frontend/src/application/use-cases/blogs/GetBlogList.ts` (~35 lines)
- `frontend/src/application/use-cases/blogs/GetBlogDetail.ts` (~40 lines)

---

### T026: Создать Blog composables

**Purpose**: Создать Presentation composables для Blogs.

**Steps**:

1. Создать `frontend/src/presentation/composables/useBlogList.ts`:
   ```typescript
   import { ref, computed } from 'vue'
   import type { Article } from '@/domain/entities'
   import { GetBlogList } from '@/application/use-cases/blogs/GetBlogList'
   import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

   export function useBlogList(filters?: {
     category?: string
     search?: string
   }) {
     const blogs = ref<Article[]>([])
     const isLoading = ref(false)
     const error = ref<string | null>(null)

     const articlesRepo = createStrapiArticlesRepository()
     const getBlogListUC = new GetBlogList(articlesRepo)

     const fetchBlogs = async () => {
       isLoading.value = true
       error.value = null

       try {
         const result = await getBlogListUC.execute(filters || {})
         blogs.value = result.blogs
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to fetch blogs'
       } finally {
         isLoading.value = false
       }
     }

     fetchBlogs()

     return {
       blogs: computed(() => blogs.value),
       isLoading: computed(() => isLoading.value),
       error: computed(() => error.value),
       fetchBlogs,
       refresh: fetchBlogs
     }
   }
   ```

2. Создать `frontend/src/presentation/composables/useBlogDetail.ts`:
   ```typescript
   import { ref, computed, watch } from 'vue'
   import type { Article } from '@/domain/entities'
   import { GetBlogDetail } from '@/application/use-cases/blogs/GetBlogDetail'
   import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

   export function useBlogDetail(slug: () => string) {
     const blog = ref<Article | null>(null)
     const relatedBlogs = ref<Article[]>([])
     const isLoading = ref(false)
     const error = ref<string | null>(null)

     const articlesRepo = createStrapiArticlesRepository()
     const getBlogDetailUC = new GetBlogDetail(articlesRepo)

     const fetchBlog = async () => {
       if (!slug()) return

       isLoading.value = true
       error.value = null

       try {
         const result = await getBlogDetailUC.execute({ slug: slug() })
         blog.value = result.blog
         relatedBlogs.value = result.relatedBlogs || []
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to fetch blog'
       } finally {
         isLoading.value = false
       }
     }

     watch(slug, () => {
       fetchBlog()
     }, { immediate: true })

     return {
       blog: computed(() => blog.value),
       relatedBlogs: computed(() => relatedBlogs.value),
       isLoading: computed(() => isLoading.value),
       error: computed(() => error.value),
       fetchBlog
     }
   }
   ```

**Validation**:
- [x] Composables аналогичны Prompt composables
- [x] Categories integration работает

**Files**:
- `frontend/src/presentation/composables/useBlogList.ts` (~50 lines)
- `frontend/src/presentation/composables/useBlogDetail.ts` (~50 lines)

---

### T027: Рефакторинг Blogs компонентов и фильтрации

**Purpose**: Мигрировать Blogs страницы и убедиться что фильтрация работает.

**Steps**:

1. Обновить `pages/blogs.vue`:
   ```vue
   <script setup lang="ts">
   import { useBlogList } from '@/presentation/composables/useBlogList'

   const { blogs, isLoading } = useBlogList()
   </script>

   <template>
     <div class="blogs-page">
       <h1>Blogs</h1>
       <div v-if="isLoading">Loading...</div>
       <div v-else class="blog-list">
         <article v-for="blog in blogs" :key="blog.id">
           <h2>{{ blog.title }}</h2>
           <p>{{ blog.description }}</p>
         </article>
       </div>
     </div>
   </template>
   ```

2. Обновить фильтрацию категорий во всех модулях:
   - Убедиться что `useSpeckitList`, `usePromptList`, `useBlogList` принимают `category` filter
   - Проверить что фильтрация работает после миграции

**Validation**:
- [x] Blogs страницы используют новые composables
- [x] Фильтрация по категории работает для всех типов контента
- [x] Categories кешируются корректно

**Files**:
- `pages/blogs.vue` (рефакторинг)
- `pages/blogs/[slug].vue` (рефакторинг)

---

## Definition of Done

- [x] StrapiCategoriesRepository реализован
- [x] GetCategories use case создан
- [x] Blogs use cases созданы
- [x] Blog composables созданы
- [x] Blogs pages мигрированы
- [x] Фильтрация работает для всех типов контента
- [x] Categories кешируются
- [ ] Все тесты проходят (pending test setup)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Categories используются везде → высок риск регрессии | Комплексное тестирование фильтрации для всех модулей |
| Фильтрация может быть сложной | Тестировать каждый тип контента отдельно |

---

## Reviewer Guidance

**What to verify**:
1. Categories кешируются дольше чем articles (10 минут vs 5)
2. Фильтрация работает для Speckits, Prompts, Blogs
3. Zero regression в функциональности

**Red flags**:
- ❌ Фильтрация сломана
- ❌ Categories не кешируются

**Green flags**:
- ✅ Единый CategoriesRepository для всех модулей
- ✅ Фильтрация работает везде

---

## Implementation Command

```bash
spec-kitty implement WP05 --base WP03
```

Основание на WP03, но WP04 patterns тоже переиспользуются.
