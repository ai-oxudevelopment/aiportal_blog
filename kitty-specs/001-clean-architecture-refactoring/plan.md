# Implementation Plan: Clean Architecture Refactoring

**Branch**: `001-clean-architecture-refactoring` | **Date**: 2025-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/kitty-specs/001-clean-architecture-refactoring/spec.md`

---

## Summary

Рефакторинг Nuxt 3 приложения с внедрением слоистой архитектуры (UI → Use Cases → Data) для улучшения масштабируемости и удобства поддержки. Комплексное решение проблем: дублирование кода, высокая связность, разрозненная интеграция со Strapi, фрагментированный стейт-менеджмент.

**Технический подход**: Feature-based миграция по модулям (Research → Speckits → Prompts → Blogs) с созданием новых слоёв параллельно существующему коду для минимизации рисков.

---

## Technical Context

**Language/Version**: TypeScript 5.9.2, JavaScript ES2022
**Primary Dependencies**: Nuxt 3.2.0, Vue 3.4.21, Pinia, @nuxtjs/strapi 2.1.1, Vite 7.3.1
**Storage**: Strapi v5 CMS (backend), In-memory cache (server-side)
**Testing**: Vitest (TODO: добавить в проект), Playwright (E2E)
**Target Platform**: Node.js 22 (server), Browser (client)
**Project Type**: Web application (SSR + SPA hybrid)
**Performance Goals**:
- Текущее: <100ms load time для кешированных страниц
- Цель: Не ухудшить производительность при добавлении слоёв
**Constraints**:
- SSR mode remain enabled (SEO requirement)
- Backward compatibility (zero regression)
- Incremental migration (no big-bang rewrite)
**Scale/Scope**:
- ~50 components в `frontend/components/`
- 4 основных модуля: Research, Speckits, Prompts, Blogs
- ~10 server API routes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

| Principle | Status | Notes |
|-----------|--------|-------|
| Server-side proxy for Strapi | ✅ Compatible | Repository pattern в Infrastructure Layer сохраняет server proxy |
| SPA model for non-critical routes | ✅ Compatible | Presentation Layer остаётся SPA-aware |
| TypeScript types | ✅ Compatible | Domain Layer обеспечивает типизацию сущностей |
| Feature-based structure | ✅ Compatible | Миграция по модулям совпадает с принципом |

**Re-check after design**: Артефакты Phase 1 (data-model, contracts) должны подтвердить совместимость.

---

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-clean-architecture-refactoring/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── repositories.ts  # Repository interfaces
└── tasks/               # Work packages (Phase 2)
```

### Source Code (after refactoring)

**Target structure** — слоистая архитектура внутри `frontend/`:

```
frontend/
├── src/                          # Новая архитектура
│   ├── domain/                   # Domain Layer (типы, интерфейсы)
│   │   ├── entities/             # Article, Speckit, Category, ResearchSession
│   │   ├── repositories/         # Интерфейсы репозиториев
│   │   └── value-objects/        # SpeckitSlug, ArticleId, etc.
│   │
│   ├── application/              # Application Layer (use cases)
│   │   ├── use-cases/
│   │   │   ├── speckits/
│   │   │   │   ├── GetSpeckitList.ts
│   │   │   │   ├── GetSpeckitDetail.ts
│   │   │   │   └── DownloadSpeckitFile.ts
│   │   │   ├── prompts/
│   │   │   │   ├── GetPromptList.ts
│   │   │   │   └── GetPromptDetail.ts
│   │   │   ├── research/
│   │   │   │   ├── CreateResearchSession.ts
│   │   │   │   └── SubmitResearchQuery.ts
│   │   │   └── categories/
│   │   │       └── GetCategories.ts
│   │   └── services/             # Application services (оркестрация)
│   │
│   ├── infrastructure/           # Infrastructure Layer (реализация)
│   │   ├── repositories/
│   │   │   ├── StrapiArticlesRepository.ts
│   │   │   ├── StrapiSpeckitsRepository.ts
│   │   │   └── StrapiCategoriesRepository.ts
│   │   ├── cache/
│   │   │   ├── InMemoryCacheProvider.ts
│   │   │   └── CacheWrapper.ts
│   │   └── api/
│   │       └── StrapiClient.ts
│   │
│   └── presentation/             # Presentation Layer (UI адаптеры)
│       ├── composables/          # Адаптеры use cases для Vue
│       │   ├── useSpeckitList.ts
│       │   ├── usePromptDetail.ts
│       │   └── useResearchChat.ts
│       └── stores/               # Pinia stores (только UI state)
│
├── components/                   # Существующие компоненты (будут упрощаться)
├── pages/                        # Существующие страницы
└── server/                       # Существующие server routes (будут deprecated)

# Легacy код (будет удалён по мере миграции)
frontend/components/              # Старые компоненты (мигрируются постепенно)
frontend/composables/             # Старые composables (заменяются на presentation/composables)
frontend/server/api/              # Старые server routes (логика переходит в application/use-cases)
```

