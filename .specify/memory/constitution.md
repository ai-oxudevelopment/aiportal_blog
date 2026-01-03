# AI Portal Frontend Constitution (Nuxt 4 + Strapi)

## Sync Impact Report

Version Change: 1.0.0 → 2.0.0  
Constitution Type: Major evolution for AI Portal Frontend (Nuxt 4 + Strapi)

Modified Principles:
- I. Server-Side Proxy Architecture (Nuxt 4, stricter layering)
- II. Feature-Based Component Organization (Nuxt 4 `app/` layout, cross-feature rules)
- III. Dual UI Framework Integration (clearer boundaries, design tokens)
- IV. Russian-Language First (i18n & locale rules extended)
- V. SPA Deployment Model (Nuxt 4 hybrid features clarified)

Added Sections:
- VI. API & Data Modeling Standards
- VII. Error Handling & Observability
- VIII. Performance & Caching Strategy
- IX. Strapi Integration Patterns
- X. Security, Auth & Secrets Management

Removed Sections:
- N/A (all принципы эволюционированы, но не удалены)

Templates Status:
- ✅ plan-template.md – совместим, Constitution Check ссылается на эту версию
- ✅ spec-template.md – структура требований совместима
- ✅ tasks-template.md – задачи могут явно ссылаться на принципы
- ⚠️ agent-file-template.md – не проверен (файл не найден)
- ⚠️ checklist-template.md – рекомендуется дополнить проверками на принципы Nuxt 4 + Strapi

Follow-up TODOs:
- Добавить отдельный Observability Playbook (логирование, tracing, дашборды)
- Зафиксировать целевые SLO для front (TTFB, LCP, error rate)
- Формализовать ADR-реестр (Architecture Decision Records) для ключевых решений

Ratification Rationale:
- Конституция обновлена под Nuxt 4 и актуальные паттерны интеграции со Strapi v5
- Принципы уточнены на основе текущего кода и желаемой целевой архитектуры
- Версия 2.0.0 фиксирует mature-уровень governance для фронтенда

---

## I. Server-Side Proxy Architecture (Nuxt 4)

### Принцип

Все внешние API-запросы (Strapi, сторонние сервисы) **обязаны** проходить через серверные маршруты Nuxt (`server/api/*`). Клиентские компоненты и composable-функции **не имеют права** обращаться к Strapi или другим backend-ам напрямую.

### Обязательные уровни

1. **Client UI** (Vue-компоненты, формы, списки)
2. **Composables** (e.g. `useArticles`, `usePrompts`, `useResearch`)
3. **Nuxt server routes** в `server/api/*`
4. **Backend** (Strapi v5, другие сервисы)

### Правила

- Компоненты вызывают **только** composables.
- Composables обращаются **только** к Nuxt server routes (например, `/api/articles`, `/api/prompt/run`).
- Nuxt server routes:
  - Инкапсулируют доступ к Strapi (URL, авторизация, query-логика).
  - Обрабатывают и логируют ошибки.
  - Содержат бизнес-валидацию, связанную с API.
  - Нормализуют и приводят данные к frontend-доменной модели.
- Никаких `fetch('https://strapi...')` или `useFetch('https://strapi...')` из клиентского кода.
- Любое изменение в Strapi API отражается в одном месте: в соответствующем server route / слое Strapi-клиента.

### Анти-паттерны (запрещено)

```ts
// ❌ НЕЛЬЗЯ: прямой вызов Strapi из компонента
const { data } = await useFetch('https://strapi.local/api/articles')
```

```ts
// ❌ НЕЛЬЗЯ: прямой вызов Strapi из composable
export const useArticles = () => useFetch('https://strapi.local/api/articles')
```

### Пример правильного слоя

```ts
// ✅ server/api/articles.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'strapi_jwt')

  const res = await $fetch(`${config.STRAPI_URL}/api/articles`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })

  return normalizeArticles(res)
})
```

```ts
// ✅ composables/useArticles.ts
export const useArticles = () => {
  return useFetch('/api/articles')
}
```

### Rationale

- Централизация интеграций и авторизации.
- Нет CORS-головной боли.
- Минимизация прямой связности UI и Strapi-моделей.
- Возможность смены backend-а без рефакторинга UI.

---

## II. Feature-Based Component & App Organization (Nuxt 4 `app/` layout)

