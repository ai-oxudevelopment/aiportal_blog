# Tasks: Production Readiness Cleanup

**Feature**: 003-production-readiness-cleanup
**Status**: Ready for Implementation
**Last Updated**: 2025-02-24

---

## Overview

Комплексный рефакторинг кодовой базы AI Portal Blog для устранения технического долга. 7 work packages покрывают все области cleanup: Configuration, Logging, Error Handling, Type Safety (2 phases), Performance, и Testing.

**Migration Order**: Foundation → Logging → Errors → Types → Performance → Testing

**Total Work Packages**: 7
**Total Subtasks**: 40
**Estimated Prompt Size**: 280-420 lines per WP

---

## Work Packages

### WP01: Configuration Foundation

**Goal**: Создать централизованную систему конфигурации и убрать хардкод

**Priority**: P0 (blocks other WPs that need config)
**Estimated Size**: ~350 lines (6 subtasks)

**Success Criteria**:
- [ ] Все hardcoded URLs вынесены в config
- [ ] Config типизирован и валидируется
- [ ] Значения по умолчанию определены
- [ ] TypeScript компилируется без ошибок

**Included Subtasks**:
- [x] T001: Аудит кода на hardcoded значения
- [x] T002: Создать структуру config директории
- [x] T003: Обновить nuxt.config.ts с runtimeConfig
- [x] T004: Создать типы для конфигурации
- [x] T005: Добавить валидацию конфига на старте
- [x] T006: Заменить хардкод на config ссылки

**Implementation Sketch**:
1. Найти все hardcoded URLs, timeouts (grep search)
2. Создать `frontend/config/` с index.ts, app.config.ts, api.config.ts, defaults.ts
3. Обновить `nuxt.config.ts` с runtimeConfig для public/private значений
4. Создать `types/config.ts` с RuntimeConfig интерфейсами
5. Добавить плагин для валидации на старте
6. Заменить хардкод в коде на `useRuntimeConfig()`

**Parallel Opportunities**: T002-T004 можно делать параллельно (разные файлы)

**Dependencies**: None (foundational work)

**Risks**:
- Config значения могут быть забыты при рефакторинге
- Неполный аудит хардкода

**Prompt File**: `tasks/WP01-config-foundation.md`

---

### WP02: Logging Infrastructure

**Goal**: Внедрить Winston logging и заменить console.log

**Priority**: P1 (enables better debugging)

**Estimated Size**: ~420 lines (7 subtasks)

**Success Criteria**:
- [ ] Winston установлен и настроен
- [ ] Logger interface создан
- [ ] TraceContext для request tracing работает
- [ ] Все console.log заменены на logger
- [ ] Server routes используют logger

**Included Subtasks**:
- [ ] T007: Установить Winston и зависимости
- [ ] T008: Создать logger infrastructure
- [ ] T009: Реализовать TraceContext
- [ ] T010: Создать Nuxt plugin для logger
- [ ] T011: Заменить console.log на logger.info
- [ ] T012: Заменить console.error на logger.error
- [ ] T013: Добавить logging в server API routes

**Implementation Sketch**:
1. `npm install winston winston-daily-rotate-file`
2. Создать `infrastructure/logging/logger.ts` с ILogger interface
3. Создать `infrastructure/logging/winston.ts` с Winston implementation
4. Создать `infrastructure/logging/context.ts` для TraceContext
5. Создать Nuxt plugin который инжектит logger в контекст
6. Найти и заменить все console.log/logger.info
7. Добавить logger calls в server/api/routes

**Parallel Opportunities**: T008-T009 (разные файлы)

**Dependencies**: None (independent area)

**Risks**:
- Winston может не работать в browser environment
- Request tracing может быть сложным для SSR

**Prompt File**: `tasks/WP02-logging-infrastructure.md`

---

### WP03: Error Handling System

**Goal**: Создать error handling систему с custom error classes

**Priority**: P1 (enables graceful error handling)

**Estimated Size**: ~380 lines (6 subtasks)

**Success Criteria**:
- [ ] Error class hierarchy создана
- [ ] Global error handler работает
- [ ] Vue error boundary component создан
- [ ] Async operations обёрнуты в try-catch
- [ ] User-friendly error messages

**Included Subtasks**:
- [ ] T014: Создать error class hierarchy
- [ ] T015: Реализовать global error handler
- [ ] T016: Создать Vue error boundary component
- [ ] T017: Wrap async operations (server routes)
- [ ] T018: Wrap async operations (composables)
- [ ] T019: Добавить user-friendly error messages

