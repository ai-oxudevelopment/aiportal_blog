# Tasks: Clean Architecture Refactoring

**Feature**: 001-clean-architecture-refactoring
**Status**: Ready for Implementation
**Last Updated**: 2025-02-21

---

## Overview

Полный рефакторинг Nuxt 3 приложения с внедрением слоистой архитектуры. 6 work packages покрывают всю миграцию от foundational layer до cleanup legacy code.

**Migration Order**: Foundation → Research → Speckits → Prompts → Blogs → Cleanup

**Total Work Packages**: 6
**Total Subtasks**: ~42
**Estimated Prompt Size**: 280-520 lines per WP

---

## Work Packages

### WP01: Foundation Layer Setup

**Goal**: Создать базовую структуру слоёв с типами, интерфейсами и инфраструктурой

**Priority**: P0 (blocks all other work)
**Estimated Size**: ~480 lines (6 subtasks)

**Success Criteria**:
- [ ] `frontend/src/domain/` создан с базовыми сущностями
- [ ] `frontend/src/infrastructure/` создан с cache и API клиентом
- [x] TypeScript компилируется без ошибок
- [x] Nuxt auto-imports настроены для новых путей
- [x] Базовые интерфейсные тесты проходят

**Included Subtasks**:
- [x] T001: Создать структуру директорий `frontend/src/`
- [x] T002: Определить Domain Entities (Article, Category, ResearchSession)
- [x] T003: Определить Repository Interfaces (IArticlesRepository, etc.)
- [x] T004: Создать ICacheProvider интерфейс
- [x] T005: Настроить Nuxt imports для новой структуры
- [x] T006: Создать базовые unit тесты для interfaces

**Implementation Sketch**:
1. Создать `frontend/src/domain/entities/` с Article.ts, Category.ts, ResearchSession.ts
2. Создать `frontend/src/domain/repositories/` с интерфейсами из contracts/
3. Создать `frontend/src/domain/cache/` с ICacheProvider.ts
4. Создать `frontend/src/infrastructure/cache/` (пустой, для реализаций в следующих WP)
5. Создать `frontend/src/infrastructure/api/` (пустой, для StrapiClient)
6. Обновить `nuxt.config.ts` с imports.dirs для новых путей
7. Создать `tests/domain/` с базовыми тестами

**Parallel Opportunities**: T002-T004 можно делать параллельно (разные файлы)

**Dependencies**: None (foundational work)

**Risks**:
- Overengineering: минимизировать абстракции, создавать только необходимое
- Nuxt imports могут не работать с src/ структурой → нужно протестировать рано

**Prompt File**: `tasks/WP01-foundation-layer.md`

---

### WP02: Research Module Migration

**Goal**: Полностью мигрировать Research модуль на новую архитектуру

**Priority**: P1 (enables pattern validation)
**Estimated Size**: ~420 lines (5 subtasks)

**Success Criteria**:
- [ ] Research use cases созданы и протестированы
- [x] StrapiResearchRepository реализован
- [ ] `useResearchChat` composable создан
- [x] Research pages/components упрощены до чистого UI
- [x] Zero regression в функциональности Research

**Included Subtasks**:
- [x] T007: Создать StrapiResearchRepository (Infrastructure)
- [x] T008: Создать CreateResearchSession use case
- [x] T009: Создать SubmitResearchQuery use case
- [x] T010: Создать useResearchChat composable (Presentation)
- [x] T011: Рефакторинг Research страниц/компонентов

**Implementation Sketch**:
1. Реализовать `StrapiResearchRepository` в `infrastructure/repositories/`
2. Создать `CreateResearchSession` use case в `application/use-cases/research/`
3. Создать `SubmitResearchQuery` use case
4. Создать `useResearchChat` composable в `presentation/composables/`
5. Обновить `pages/research/[searchId].vue` для использования нового composable
6. Удалить дублирующую логику из компонентов

**Parallel Opportunities**: T008-T009 (разные use cases)

**Dependencies**: WP01 (требует Foundation Layer)

**Risks**:
- Research модуль может иметь неожиданную сложность
- Компоненты могут быть сильно связаны с бизнес-логикой

**Prompt File**: `tasks/WP02-research-migration.md`

---