### Принцип

Структура проекта организуется **по фичам**, а не по техническим типам файлов. Nuxt 4 с `app/`-директорией используется как «контейнер фич», каждая фича имеет свой локальный namespace.

### Базовая структура

```text
app/
  layout.vue
  error.vue
  plugins/
  middleware/
  page.vue (root)
  main/
    page.vue
    components/
      main-header.vue
      main-footer.vue
    composables/
      use-main-layout.ts
  prompt/
    page.vue
    components/
      prompt-form.vue
      prompt-history.vue
    composables/
      use-prompt-run.ts
  research/
    page.vue
    components/
      research-list.vue
      research-details.vue
    composables/
      use-research.ts
  shared/
    components/
      app-shell.vue
      app-logo.vue
    composables/
      use-sync-props.ts
      use-notifications.ts
    stores/
      use-user-store.ts
```

### Правила

- **Главный принцип**: импортировать «вверх» или «в сторону» нельзя, только "вниз" и из `shared/`.
  - Фича `prompt` не может импортировать компоненты из `research`.
  - Общие вещи поднимаются в `shared/`.
- Использовать **auto-imports** Nuxt для компонентов, composables и stores.
- `useSyncProps` (или его эквивалент) остаётся стандартом для двусторонней синхронизации состояния parent ↔ child.
- Запрещается создавать папки по типам (`components/atoms`, `components/molecules`, `components/organisms`) на корневом уровне.

### TypeScript & aliases

- Все фичи используют единые алиасы:
  - `@/shared/*` – общие компоненты и утилиты.
  - `@/app/*` – доменно-ориентированный импорт в рамках `app/`.
- Новые фичи обязательно заводят собственный субкаталог в `app/`.

### Rationale

- Улучшенная discoverability: всё по доменам.
- Легче делать рефакторинг отдельной фичи.
- Уменьшение «магии» и путаницы в импортах.

---

## III. Dual UI Framework Integration (Vuetify 3 + Tailwind CSS)

### Принцип

Vuetify 3 и Tailwind CSS используются **комплементарно**. Vuetify отвечает за сложные, интерактивные компоненты; Tailwind — за layout, spacing, типографику и утилитарные стили.

### Правила использования

- Vuetify:
  - Формы, диалоги, сложные таблицы, меню, навигация.
  - Контролы с валидаторами, шаговыми мастерами, комплексными UX-паттернами.
- Tailwind:
  - Layout (flex, grid, spacing, responsiveness).
  - Цвета, фоны, градиенты, iridescent-тема.
  - Вспомогательные классы (`overflow`, `text-*`, `rounded-*`, `shadow-*`).
- Запрещено:
  - Переизобретать Vuetify-компоненты средствами Tailwind.
  - Миксовать в одном компоненте тяжелую Vuetify-разметку с полностью кастомным Tailwind UI без необходимости.

### Темизация и дизайн-система

- Основные цвета iridescent темы:
  - Розовый: `#ff1493`
  - Оранжевый: `#ff6b00`
  - Синий: `#00bfff`
- Tailwind расширяется через `tailwind.config` (custom gradients, animations):
  - `gradient-chaos`
  - `gradient-pulse`
  - `iridescent-glow`
- Vuetify настраивается через плагин Nuxt с поддержкой dark theme и русской локали.

### Rationale

- Используем сильные стороны каждого фреймворка.
- Минимизируем CSS-долг и кастомные компоненты.
- Сводим к минимуму конфликт стилей.

---

## IV. Russian-Language First & i18n

### Принцип

Приложение **по умолчанию русскоязычное**. Весь пользовательский интерфейс, сообщения валидации, форматирование дат и чисел — в русской локали. Поддержка других языков добавляется по мере необходимости.

### Правила

- Vuetify конфигурируется с locale `ru`.
- Форматы дат: `DD.MM.YYYY`, времени: 24-часовой формат.
- Все пользовательские тексты (лейблы, подсказки, ошибки) — на русском.
- Код, комментарии и документация — на русском или английском в зависимости от контекста команды, но UI по умолчанию на русском.
- i18n-ключи организованы по фичам (`prompt.title`, `research.filters.date_from` и т.п.).

### Rationale

- Целевая аудитория — русскоязычные операционные команды.
- Локаль влияет на UX (даты, числа, форматы ввода).

---

