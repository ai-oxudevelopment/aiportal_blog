# Research: Clean Architecture Refactoring

**Feature**: 001-clean-architecture-refactoring
**Date**: 2025-02-21

---

## R-001: Nuxt 3 Layered Architecture Best Practices

### Research Question
Как организовать слоистую архитектуру в Nuxt 3 приложении без нарушения SSR и автозагрузки?

### Findings

**Nuxt 3 Specific Considerations:**

1. **Auto-imports**: Nuxt автоматически импортирует из определённых папок. Для новой структуры:
   - `composables/` → автозагрузка (используем для Presentation Layer)
   - `utils/` → автозагрузка (можно для helper функций)
   - Пользовательские папки (src/) → требуют настройки в `nuxt.config.ts`

2. **Server vs Client**:
   - Server routes (`server/api/`) выполняются только на сервере
   - Use Cases должны быть isomorphic — работать и на сервере, и на клиенте
   - Infrastructure Layer должен адаптироваться к окружению

3. ** recommended Structure for Nuxt 3**:

```typescript
// nuxt.config.ts - настройка пользовательских папок
export default defineNuxtConfig({
  imports: {
    dirs: [
      'src/presentation/composables',  // Автоимпорт composables
      'src/application/use-cases/**',  // Автоимпорт use cases (опционально)
    ]
  }
})
```

**Decision**: Использовать `frontend/src/` для новых слоёв, настроить imports в `nuxt.config.ts`.

---

## R-002: Current Code Analysis

### Research Question
Какое дублирование существует в текущей кодовой базе?

### Findings

**Analyzed Files** (из git history):

1. **Composables**:
   - `useFetchArticles.ts` — получение статей из Strapi
   - `useFetchOneArticle.ts` — получение одной статьи
   - `useStrapiHelpers.ts` — хелперы для Strapi

2. **Server Routes**:
   - `server/api/articles.get.ts` — прокси для статей
   - `server/api/speckits.get.ts` — прокси для speckits
   - `server/api/speckits/[slug].get.ts` — детальная страница speckit
   - `server/api/speckits/[slug]/diagram.get.ts` — диаграммы

3. **Components**:
   - `SpeckitCard.vue` — карточка speckit
   - `SpeckitDetail.vue` — детальная страница
   - `PromptCard.vue` — карточка prompt
   - `EnhancedPromptCard.vue` — улучшенная карточка

**Identified Duplication**:

1. **Strapi Response Normalization**: В каждом server route повторяется логика нормализации ответа Strapi v4/v5
2. **Cache Logic**: Cache wrapper используется одинаково во всех routes
3. **Fetch Logic**: `useFetchArticles` и `useFetchOneArticle` дублируют логику URL построения

**Decision**: Создать единый StrapiClient в Infrastructure Layer и Repository pattern.

---

## R-003: Migration Patterns for Large Codebases

### Research Question
Как безопасно мигрировать большую кодовую базу на новую архитектуру?

### Findings

**Proven Patterns**:

1. **Strangler Fig Pattern** (recommended):
   - Создаём новую структуру параллельно
   - Постепенно "удушаем" старый код, направляя трафик в новый
   - Старый код остаётся работающим пока новый не готов

2. **Feature Toggle Migration**:
   - Использовать фичи-тогглы для переключения между старой и новой реализацией
   - Полезно для A/B тестирования производительности

3. **Vertical Slice Migration** (chosen):
   - Мигрируем по одной вертикали (feature) за раз
   - Каждая вертикаль независима
   - Меньше риск регрессии

**Decision**: Feature-based миграция (Vertical Slice) в порядке: Research → Speckits → Prompts → Blogs.

**Rationale**:
- Research наиболее независим от других модулей
- Speckits самый сложный — лучше мигрировать когда паттерны обкатаны
- Prompts и Blogs переиспользуют паттерны из Speckits

---

## R-004: Module Dependencies Analysis

### Research Question
Какие зависимости существуют между модулями?

### Findings

**Dependency Graph**:

```
Categories (центральный модуль)
    ├── Speckits (использует categories)
    ├── Prompts (использует categories)
    └── Blogs (использует categories)

Research (независимый модуль)
    └── Не зависит от контентных модулей
```

**Shared Logic**:
- Strapi integration (все модули)
- Cache providers (все модули)
- Type definitions (Articles, Categories)

**Decision**:
1. Начать с Research (независимый)
2. Создать общие абстракции в Foundation WP
3. Мигрировать Speckits (сложный, но независимый от Prompts/Blogs)
4. Prompts и Blogs могут переиспользовать паттерны из Speckits

---

## Summary of Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Структура папок | `frontend/src/` с настройкой imports | Nuxt 3 совместимость, SSR сохраняется |
| Дублирование | Единый StrapiClient + Repository pattern | Устраняет повторяющуюся логику |
| Миграция | Feature-based по модулям | Минимум рисков, независимые вертикали |
| Порядок модулей | Research → Speckits → Prompts → Blogs | От независимого к сложному |

---

## Open Questions

Отсутствуют. Все решения приняты.