**Implementation Sketch**:
1. Создать `infrastructure/errors/AppError.ts` (base class)
2. Создать `ApiError.ts`, `ValidationError.ts`, `ConfigError.ts`, `NetworkError.ts`
3. Добавить `vue.onError` hook в nuxt.config.ts
4. Создать `ErrorBoundary.vue` component
5. Найти все async операции в server/api/ и обернуть в try-catch
6. Найти async операции в composables/ и обернуть в try-catch
7. Создать маппинг error codes → user messages

**Parallel Opportunities**: T014-T016 (разные файлы), T017-T018 (разные папки)

**Dependencies**: WP02 (for error logging)

**Risks**:
- Error boundaries могут не работать корректно в SSR
- Некоторые ошибки могут быть не пойманы

**Prompt File**: `tasks/WP03-error-handling-system.md`

---

### WP04: Type Safety Phase 1

**Goal**: Создать API types и включить noImplicitAny

**Priority**: P2 (first phase of type safety)

**Estimated Size**: ~360 lines (6 subtasks)

**Success Criteria**:
- [ ] API response типы определены
- [ ] `any` types найдены и задокументированы
- [ ] Часть `any` заменена на proper types
- [ ] noImplicitAny включен
- [ ] TypeScript компилируется

**Included Subtasks**:
- [ ] T020: Создать API response type definitions
- [ ] T021: Аудит кода на `any` types
- [ ] T022: Заменить `any` types (part 1 - API responses)
- [ ] T023: Заменить `any` types (part 2 - components)
- [ ] T024: Включить noImplicitAny в tsconfig.json
- [ ] T025: Исправить type errors от noImplicitAny

**Implementation Sketch**:
1. Создать `types/api.ts` с StrapiResponse, Article, и т.д.
2. Создать `types/errors.ts` с error types
3. Grep поиск `: any` в коде
4. Заменить `any` на proper types (итеративно)
5. Обновить `tsconfig.json` с `noImplicitAny: true`
6. Запустить `nuxi typecheck` и исправить ошибки

**Parallel Opportunities**: T020-T021 (разные типы), T022-T023 (разные области)

**Dependencies**: None (independent area)

**Risks**:
- Много `any` может быть сложно заменить
- Некоторые типы могут быть сложными для определения

**Prompt File**: `tasks/WP04-type-safety-phase1.md`

---

### WP05: Type Safety Phase 2

**Goal**: Включить strictNullChecks и full strict mode

**Priority**: P2 (second phase of type safety)

**Estimated Size**: ~300 lines (5 subtasks)

**Success Criteria**:
- [ ] strictNullChecks включен
- [ ] Null reference errors исправлены
- [ ] Full strict mode включен
- [ ] Все type errors исправлены
- [ ] Remaining `any` documented

**Included Subtasks**:
- [ ] T026: Включить strictNullChecks в tsconfig.json
- [ ] T027: Исправить null reference errors
- [ ] T028: Включить full strict mode
- [ ] T029: Документировать remaining `any` types
- [ ] T030: Верифицировать TypeScript компиляцию

**Implementation Sketch**:
1. Обновить `tsconfig.json` с `strictNullChecks: true`
2. Добавить optional chaining и nullish coalescing где нужно
3. Включить `strict: true`
4. Добавить `// @ts-expect-error: reason` для оправданных `any`
5. Запустить `nuxi typecheck` для верификации

**Parallel Opportunities**: T027 может быть параллельно с T028

**Dependencies**: WP04 (must complete phase 1 first)

**Risks**:
- StrictNullChecks может reveal много скрытых багов
- Может быть сложно исправить все ошибки

**Prompt File**: `tasks/WP05-type-safety-phase2.md`

---

### WP06: Performance Optimization

**Goal**: Оптимизировать производительность приложения

**Priority**: P3 (optimization, not blocking)

**Estimated Size**: ~360 lines (6 subtasks)

**Success Criteria**:
- [ ] Lighthouse baseline установлен
- [ ] Bundle size оптимизирован
- [ ] Lazy loading реализован
- [ ] Images оптимизированы
- [ ] Cache strategy оптимизирована
- [ ] Lighthouse score не ухудшается

**Included Subtasks**:
- [ ] T031: Запустить Lighthouse audit (baseline)
- [ ] T032: Оптимизировать bundle size
- [ ] T033: Реализовать lazy loading для компонентов
- [ ] T034: Оптимизировать image loading
- [ ] T035: Оптимизировать cache strategy
- [ ] T036: Запустить финальный Lighthouse audit