### WP03: Speckits Module Migration

**Goal**: Полностью мигрировать Speckits модуль (самый сложный контентный модуль)

**Priority**: P1 (complex, establishes patterns for Prompts/Blogs)
**Estimated Size**: ~520 lines (7 subtasks)

**Success Criteria**:
- [ ] Speckit use cases созданы (GetSpeckitList, GetSpeckitDetail, DownloadSpeckitFile)
- [ ] StrapiArticlesRepository реализован с кешированием
- [ ] Speckit composables созданы
- [ ] Speckit pages/components используют только presentation layer
- [ ] File download работает через use case
- [ ] Diagram data обрабатывается корректно
- [ ] Zero regression в функциональности Speckits

**Included Subtasks**:
- [x] T012: Создать InMemoryCacheProvider реализацию
- [x] T013: Создать StrapiClient для работы с Strapi API
- [x] T014: Создать StrapiArticlesRepository (ArticlesRepository для Speckits)
- [x] T015: Создать GetSpeckitList use case
- [x] T016: Создать GetSpeckitDetail use case
- [x] T017: Создать DownloadSpeckitFile use case
- [x] T018: Создать Speckit composables и рефакторинг компонентов

**Implementation Sketch**:
1. Реализовать `InMemoryCacheProvider` с TTL и stale-while-revalidate
2. Создать `StrapiClient` с методами get/post и нормализацией ответов
3. Создать `StrapiArticlesRepository` с кешированием через cache provider
4. Создать use cases в `application/use-cases/speckits/`
5. Создать `useSpeckitList`, `useSpeckitDetail` composables
6. Обновить SpeckitCard, SpeckitDetail компоненты
7. Мигрировать страницу `pages/speckits/[speckitSlug].vue`

**Parallel Opportunities**: T015-T017 (разные use cases)

**Dependencies**: WP01 (Foundation), WP02 (для паттернов)

**Risks**:
- Speckits самый сложный модуль (files, diagrams, FAQ)
- Много компонентов для рефакторинга
- File download может требовать особой обработки

**Prompt File**: `tasks/WP03-speckits-migration.md`

---

### WP04: Prompts Module Migration

**Goal**: Мигрировать Prompts модуль, переиспользуя паттерны из Speckits

**Priority**: P2 (reuses established patterns)
**Estimated Size**: ~320 lines (4 subtasks)

**Success Criteria**:
- [x] Prompts use cases созданы
- [x] Prompts переиспользуют StrapiArticlesRepository
- [x] Prompt composables созданы
- [x] Prompt pages/components мигрированы
- [x] Zero code duplication между Prompts и Speckits
- [x] Миграция заняла меньше времени чем Speckits

**Included Subtasks**:
- [x] T019: Создать GetPromptList use case (переиспользовать паттерн)
- [x] T020: Создать GetPromptDetail use case
- [x] T021: Создать Prompt composables
- [x] T022: Рефакторинг Prompt компонентов и страниц

**Implementation Sketch**:
1. Создать use cases в `application/use-cases/prompts/` (переиспользовать структуру из Speckits)
2. Использовать существующий `StrapiArticlesRepository` (type='prompt')
3. Создать `usePromptList`, `usePromptDetail` composables
4. Обновить PromptCard, PromptDetail компоненты
5. Убедиться что нет дублирования кода с Speckits

**Parallel Opportunities**: T019-T020 (разные use cases)

**Dependencies**: WP01, WP03 (паттерны из Speckits)

**Risks**:
- Недостаточно времени для полной миграции
- Скрытые различия между Prompts и Speckits

**Prompt File**: `tasks/WP04-prompts-migration.md`

---

### WP05: Blogs & Categories Migration

**Goal**: Завершить миграцию контентных модулей

**Priority**: P2 (final content modules)
**Estimated Size**: ~380 lines (5 subtasks)

**Success Criteria**:
- [ ] Blogs use cases созданы
- [ ] CategoriesRepository реализован для всех модулей
- [ ] Categories кешируются корректно
- [ ] Фильтрация работает для всех типов контента
- [ ] Blogs pages/components мигрированы

