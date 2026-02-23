---
lane: "doing"
agent: "claude"
shell_pid: "6436"
review_status: "has_feedback"
reviewed_by: "ALeks ishmanov"
---
# WP06: Legacy Code Cleanup

**Work Package ID**: WP06
**Title**: Legacy Code Cleanup
**Lane**: planned
**Dependencies**: ["WP02", "WP03", "WP04", "WP05"]
**Subtasks**: ["T028", "T029", "T030", "T031"]

**History**:
- 2025-02-21: Created during task generation

---

## Objective

Удалить весь legacy код после полной миграции всех модулей. Это финальный cleanup, который оставляет только новую архитектуру.

**⚠️ CRITICAL**: Этот WP можно запускать только после завершения WP02-WP05 и комплексного тестирования.

**Success Criteria**:
- Legacy composables удалены
- Legacy server routes удалены
- Все импорты обновлены на новые пути
- Нет дублирующего кода
- Все тесты проходят

---

## Context

**Legacy Code to Remove**:
- `frontend/composables/useFetchArticles.ts`
- `frontend/composables/useFetchOneArticle.ts`
- `frontend/composables/useStrapiHelpers.ts`
- `frontend/server/api/articles.get.ts`
- `frontend/server/api/speckits.get.ts`
- `frontend/server/api/speckits/[slug].get.ts`
- `frontend/server/api/speckits/[slug]/diagram.get.ts`
- `frontend/server/api/research/*` (если не используется)
- `frontend/types/article.ts` (заменён на Domain entities)

**Note**: Старые компоненты могут остаться если они работают, но они должны использовать новые composables.

---

## Subtasks

### T028: Удалить legacy composables

**Purpose**: Удалить старые composables которые заменены на новую архитектуру.

**Steps**:

1. Удалить следующие файлы:
   ```bash
   rm frontend/composables/useFetchArticles.ts
   rm frontend/composables/useFetchOneArticle.ts
   rm frontend/composables/useStrapiHelpers.ts
   rm frontend/composables/useFileDownload.ts  # если есть
   rm frontend/composables/useClipboard.ts  # если не используется
   ```

2. Убедиться что нигде не осталось импортов:
   ```bash
   grep -r "useFetchArticles" frontend/ --exclude-dir=node_modules --exclude-dir=.nuxt
   grep -r "useFetchOneArticle" frontend/ --exclude-dir=node_modules --exclude-dir=.nuxt
   grep -r "useStrapiHelpers" frontend/ --exclude-dir=node_modules --exclude-dir=.nuxt
   ```

**Validation**:
- [x] Все legacy composables удалены
- [x] Никаких импортов от старых composables
- [x] Все компоненты используют новые `src/presentation/composables`

**Files**:
- Удаление нескольких файлов

---

### T029: Удалить legacy server routes

**Purpose**: Удалить старые server routes, логика которых перешла в use cases.

**Steps**:

1. Удалить следующие файлы:
   ```bash
   rm -rf frontend/server/api/articles.get.ts
   rm -rf frontend/server/api/speckits.get.ts
   rm -rf frontend/server/api/speckits/[slug].get.ts
   rm -rf frontend/server/api/speckits/[slug]/diagram.get.ts
   rm -rf frontend/server/api/research/*
   ```

2. Проверить что server/api больше не нужен:
   ```bash
   ls -la frontend/server/api/
   # Если пусто, можно удалить директорию
   ```

**Validation**:
- [x] Все legacy server routes удалены
- [x] Новые use cases не зависят от server routes

**Files**:
- Удаление нескольких файлов

---

### T030: Обновить все импорты в компонентах

**Purpose**: Обновить импорты от старых путей к новым.

**Steps**:

1. Найти все импорты от старых путей:
   ```bash
   grep -r "from '@/composables/" frontend/components frontend/pages
   grep -r "from '@/types/" frontend/components frontend/pages
   ```

2. Заменить импорты:
   - `@/composables/...` → `@/presentation/composables/...`
   - `@/types/article` → `@/domain/entities`

