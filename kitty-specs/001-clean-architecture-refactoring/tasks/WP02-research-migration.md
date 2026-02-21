# WP02: Research Module Migration

**Work Package ID**: WP02
**Title**: Research Module Migration
**Lane**: planned
**Dependencies**: ["WP01"]
**Subtasks**: ["T007", "T008", "T009", "T010", "T011"]

**History**:
- 2025-02-21: Created during task generation

---

## Objective

Полностью мигрировать Research модуль на новую архитектуру. Это первый "настоящий" модуль для обкатки паттернов. Research выбран как первый потому что он наиболее независим от других модулей.

**Success Criteria**:
- Research use cases созданы и протестированы
- StrapiResearchRepository реализован
- `useResearchChat` composable создан
- Research pages/components упрощены до чистого UI
- Zero regression в функциональности

---

## Context

**Current State** (из `research.md`):
- `pages/research/[searchId].vue` — основная страница research
- `server/api/research/*` — server endpoints для AI запросов
- `components/research/*` — UI компоненты для research

**Target State**:
- `src/application/use-cases/research/` — бизнес-логика
- `src/infrastructure/repositories/StrapiResearchRepository.ts` — данные
- `src/presentation/composables/useResearchChat.ts` — UI адаптер
- Pages/components упрощены до чистого UI (без бизнес-логики)

**Key Pattern**: Это первый полноценный модуль миграции. Он служит шаблоном для WP03-WP05.

---

## Subtasks

### T007: Создать StrapiResearchRepository

**Purpose**: Реализовать репозиторий для Research сессий в Infrastructure Layer.

**Steps**:

1. Создать `frontend/src/infrastructure/repositories/StrapiResearchRepository.ts`:
   ```typescript
   import type {
     IResearchRepository,
     ResearchSession,
     ResearchPlatform
   } from '@/domain/repositories'
   import type { ResearchMessage, SessionStatus } from '@/domain/entities'

   interface StrapiResearchResponse {
     data: {
       id: string
       attributes: {
         platform: string
         messages: any[]
         status: string
         createdAt: string
         updatedAt: string
       }
     }
   }

   export class StrapiResearchRepository implements IResearchRepository {
     constructor(
       private strapiUrl: string,
       private apiKey: string
     ) {}

     async createSession(platform: ResearchPlatform): Promise<ResearchSession> {
       const response = await fetch(`${this.strapiUrl}/api/research-sessions`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${this.apiKey}`
         },
         body: JSON.stringify({ data: { platform } })
       })

       if (!response.ok) {
         throw new Error(`Failed to create session: ${response.statusText}`)
       }

       const json: StrapiResearchResponse = await response.json()
       return this.toDomain(json)
     }

     async addMessage(
       sessionId: string,
       message: Omit<ResearchMessage, 'id' | 'timestamp'>
     ): Promise<void> {
       const response = await fetch(`${this.strapiUrl}/api/research-sessions/${sessionId}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${this.apiKey}`
         },
         body: JSON.stringify({
           data: {
             message: {
               role: message.role,
               content: message.content
             }
           }
         })
       })

       if (!response.ok) {
         throw new Error(`Failed to add message: ${response.statusText}`)
       }
     }

     async getSession(sessionId: string): Promise<ResearchSession | null> {
       const response = await fetch(
         `${this.strapiUrl}/api/research-sessions/${sessionId}`,
         {
           headers: { 'Authorization': `Bearer ${this.apiKey}` }
         }
       )

       if (response.status === 404) return null
       if (!response.ok) {
         throw new Error(`Failed to get session: ${response.statusText}`)
       }

       const json: StrapiResearchResponse = await response.json()
       return this.toDomain(json)
     }

     async updateStatus(sessionId: string, status: SessionStatus): Promise<void> {
       await fetch(`${this.strapiUrl}/api/research-sessions/${sessionId}`, {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${this.apiKey}`
         },
         body: JSON.stringify({ data: { status } })
       })
     }

     private toDomain(json: StrapiResearchResponse): ResearchSession {
       const attrs = json.data.attributes
       return {
         id: json.data.id,
         messages: attrs.messages.map(m => ({
           id: m.id,
           role: m.role,
           content: m.content,
           timestamp: new Date(m.timestamp)
         })),
         platform: attrs.platform as ResearchPlatform,
         status: attrs.status as SessionStatus,
         createdAt: new Date(attrs.createdAt),
         updatedAt: new Date(attrs.updatedAt)
       }
     }
   }
   ```

2. Создать factory для создания репозитория:
   ```typescript
   // frontend/src/infrastructure/repositories/index.ts
   export function createStrapiResearchRepository(): IResearchRepository {
     return new StrapiResearchRepository(
       process.env.STRAPI_URL || 'http://localhost:1337',
       process.env.STRAPI_API_KEY || ''
     )
   }
   ```

**Validation**:
- [ ] Класс реализует `IResearchRepository` полностью
- [ ] Методы конвертируют Strapi формат в Domain entities
- [ ] Обработка ошибок реализована

**Files**:
- `frontend/src/infrastructure/repositories/StrapiResearchRepository.ts` (~120 lines)
- `frontend/src/infrastructure/repositories/index.ts` (обновления)

---

### T008: Создать CreateResearchSession use case

**Purpose**: Создать use case для создания новой AI research сессии.

**Steps**:

1. Создать `frontend/src/application/use-cases/research/CreateResearchSession.ts`:
   ```typescript
   import type { IResearchRepository } from '@/domain/repositories'
   import type { ResearchSession, ResearchPlatform } from '@/domain/entities'

   export interface CreateResearchSessionRequest {
     platform: ResearchPlatform
   }

   export interface CreateResearchSessionResponse {
     session: ResearchSession
     initialMessage?: string
   }

   export class CreateResearchSession {
     constructor(
       private researchRepo: IResearchRepository
     ) {}

     async execute(request: CreateResearchSessionRequest): Promise<CreateResearchSessionResponse> {
       // Валидация
       if (!request.platform) {
         throw new Error('Platform is required')
       }

       // Создаём сессию через репозиторий
       const session = await this.researchRepo.createSession(request.platform)

       // Добавляем приветственное сообщение
       const welcomeMessage = this.getWelcomeMessage(request.platform)
       if (welcomeMessage) {
         await this.researchRepo.addMessage(session.id, {
           role: 'assistant',
           content: welcomeMessage
         })
       }

       // Получаем обновлённую сессию
       const updatedSession = await this.researchRepo.getSession(session.id)

       return {
         session: updatedSession || session,
         initialMessage: welcomeMessage
       }
     }

     private getWelcomeMessage(platform: ResearchPlatform): string {
       const messages = {
         openai: 'Hello! I\'m your AI assistant powered by OpenAI. How can I help you today?',
         claude: 'Hi there! I\'m Claude, ready to assist you with your research.',
         perplexity: 'Welcome! I\'m your Perplexity AI assistant. What would you like to explore?'
       }
       return messages[platform]
     }
   }
   ```

**Validation**:
- [ ] Use case независим от UI фреймворка (pure TypeScript)
- [ ] Валидация входных данных реализована
- [ ] Welcome message добавляется автоматически
- [ ] Ошибки пробрасываются корректно

**Files**:
- `frontend/src/application/use-cases/research/CreateResearchSession.ts` (~60 lines)

---

### T009: Создать SubmitResearchQuery use case

**Purpose**: Создать use case для отправки запроса к AI и получения ответа.

**Steps**:

1. Создать `frontend/src/application/use-cases/research/SubmitResearchQuery.ts`:
   ```typescript
   import type { IResearchRepository } from '@/domain/repositories'
   import type { ResearchMessage, SessionStatus } from '@/domain/entities'

   export interface SubmitResearchQueryRequest {
     sessionId: string
     query: string
   }

   export interface SubmitResearchQueryResponse {
     userMessage: ResearchMessage
     assistantMessage: ResearchMessage
     isComplete: boolean
   }

   export class SubmitResearchQuery {
     constructor(
       private researchRepo: IResearchRepository,
       private aiClient: AIClient  // abstraction for AI API
     ) {}

     async execute(request: SubmitResearchQueryRequest): Promise<SubmitResearchQueryResponse> {
       // Валидация
       const session = await this.researchRepo.getSession(request.sessionId)
       if (!session) {
         throw new Error('Session not found')
       }

       if (session.status !== 'active') {
         throw new Error('Session is not active')
       }

       // Добавляем сообщение пользователя
       await this.researchRepo.addMessage(request.sessionId, {
         role: 'user',
         content: request.query
       })

       // Получаем ответ от AI
       const response = await this.aiClient.chat({
         platform: session.platform,
         messages: [
           ...session.messages,
           { role: 'user', content: request.query }
         ]
       })

       // Добавляем ответ ассистента
       await this.researchRepo.addMessage(request.sessionId, {
         role: 'assistant',
         content: response.content
       })

       // Проверяем завершён ли диалог
       const isComplete = response.finishReason === 'stop'

       if (isComplete) {
         await this.researchRepo.updateStatus(request.sessionId, 'completed')
       }

       return {
         userMessage: {
           id: crypto.randomUUID(),
           role: 'user',
           content: request.query,
           timestamp: new Date()
         },
         assistantMessage: {
           id: crypto.randomUUID(),
           role: 'assistant',
           content: response.content,
           timestamp: new Date()
         },
         isComplete
       }
     }
   }

   // Abstraction for AI API
   interface AIClient {
     chat(request: ChatRequest): Promise<ChatResponse>
   }

   interface ChatRequest {
     platform: string
     messages: Array<{ role: string; content: string }>
   }

   interface ChatResponse {
     content: string
     finishReason: string
   }
   ```

**Validation**:
- [ ] Use case обрабатывает весь цикл: query → AI response → save
- [ ] Валидация состояния сессии реализована
- [ ] AIClient abstraction позволяет легко тестировать
- [ ] Статус сессии обновляется при завершении

**Files**:
- `frontend/src/application/use-cases/research/SubmitResearchQuery.ts` (~100 lines)

**Notes**:
- AIClient abstraction — это placeholder. В следующих WP можно реализовать конкретный клиент.
- Для MVP можно использовать прямые fetch запросы к AI API внутри use case.

---

### T010: Создать useResearchChat composable

**Purpose**: Создать Presentation layer адаптер для Research use cases.

**Steps**:

1. Создать `frontend/src/presentation/composables/useResearchChat.ts`:
   ```typescript
   import { ref, computed } from 'vue'
   import type { ResearchPlatform, ResearchSession } from '@/domain/entities'
   import { CreateResearchSession } from '@/application/use-cases/research/CreateResearchSession'
   import { SubmitResearchQuery } from '@/application/use-cases/research/SubmitResearchQuery'
   import { createStrapiResearchRepository } from '@/infrastructure/repositories'

   export function useResearchChat(platform: ResearchPlatform) {
     // State
     const session = ref<ResearchSession | null>(null)
     const isLoading = ref(false)
     const error = ref<string | null>(null)
     const messages = computed(() => session.value?.messages || [])

     // Use cases
     const researchRepo = createStrapiResearchRepository()
     const createSessionUC = new CreateResearchSession(researchRepo)
     const submitQueryUC = new SubmitResearchQuery(researchRepo, aiClient)

     // Actions
     const createSession = async () => {
       isLoading.value = true
       error.value = null

       try {
         const result = await createSessionUC.execute({ platform })
         session.value = result.session
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to create session'
         throw e
       } finally {
         isLoading.value = false
       }
     }

     const submitQuery = async (query: string) => {
       if (!session.value) {
         throw new Error('No active session')
       }

       isLoading.value = true
       error.value = null

       try {
         const result = await submitQueryUC.execute({
           sessionId: session.value.id,
           query
         })

         // Обновляем сессию локально (optimistic update)
         session.value = await researchRepo.getSession(session.value.id)

         return result
       } catch (e) {
         error.value = e instanceof Error ? e.message : 'Failed to submit query'
         throw e
       } finally {
         isLoading.value = false
       }
     }

     const reset = () => {
       session.value = null
       error.value = null
       isLoading.value = false
     }

     return {
       // State
       session: computed(() => session.value),
      isLoading: computed(() => isLoading.value),
       error: computed(() => error.value),
      messages,

      // Actions
      createSession,
      submitQuery,
      reset
     }
   }

   // Placeholder AI client - реализовать в следующем WP
   const aiClient = {
     async chat(request: any) {
       // Temporary implementation
       return {
         content: 'AI response placeholder',
         finishReason: 'stop'
       }
     }
   }
   ```

**Validation**:
- [ ] Composable возвращает реактивный state
- [ ] Use cases инстанциированы корректно
- [ ] Errors обрабатываются и сохраняются в state
- [ ] Функции возвращают полезные значения для UI

**Files**:
- `frontend/src/presentation/composables/useResearchChat.ts` (~90 lines)

---

### T011: Рефакторинг Research страниц/компонентов

**Purpose**: Упростить Research UI компоненты для использования нового composable.

**Steps**:

1. Обновить `frontend/pages/research/[searchId].vue`:
   ```vue
   <script setup lang="ts">
   import { onMounted } from 'vue'
   import { useResearchChat } from '@/presentation/composables/useResearchChat'

   const route = useRoute()
   const searchId = route.params.searchId as string

   const {
     session,
     isLoading,
     error,
     messages,
     createSession,
     submitQuery,
     reset
   } = useResearchChat('perplexity')  // или из параметров

   const query = ref('')

   onMounted(async () => {
     // Загрузить существующую сессию или создать новую
     // TODO: implement loadSession в use case
     await createSession()
   })

   const handleSubmit = async () => {
     if (!query.value.trim()) return

     await submitQuery(query.value)
     query.value = ''
   }
   </script>

   <template>
     <div class="research-container">
       <!-- Messages -->
       <div class="messages">
         <div
           v-for="msg in messages"
           :key="msg.id"
           :class="['message', msg.role]"
         >
           {{ msg.content }}
         </div>
       </div>

       <!-- Input -->
       <form @submit.prevent="handleSubmit" class="input-form">
         <input
           v-model="query"
           type="text"
           placeholder="Ask anything..."
           :disabled="isLoading"
         />
         <button type="submit" :disabled="isLoading || !query.trim()">
           Send
         </button>
       </form>

       <!-- Error -->
       <div v-if="error" class="error">
         {{ error }}
       </div>
     </div>
   </template>
   ```

2. Удалить дублирующую логику из компонентов:
   - Удалить прямые API вызовы из компонентов
   - Удалить дублирующую логику состояния
   - Использовать только `useResearchChat` composable

**Validation**:
- [ ] Страница использует только `useResearchChat` composable
- [ ] Никаких прямых API вызовов
- [ ] Состояние управляется через composable
- [ ] Zero regression в функциональности

**Files**:
- `frontend/pages/research/[searchId].vue` (рефакторинг)
- `frontend/components/research/*` (упрощение)

---

## Definition of Done

- [ ] StrapiResearchRepository реализован
- [ ] CreateResearchSession use case создан
- [ ] SubmitResearchQuery use case создан
- [ ] useResearchChat composable создан
- [ ] Research pages рефакторены
- [ ] Все тесты проходят
- [ ] Zero regression в функциональности (E2E тесты)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Research модуль сложнее чем ожидалось | Сначала создать минимальную версию, затем расширять |
| AI client интеграция сложная | Использовать placeholder, реализовать в отдельном WP |
| Компоненты сильно связаны с бизнес-логикой | Постепенный рефакторинг, не удалять старый код сразу |

---

## Reviewer Guidance

**What to verify**:
1. Use cases не зависят от Vue/Nuxt (pure TypeScript)
2. Composable адаптирует use cases для Vue
3. Components используют только composable
4. Никакой бизнес-логики в компонентах

**Red flags**:
- ❌ Бизнес-логика в компонентах
- ❌ Прямые API вызовы из UI
- ❌ Use case зависит от Vue (ref, computed, etc.)

**Green flags**:
- ✅ Чистое разделение слоёв
- ✅ Use cases тестируемы без Vue
- ✅ Components простые и декларативные

---

## Implementation Command

```bash
spec-kitty implement WP02 --base WP01
```

Эта команда создаст worktree с основанием на WP01 (Foundation Layer).