## V. SPA Deployment Model & Nuxt 4 Hybrid Rendering

### Принцип

Приложение по умолчанию работает как SPA, однако Nuxt 4 предоставляет гибридный рендеринг. Мы допускаем selective pre-rendering для отдельных маршрутов, не нарушая SPA-модель разработки.

### Правила

- Основной режим: `ssr: false` (SPA) для среды исполнения.
- Разрешено использовать `routeRules` для pre-render отдельных публичных страниц (e.g., маркетинговый лендинг), если это не ломает архитектуру.
- Все data-fetching паттерны в UI предполагают client-side выполнение через composables.
- Build-артефакты должны быть статическими файлами, пригодными для деплоя на CDN / static hosting.
- Порт по умолчанию: `8080`, чтобы не конфликтовать с backend-сервисами.
- Менеджер пакетов: Yarn с zero-installs (использование `.yarn/cache`).

### Rationale

- SPA упрощает деплой и инфраструктуру.
- При необходимости можно точечно оптимизировать TTFB публичных страниц.

---

## VI. API & Data Modeling Standards

### Принцип

Frontend не «знает» внутреннюю схему Strapi напрямую. Все доменные модели описываются на фронте в терминах бизнес-домена, а не структур Strapi.

### Правила

- Вводим слой типизации для доменных сущностей (e.g. `Article`, `PromptRun`, `ResearchTask`).
- Strapi-ответы маппятся в доменные типы в server routes или в отдельном слое `server/strapi-client/*`.
- Поля, которые Strapi добавляет автоматически (`createdAt`, `updatedAt`, `publishedAt`), явно нормализуются.
- Никаких прямых `any`/`unknown` для данных, приходящих с backend-а.

### Пример

```ts
// types/article.ts
export interface Article {
  id: string
  title: string
  body: string
  author: string
  createdAt: string // ISO
}
```

```ts
// server/utils/normalizeArticle.ts
export const normalizeArticle = (payload: any): Article => ({
  id: String(payload.id),
  title: payload.attributes.title,
  body: payload.attributes.body,
  author: payload.attributes.author?.data?.attributes?.name ?? 'Неизвестный автор',
  createdAt: payload.attributes.createdAt,
})
```

### Rationale

- Минимизация влияния изменений в CMS на UI.
- Лучшее автодополнение и refactorability.

---

## VII. Error Handling & Observability

### Принцип

Ошибки должны быть предсказуемыми, логируемыми и понятными пользователю. Диагностика проблем — часть архитектуры, а не постфактум.

### Правила

- Все server routes оборачиваются в единый error-handling слой (utility для `createError` / `sendError`).
- В логах сервера фиксируются:
  - URL backend-а, статус, код ошибки.
  - Идентификатор пользователя (если доступен).
  - Ключевые параметры запроса.
- UI использует унифицированный компонент для отображения ошибок (e.g. `shared/components/error-banner.vue`).
- Для пользовательских ошибок тексты локализованы и понятны (без «Request failed with status 500»).
- Критические ошибки (ошибка сохранения, потеря связи с backend) подсвечиваются более явно.

### Rationale

- Быстрая диагностика и снижение MTTR.
- Однородный UX при ошибках.

---

## VIII. Performance & Caching Strategy

### Принцип

Производительность считается функциональным требованием. Все ключевые сценарии должны быть оптимизированы по TTFB, LCP и perceived performance.

### Правила

- Использование Nuxt composables (`useAsyncData`, `useFetch`) с осознанным кешированием.
- Внутреннее кеширование в server routes для часто используемых read-only данных (конфигурации, справочники).
- Lazy-loading для тяжёлых компонентов (редакторы, сложные таблицы).
- Code-splitting по фичам.
- Предусмотрены skeleton-состояния и shimmer-лоадеры.

### Rationale

- Ускорение UX в типичных сценариях.
- Эффективное использование CDN и браузерного кэша.

---

## IX. Strapi Integration Patterns

### Принцип

Интеграция со Strapi оформляется через единообразный клиентский слой и предсказуемые маршруты.

### Правила

- Использовать модуль `@nuxtjs/strapi` (для Nuxt 4-совместимой версии) или собственный легковесный клиент в `server/strapi-client/*`.
- Все коллекции и single types Strapi получают dedicated функции:
  - `getArticles`, `createPromptRun`, `getResearchTasks` и т.п.
