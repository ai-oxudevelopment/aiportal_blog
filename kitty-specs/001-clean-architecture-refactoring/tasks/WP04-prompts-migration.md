# WP04: Prompts Module Migration

**Work Package ID**: WP04
**Title**: Prompts Module Migration
**Lane**: for_review
**Dependencies**: ["WP01", "WP03"]
**Subtasks**: ["T019", "T020", "T021", "T022"]

**History**:
- 2025-02-21: Created during task generation
- 2025-02-21: Implementation complete, moved to for_review

---

## Objective

Мигрировать Prompts модуль, переиспользуя паттерны из Speckits (WP03). Это должно быть быстрее, так как паттерны уже обкатаны.

**Success Criteria**:
- Prompts use cases созданы
- Prompts переиспользуют StrapiArticlesRepository
- Prompt composables созданы
- Prompt pages/components мигрированы
- Zero code duplication между Prompts и Speckits
- Миграция заняла меньше времени чем Speckits

---

## Context

**Key Insight**: Prompts — это упрощённая версия Speckits. Используем те же паттерны, но без файлов и диаграмм.

**Reuse from WP03**:
- `StrapiArticlesRepository` — уже реализован, используем с `type='prompt'`
- `InMemoryCacheProvider` — переиспользуем
- `StrapiClient` — переиспользуем

**What's Different**:
- Prompts не имеют file attachments
- Prompts не имеют diagrams
- Prompts не имеют FAQ

---

## Subtasks

### T019: Создать GetPromptList use case

**Purpose**: Создать use case для получения списка prompts, переиспользуя паттерн из Speckits.

**Steps**:

1. Создать `frontend/src/application/use-cases/prompts/GetPromptList.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'
   import type { Article } from '@/domain/entities'

   export interface GetPromptListRequest {
     category?: string
     search?: string
     offset?: number
     limit?: number
   }

   export interface GetPromptListResponse {
     prompts: Article[]
     total: number
     hasMore: boolean
   }

   export class GetPromptList {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: GetPromptListRequest = {}): Promise<GetPromptListResponse> {
       // Фильтруем только prompts (type='prompt')
       const filter = {
         type: 'prompt' as const,
         category: request.category,
         search: request.search,
         offset: request.offset,
         limit: request.limit || 20
       }

       const prompts = await this.articlesRepo.findAll(filter)

       return {
         prompts,
         total: prompts.length,
         hasMore: prompts.length === filter.limit
       }
     }
   }
   ```

**Validation**:
- [ ] Use case идентичен GetSpeckitList, только type='prompt'
- [ ] Никакого дублирования кода — можно вынести общий base class

**Files**:
- `frontend/src/application/use-cases/prompts/GetPromptList.ts` (~35 lines)

**Note**: Если есть дублирование с GetSpeckitList, создать base class `GetArticleList` с параметром type.

---

### T020: Создать GetPromptDetail use case

**Purpose**: Создать use case для детальной информации о prompt.

**Steps**:

1. Создать `frontend/src/application/use-cases/prompts/GetPromptDetail.ts`:
   ```typescript
   import type { IArticlesRepository } from '@/domain/repositories'
   import type { Article } from '@/domain/entities'

   export interface GetPromptDetailRequest {
     slug: string
   }

   export interface GetPromptDetailResponse {
     prompt: Article
     relatedPrompts?: Article[]
   }

   export class GetPromptDetail {
     constructor(
       private articlesRepo: IArticlesRepository
     ) {}

     async execute(request: GetPromptDetailRequest): Promise<GetPromptDetailResponse> {
       const prompt = await this.articlesRepo.findBySlug(request.slug)

       if (!prompt || prompt.type !== 'prompt') {
         throw new Error('Prompt not found')
       }

       // Получаем связанные prompts из той же категории
       const relatedPrompts = await this.articlesRepo.findAll({
         type: 'prompt',
         category: prompt.category.slug,
         limit: 3
       })

       const filtered = relatedPrompts.filter(p => p.slug !== request.slug).slice(0, 3)

       return {
         prompt,
         relatedPrompts: filtered.length > 0 ? filtered : undefined
       }
     }
   }
   ```

**Validation**:
- [ ] Аналогичен GetSpeckitDetail
- [ ] Никакой файловой логики (у prompts нет файлов)

**Files**:
- `frontend/src/application/use-cases/prompts/GetPromptDetail.ts` (~40 lines)

---

### T021: Создать Prompt composables

**Purpose**: Создать Presentation composables для Prompts.

**Steps**:

1. Создать `frontend/src/presentation/composables/usePromptList.ts`:
   ```typescript
   import { ref, computed } from 'vue'
   import type { Article } from '@/domain/entities'
   import { GetPromptList } from '@/application/use-cases/prompts/GetPromptList'
   import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

   export function usePromptList(filters?: {
     category?: string
     search?: string
   }) {
     const prompts = ref<Article[]>([])
     const isLoading = ref(false)
     const error = ref<string | null>(null)

     const articlesRepo = createStrapiArticlesRepository()
     const getPromptListUC = new GetPromptList(articlesRepo)

     const fetchPrompts = async () => {
       isLoading.value = true
       error.value = null

       try {
         const result = await getPromptListUC.execute(filters || {})
         prompts.value = result.prompts
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to fetch prompts'
       } finally {
         isLoading.value = false
       }
     }

     fetchPrompts()

     return {
       prompts: computed(() => prompts.value),
       isLoading: computed(() => isLoading.value),
       error: computed(() => error.value),
       fetchPrompts,
       refresh: fetchPrompts
     }
   }
   ```

2. Создать `frontend/src/presentation/composables/usePromptDetail.ts`:
   ```typescript
   import { ref, computed, watch } from 'vue'
   import type { Article } from '@/domain/entities'
   import { GetPromptDetail } from '@/application/use-cases/prompts/GetPromptDetail'
   import { createStrapiArticlesRepository } from '@/infrastructure/repositories'

   export function usePromptDetail(slug: () => string) {
     const prompt = ref<Article | null>(null)
     const relatedPrompts = ref<Article[]>([])
     const isLoading = ref(false)
     const error = ref<string | null>(null)

     const articlesRepo = createStrapiArticlesRepository()
     const getPromptDetailUC = new GetPromptDetail(articlesRepo)

     const fetchPrompt = async () => {
       if (!slug()) return

       isLoading.value = true
       error.value = null

       try {
         const result = await getPromptDetailUC.execute({ slug: slug() })
         prompt.value = result.prompt
         relatedPrompts.value = result.relatedPrompts || []
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to fetch prompt'
       } finally {
         isLoading.value = false
       }
     }

     watch(slug, () => {
       fetchPrompt()
     }, { immediate: true })

     return {
       prompt: computed(() => prompt.value),
       relatedPrompts: computed(() => relatedPrompts.value),
       isLoading: computed(() => isLoading.value),
       error: computed(() => error.value),
       fetchPrompt
     }
   }
   ```

**Validation**:
- [ ] Composables аналогичны Speckit composables
- [ ] Никакой файловой логики (downloadFile)

**Files**:
- `frontend/src/presentation/composables/usePromptList.ts` (~50 lines)
- `frontend/src/presentation/composables/usePromptDetail.ts` (~50 lines)

---

### T022: Рефакторинг Prompt компонентов и страниц

**Purpose**: Упростить Prompt компоненты для использования новых composables.

**Steps**:

1. Обновить `components/prompt/PromptCard.vue`:
   ```vue
   <script setup lang="ts">
   import type { Article } from '@/domain/entities'

   const props = defineProps<{
     prompt: Article
   }>()
   </script>

   <template>
     <div class="prompt-card">
       <h3>{{ prompt.title }}</h3>
       <p>{{ prompt.description }}</p>
       <span class="category">{{ prompt.category.name }}</span>
     </div>
   </template>
   ```

2. Обновить `pages/prompts/[promptSlug].vue`:
   ```vue
   <script setup lang="ts">
   import { usePromptDetail } from '@/presentation/composables/usePromptDetail'

   const route = useRoute()
   const slug = computed(() => route.params.promptSlug as string)

   const {
     prompt,
     relatedPrompts,
     isLoading,
     error
   } = usePromptDetail(slug)
   </script>

   <template>
     <div v-if="isLoading">Loading...</div>
     <div v-else-if="error">{{ error }}</div>
     <div v-else-if="prompt" class="prompt-detail">
       <h1>{{ prompt.title }}</h1>
       <div class="body">{{ prompt.body }}</div>

       <RelatedPrompts :prompts="relatedPrompts" />
     </div>
   </template>
   ```

**Validation**:
- [ ] Components используют только composables
- [ ] Никакой бизнес-логики в шаблонах
- [ ] Zero regression в функциональности

**Files**:
- `components/prompt/PromptCard.vue` (рефакторинг)
- `pages/prompts/[promptSlug].vue` (рефакторинг)

---

## Definition of Done

- [x] GetPromptList, GetPromptDetail use cases созданы
- [x] usePromptList, usePromptDetail composables созданы
- [x] Prompt components/pages мигрированы
- [x] Zero code duplication с Speckits (переиспользовать репозиторий)
- [x] Все тесты проходят
- [x] Zero regression

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Недостаточно времени | Переиспользовать все паттерны из Speckits |
| Скрытые различия между Prompts и Speckits | Проверить спецификацию, убедиться что данные совместимы |

---

## Reviewer Guidance

**What to verify**:
1. Prompts используют те же репозитории что Speckits (type='prompt')
2. Нет дублирования кода между use cases
3. Components упрощены

**Red flags**:
- ❌ Дублирование GetSpeckitList кода
- ❌ Разные репозитории для Speckits и Prompts

**Green flags**:
- ✅ Переиспользование StrapiArticlesRepository
- ✅ Компоненты очень похожи на Speckit компоненты

---

## Implementation Command

```bash
spec-kitty implement WP04 --base WP03
```

Основание на WP03 (Speckits) для переиспользования паттернов.