**Structure Decision**: Hybrid approach — новая структура в `frontend/src/` сосуществует с существующими папками. Это позволяет:
- Мигрировать по одной вертикали за раз
- Сохранять backward compatibility
- Не блокировать разработку

---

## Phase 0: Research & Preparation

### Research Tasks

| Task | Description | Output |
|------|-------------|--------|
| R-001 | Изучить лучшие практики слоистой архитектуры в Nuxt 3 | research.md секция "Nuxt Layered Architecture" |
| R-002 | Проанализировать текущие composables на предмет дублирования | research.md секция "Current Code Analysis" |
| R-003 | Изучить паттерны миграции для больших codebases | research.md секция "Migration Patterns" |
| R-004 | Определить зависимости между модулями (Research, Speckits, Prompts, Blogs) | research.md секция "Module Dependencies" |

**Output**: `research.md` с решениями для всех неизвестных.

---

## Phase 1: Design & Contracts

### 1.1 Data Model

**Output**: `data-model.md`

**Сущности Domain Layer**:

```typescript
// Domain Entities
interface Article {
  id: number
  slug: string
  title: string
  description: string
  body: string
  type: 'speckit' | 'prompt'
  category: Category
  file?: FileAttachment
  diagram?: DiagramData
  faq?: FaqData[]
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: number
  name: string
  slug: string
  type: 'speckit' | 'prompt'
}

interface ResearchSession {
  id: string
  messages: ResearchMessage[]
  platform: 'openai' | 'claude' | 'perplexity'
  createdAt: Date
}

// Value Objects
type SpeckitSlug = string & { readonly __brand: unique symbol }
type ArticleId = number & { readonly __brand: unique symbol }
```

### 1.2 Repository Contracts

**Output**: `contracts/repositories.ts`

```typescript
// Repository Interfaces (Domain Layer)
interface IArticlesRepository {
  findAll(type?: ArticleType): Promise<Article[]>
  findBySlug(slug: string): Promise<Article | null>
  findById(id: ArticleId): Promise<Article | null>
}

interface ICategoriesRepository {
  findAll(type?: 'speckit' | 'prompt'): Promise<Category[]>
  findBySlug(slug: string): Promise<Category | null>
}

interface IResearchRepository {
  createSession(platform: string): Promise<ResearchSession>
  addMessage(sessionId: string, message: ResearchMessage): Promise<void>
  getSession(sessionId: string): Promise<ResearchSession | null>
}

// Cache Interface
interface ICacheProvider<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T, ttl?: number): Promise<void>
  invalidate(pattern: string): Promise<void>
}
```

### 1.3 Quickstart Guide

**Output**: `quickstart.md`

Инструкция для разработчиков:
- Как добавить новый use case
- Как создать репозиторий
- Как мигрировать компонент
- Правила命名 и организации

### 1.4 Agent Context Update

Запустить скрипт обновления agent-specific context:
```bash
.specify/agents/claude/update-context.sh
```

**Update**: Добавить в `CLAUDE.md`:
- Новая структура `frontend/src/`
- Правила создания use cases
- Правила миграции компонентов

---

## Migration Strategy (Feature-Based)

### Миграция по модулям в порядке: Research → Speckits → Prompts → Blogs

#### WP-01: Foundation (Foundation Layer)
**Цель**: Создать базовую структуру слоёв без изменения бизнес-логики

**Deliverables**:
- `frontend/src/domain/` — базовые типы и интерфейсы
- `frontend/src/infrastructure/cache/` — обёртка над существующим кешем
- `frontend/src/infrastructure/api/` — Strapi клиент
- `frontend/src/domain/repositories/` — интерфейсы репозиториев

**Success criteria**:
- Структура создана
- Типы скомпилировались без ошибок
- Unit тесты для interfaces (простые)

#### WP-02: Research Module Migration
**Цель**: Полностью мигрировать модуль Research на новую архитектуру

**Current state**:
- `pages/research/[searchId].vue`
- `server/api/research/*`
- Компоненты в `components/research/`

**Target state**:
- `src/application/use-cases/research/*` — use cases
- `src/infrastructure/repositories/StrapiResearchRepository.ts`
- `src/presentation/composables/useResearchChat.ts`
- Pages/components упрощаются до чистого UI