- Поддержка draft/published логики, если она используется.
- Фильтрация и пагинация инкапсулируются на уровне сервера.

### Пример

```ts
// server/strapi-client/articles.ts
export const getArticlesFromStrapi = async (event: H3Event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'strapi_jwt')

  return $fetch(`${config.STRAPI_URL}/api/articles`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    query: {
      sort: 'createdAt:desc',
      populate: '*',
    },
  })
}
```

### Rationale

- Чёткое разделение ответственности между frontend и CMS.
- Возможность тестировать Strapi-клиент отдельно.

---

## X. Security, Auth & Secrets Management

### Принцип

Аутентификация и секреты никогда не вытекают в клиентский код. Все чувствительные операции происходят на серверном уровне Nuxt.

### Правила

- JWT Strapi хранится в HttpOnly cookie (`strapi_jwt`).
- Никакие API-ключи не попадают в `NUXT_PUBLIC_*` переменные, если этого не требует архитектура.
- Auth middleware может быть включён на уровне маршрутов (protected sections), но не должен приводить к «жёсткой» навигации при потере авторизации — UI должен мягко обрабатывать такие состояния.
- Логаут полностью очищает токены и пользовательское состояние.

### Rationale

- Снижение риска XSS и кражи токенов.
- Предсказуемое поведение при истечении сессии.

---

## Technology Constraints (обновлённые)

### Stack (обязательно)

- **Framework**: Nuxt 4 (Vue 3, `app/` layout)
- **State Management**: Pinia
- **UI Components**: Vuetify 3, Radix Vue (headless)
- **Styling**: Tailwind CSS + кастомная iridescent тема
- **Forms**: FormKit Vue
- **Backend**: Strapi v5 (через `@nuxtjs/strapi` или кастомный клиент)
- **Real-time**: nuxt-socket-io (по потребности)
- **Icons**: MDI + Lucide Vue Next

### Prohibited Patterns (обновлённые)

- Прямые вызовы Strapi или других API из клиентских компонентов/composables.
- SSR-специфичный код, завязанный на `process.server`/`process.client`, не согласованный с SPA/Hybrid стратегией.
- Дублирование компонентов Vuetify через Tailwind-only реализацию без веской причины.
- Глобальные singletons, привязанные к состоянию фич без использования Pinia.

### Environment Variables

Требуемые переменные в `.env`:

- `STRAPI_URL` – URL Strapi CMS (по умолчанию: `http://localhost:1337`).
- `PORT` – порт приложения (по умолчанию: `8080`).
- `NUXT_PUBLIC_YANDEX_METRIKA_ID` – ID счётчика Яндекс.Метрики.

Все секреты без приставки `NUXT_PUBLIC_` **не** доступны на клиенте.

---

## Governance

### Amendment Process

1. Предложить изменения через Pull Request с чётким обоснованием.
2. Обновить версию по semantic versioning:
   - **MAJOR** – изменение или удаление базового принципа (breaking changes для архитектуры).
   - **MINOR** – добавление новых принципов или серьёзное расширение существующих.
   - **PATCH** – уточнения формулировок, исправление ошибок, несемантические правки.
3. Обновить связанный Sync Impact Report в начале документа.
4. Пропрогать изменения в шаблоны (plan, spec, tasks), чтобы они ссылались на актуальные принципы.
5. Зафиксировать ключевые архитектурные решения в ADR.

### Compliance Verification

- Раздел Constitution Check в `plan.md` обязательно сверяется с этой конституцией.
- Любые отступления от принципов документируются в Complexity Tracking таблице.
- При конфликте принципов фиксируется компромиссное решение и выносится на governance review.

### ADR (Architecture Decision Records)

Для значимых решений создаётся ADR-запись:

- Контекст
- Решение
- Альтернативы
- Последствия

ADR хранится в репозитории (например, `docs/adr/`), и на них можно ссылаться из спецификаций.

---

## Runtime Development Guidance

Для детализированных паттернов реализации и архитектурных нюансов использовать:

- `CLAUDE.md` – инструкции для AI-агентов и обзор проекта.
- `.specify/templates/` – шаблоны для спецификаций, планов и задач.
- `nuxt.config.ts` – основная конфигурация Nuxt 4, модули, плагины, `routeRules`.

---

**Version**: 2.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01