**Implementation Sketch**:
1. Установить и запустить Lighthouse CI
2. Использовать webpack-bundle-analyzer для анализа
3. Включить code splitting в nuxt.config.ts
4. Использовать Lazyload components для тяжелых компонентов
5. Конвертировать images в WebP, добавить lazy loading
6. Проверить и оптимизировать stale-while-revalidate кеш
7. Запустить финальный Lighthouse audit

**Parallel Opportunities**: T033-T034 (разные оптимизации)

**Dependencies**: WP01-WP05 (лучше после основного рефакторинга)

**Risks**:
- Оптимизации могут негативно влиять на UX
- Lighthouse score может ухудшиться временно

**Prompt File**: `tasks/WP06-performance-optimization.md`

---

### WP07: Testing & Polish

**Goal**: Создать integration tests и верифицировать zero regression

**Priority**: P3 (testing and polish)

**Estimated Size**: ~280 lines (5 subtasks)

**Success Criteria**:
- [ ] Integration tests для config
- [ ] Integration tests для logging
- [ ] Integration tests для error handling
- [ ] E2E tests проходят
- [ ] Documentation обновлена

**Included Subtasks**:
- [ ] T037: Создать integration tests для config
- [ ] T038: Создать integration tests для logging
- [ ] T039: Создать integration tests для error handling
- [ ] T040: Запустить E2E tests (zero regression)
- [ ] T041: Обновить documentation

**Implementation Sketch**:
1. Создать `tests/integration/config.test.ts`
2. Создать `tests/integration/logging.test.ts`
3. Создать `tests/integration/errors.test.ts`
4. Запустить Playwright E2E тесты
5. Обновить README и quickstart.md если нужно

**Parallel Opportunities**: T037-T039 (разные тесты)

**Dependencies**: WP01-WP06 (все основные работы завершены)

**Risks**:
- E2E тесты могут reveal regression
- Тесты могут быть flaky

**Prompt File**: `tasks/WP07-testing-and-polish.md`

---

## Dependencies Summary

```
WP01 (Config Foundation) — NO DEPENDENCIES
    ↓
WP02 (Logging) — NO DEPENDENCIES (parallel to WP01)
    ↓
WP03 (Error Handling) — DEPENDS ON WP02
    ↓
WP04 (Type Safety Phase 1) — NO DEPENDENCIES (parallel to WP01-WP03)
    ↓
WP05 (Type Safety Phase 2) — DEPENDS ON WP04
    ↓
WP06 (Performance) — DEPENDS ON WP01-WP05 (better after refactoring)
    ↓
WP07 (Testing) — DEPENDS ON WP01-WP06
```

**Critical Path**: WP01 → WP02 → WP03 → (WP04 → WP05) → WP06 → WP07

**Parallelization Potential**:
- **Wave 1**: WP01 + WP04 (Config + Type Safety Phase 1) - independent
- **Wave 2**: WP02 (Logging) - after WP01
- **Wave 3**: WP03 (Error Handling) - after WP02
- **Wave 4**: WP05 (Type Safety Phase 2) - after WP04
- **Wave 5**: WP06 (Performance) - after WP01-WP05
- **Wave 6**: WP07 (Testing) - after all

---

## Size Validation

| WP | Subtasks | Est. Lines | Status |
|----|----------|------------|--------|
| WP01 | 6 | ~350 | ✅ Ideal range |
| WP02 | 7 | ~420 | ✅ Ideal range |
| WP03 | 6 | ~380 | ✅ Ideal range |
| WP04 | 6 | ~360 | ✅ Ideal range |
| WP05 | 5 | ~300 | ✅ Ideal range |
| WP06 | 6 | ~360 | ✅ Ideal range |
| WP07 | 5 | ~280 | ✅ Ideal range |

**Total**: 41 subtasks, ~2450 lines of prompts

✅ **All WPs within ideal size range (3-7 subtasks, 200-500 lines)**

---

## MVP Scope

**Minimum Viable Cleanup**: WP01 + WP02 + WP03

Это даёт:
- Централизованную конфигурацию (no hardcoded values)
- Структурированное логирование
- Error handling систему

**Remaining WPs** (WP04-WP07) могут быть реализованы постепенно.

---

## Next Steps

1. Review work packages in this file
2. Run `/spec-kitty.analyze` for cross-artifact validation
3. Run `/spec-kitty.implement WP01` to start implementation

---

**Generated**: 2025-02-24
**Ready for Implementation**: Yes