**Included Subtasks**:
- [ ] T023: Создать StrapiCategoriesRepository
- [ ] T024: Создать GetCategories use case
- [ ] T025: Создать Blogs use cases
- [ ] T026: Создать Blog composables
- [ ] T027: Рефакторинг Blogs компонентов и фильтрации

**Implementation Sketch**:
1. Создать `StrapiCategoriesRepository` с кешированием
2. Создать `GetCategories` use case
3. Создать Blogs use cases в `application/use-cases/blogs/`
4. Создать `useBlogList`, `useBlogDetail` composables
5. Обновить фильтрацию категорий во всех модулях
6. Мигрировать Blogs страницы

**Parallel Opportunities**: T025-T026 (use cases + composables)

**Dependencies**: WP01, WP03, WP04 (все контентные типы)

**Risks**:
- Categories используются везде — высок риск регрессии
- Фильтрация может быть сложной

**Prompt File**: `tasks/WP05-blogs-categories-migration.md`

---

### WP06: Legacy Code Cleanup

**Goal**: Удалить весь legacy код после полной миграции

**Priority**: P3 (cleanup, может быть отложено)
**Estimated Size**: ~280 lines (4 subtasks)

**Success Criteria**:
- [ ] Legacy composables удалены (useFetchArticles, etc.)
- [ ] Legacy server routes удалены
- [ ] Все импорты обновлены на новые пути
- [ ] Нет дублирующего кода
- [x] Все тесты проходят

**Included Subtasks**:
- [x] T028: Удалить legacy composables
- [x] T029: Удалить legacy server routes
- [x] T030: Обновить все импорты в компонентах
- [x] T031: Финальная валидация и cleanup

**Implementation Sketch**:
1. Удалить `frontend/composables/useFetchArticles.ts` и другие legacy composables
2. Удалить `frontend/server/api/articles.get.ts`, `speckits.get.ts`, etc.
3. Найти и обновить все импорты от старых путей к новым
4. Запустить все тесты и убедиться что ничего не сломалось
5. Комплексное E2E тестирование

**Parallel Opportunities**: T028-T029 (разные папки)

**Dependencies**: WP02, WP03, WP04, WP05 (все модули мигрированы)

**Risks**:
- Удаление нужного кода → комплексное тестирование перед cleanup
- Скрытые зависимости от legacy кода

**Prompt File**: `tasks/WP06-legacy-cleanup.md`

---

## Dependencies Summary

```
WP01 (Foundation) — NO DEPENDENCIES
    ↓
WP02 (Research) — depends on WP01
    ↓
WP03 (Speckits) — depends on WP01, WP02
    ↓
WP04 (Prompts) — depends on WP01, WP03
    ↓
WP05 (Blogs/Categories) — depends on WP01, WP03, WP04
    ↓
WP06 (Cleanup) — depends on WP02, WP03, WP04, WP05
```

**Critical Path**: WP01 → WP02 → WP03 → WP04 → WP05 → WP06

**Parallelization Potential**:
- После WP03: WP04 можно начинать параллельно с WP05 если команды достаточно
- WP06 требует завершения всех миграционных WPs

---

## Size Validation

| WP | Subtasks | Est. Lines | Status |
|----|----------|------------|--------|
| WP01 | 6 | ~480 | ✅ Ideal range |
| WP02 | 5 | ~420 | ✅ Ideal range |
| WP03 | 7 | ~520 | ✅ Ideal range |
| WP04 | 4 | ~320 | ✅ Ideal range |
| WP05 | 5 | ~380 | ✅ Ideal range |
| WP06 | 4 | ~280 | ✅ Ideal range |

**Total**: 31 subtasks, ~2400 lines of prompts

✅ **All WPs within ideal size range (3-7 subtasks, 200-500 lines)**

---

## MVP Scope

**Minimum Viable Migration**: WP01 + WP02

Это даёт:
- Базовую архитектуру (Foundation)
- Один полностью мигрированный модуль (Research)
- Обкатанные паттерны для остальных модулей

**Remaining WPs** (WP03-WP06) могут быть реализованы постепенно.

---

## Next Steps

1. Review work packages in this file
2. Run `/spec-kitty.analyze` for cross-artifact validation
3. Run `/spec-kitty.implement WP01` to start implementation

---

**Generated**: 2025-02-21
**Ready for Implementation**: Yes