3. Обновить `tsconfig.json` если есть path aliases:
   ```json
   {
     "paths": {
       "@/*": ["./src/*", "./*"],
       "@domain/*": ["./src/domain/*"],
       "@application/*": ["./src/application/*"],
       "@infrastructure/*": ["./src/infrastructure/*"],
       "@presentation/*": ["./src/presentation/*"]
     }
   }
   ```

**Validation**:
- [x] Все импорты используют новые пути
- [x] TypeScript не выдаёт ошибок
- [x] Ничего не импортируется из удалённых файлов

**Files**:
- Обновление множества файлов

---

### T031: Финальная валидация и cleanup

**Purpose**: Комплексная проверка что ничего не сломалось.

**Steps**:

1. Запустить все тесты:
   ```bash
   yarn test
   ```

2. Запустить type check:
   ```bash
   yarn build  # или npx tsc --noEmit
   ```

3. Запустить dev server и проверить:
   ```bash
   yarn dev
   ```
   - Проверить `/speckits` страницу
   - Проверить `/prompts` страницу
   - Проверить `/blogs` страницу
   - Проверить `/research` страницу
   - Проверить фильтрацию категорий

4. E2E тестирование:
   - Пройти все основные user flows
   - Убедиться что фильтрация работает
   - Убедиться что детальные страницы открываются
   - Убедиться что file download работает

5. Удалить временные файлы:
   ```bash
   # Удалить старые типы если они не используются
   rm frontend/types/article.ts  # если всё мигрировано
   ```

6. Коммит изменений:
   ```bash
   git add .
   git commit -m "feat: complete migration to clean architecture

   - Removed legacy composables
   - Removed legacy server routes
   - Updated all imports to new architecture
   - All modules migrated: Research, Speckits, Prompts, Blogs
   "
   ```

**Validation**:
- [x] Все тесты проходят
- [x] TypeScript без ошибок
- [x] Dev server запускается
- [x] Все страницы работают
- [x] Фильтрация работает
- [x] Zero regression

**Files**:
- Коммит изменений

---

## Definition of Done

- [x] Все legacy composables удалены
- [x] Все legacy server routes удалены
- [x] Все импорты обновлены
- [x] Никакого дублирующего кода
- [x] Все тесты проходят
- [x] E2E тестирование успешно
- [x] Changes committed

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Удаление нужного кода | Комплексное тестирование ПЕРЕД удалением |
| Скрытые зависимости от legacy кода | Грепать все импорты, проверять каждый |
| Something breaks in production | E2E тестирование, feature branches |

---

## Reviewer Guidance

**What to verify**:
1. Никаких legacy файлов не осталось
2. Все импорты обновлены
3. Всё работает после миграции

**Red flags**:
- ❌ Остались импорты от удалённых файлов
- ❌ Something broken

**Green flags**:
- ✅ Чистая архитектура
- ✅ Zero дублирования
- ✅ Всё работает

---

## Implementation Command

```bash
spec-kitty implement WP06 --base WP05
```

Основание на WP05 (последний контентный модуль).

**⚠️ WARNING**: Перед запуском убедитесь что все предыдущие WPs завершены и протестированы!

## Activity Log

- 2026-02-21T11:39:12Z – unknown – lane=for_review – Moved to for_review
- 2026-02-23T20:24:38Z – claude – shell_pid=1237 – lane=doing – Started implementation via workflow command
- 2026-02-23T20:30:18Z – claude – shell_pid=1237 – lane=for_review – Ready for review: Legacy code cleaned up. All composables, server routes, and types migrated to new clean architecture.
- 2026-02-23T20:34:16Z – claude – shell_pid=3753 – lane=doing – Started review via workflow command
- 2026-02-23T20:36:32Z – claude – shell_pid=3753 – lane=planned – Moved to planned
- 2026-02-23T20:40:41Z – claude – shell_pid=6436 – lane=doing – Started implementation via workflow command