**Success criteria**:
- Все research use cases покрыты тестами (80%+)
- Компоненты используют только presentation composables
- Zero regression в функциональности

#### WP-03: Speckits Module Migration
**Цель**: Полностью мигрировать модуль Speckits

**Current state**:
- `pages/speckits/[speckitSlug].vue`
- `server/api/speckits/*`
- `components/speckit/*` (SpeckitCard, SpeckitDetail, etc.)
- Composables: `useFetchArticles`

**Target state**:
- `src/application/use-cases/speckits/*` (GetSpeckitList, GetSpeckitDetail, DownloadSpeckitFile)
- `src/infrastructure/repositories/StrapiSpeckitsRepository.ts`
- `src/presentation/composables/useSpeckitList.ts`, `useSpeckitDetail.ts`

**Success criteria**:
- Use cases тестируемы изолированно
- Components не знают про Strapi
- File download работает через use case

#### WP-04: Prompts Module Migration
**Цель**: Мигрировать модуль Prompts, переиспользуя паттерны из Speckits

**Target state**:
- `src/application/use-cases/prompts/*`
- `src/infrastructure/repositories/` (переиспользовать ArticlesRepository)
- `src/presentation/composables/usePromptList.ts`

**Success criteria**:
- Миграция заняла меньше времени чем Speckits (паттерны уже обкатаны)
- Zero code duplication между Prompts и Speckits

#### WP-05: Blogs & Categories Migration
**Цель**: Завершить миграцию контентных модулей

**Target state**:
- `src/application/use-cases/blogs/*`
- `src/application/use-cases/categories/*`
- Единый CategoriesRepository для всех модулей

**Success criteria**:
- Фильтрация работает для всех типов контента
- Categories кешируются корректно

#### WP-06: Legacy Cleanup
**Цель**: Удалить старый код после полной миграции

**Deliverables**:
- Удалить `frontend/composables/useFetchArticles.ts`
- Удалить старые server routes (логика перешла в use cases)
- Обновить импорты во всех компонентах

**Success criteria**:
- Нет дублирующего кода
- Все импорты указывают на `src/`
- Тесты проходят

---

## Success Criteria Verification

| Критерий | Как измеряем |
|----------|--------------|
| Структурная организация | Code review: все новые файлы в `src/`, старые удалены |
| Снижение дублирования | SonarQube или manual analysis: -50% duplications |
| Изоляция слоёв | Интеграционные тесты: изменение repo не ломает UI |
| Тестируемость | Coverage report: 80%+ для use cases |
| Developer Experience | Онбординг-задача: новый человек находит код за 15 мин |
| Zero Regression | E2E tests: все сценарии работают после каждого WP |

---

## Dependencies Between Work Packages

```
WP-01 (Foundation)
    ├─→ WP-02 (Research) — первый модуль для обкатки
    │       ├─→ WP-03 (Speckits) — самый сложный контентный модуль
    │       │       ├─→ WP-04 (Prompts) — переиспользует паттерны
    │       │       └─→ WP-05 (Blogs/Categories)
    │       │               └─→ WP-06 (Cleanup)
```

**Критический путь**: WP-01 → WP-02 → WP-03 → WP-04 → WP-05 → WP-06

**Параллельность**: После WP-02 можно запускать WP-03 и WP-04 параллельно если они независимы (но WP-04 переиспользует паттерны WP-03, поэтому последовательно).

---

## Risk Mitigation per WP

| WP | Риск | Mitigation |
|----|------|------------|
| WP-01 | Overengineering | Начать с минимальных абстракций, не вводить DDD |
| WP-02 | Research модуль сломается | Комплексное E2E тестирование до миграции |
| WP-03 | Speckits слишком сложный | Разбить на подзадачи (cards, detail, files, diagrams) |
| WP-04 | Недостаточно времени | Переиспользовать код из WP-03 |
| WP-05 | Categories сломают фильтрацию | Тестировать каждый модуль отдельно |
| WP-06 | Удаление нужного кода | Комплексное тестирование перед cleanup |

---

## STOP POINT

**This plan is complete.**

Generated artifacts:
- ✅ `plan.md` — этот файл
- ⏳ `research.md` — будет создан после Phase 0
- ⏳ `data-model.md` — будет создан после Phase 1
- ⏳ `contracts/` — будут созданы после Phase 1
- ⏳ `quickstart.md` — будет создан после Phase 1

**Next**: Run `/spec-kitty.tasks` to generate work packages based on this plan.

**DO NOT** proceed to task generation in this command.
