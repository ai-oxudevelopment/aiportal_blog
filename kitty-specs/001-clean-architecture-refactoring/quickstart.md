# Quickstart Guide: Clean Architecture

**Для разработчиков AI Portal Blog**

Это руководство поможет вам понять и работать с новой архитектурой.

---

## 🚀 Быстрый старт

### Структура проекта

```
frontend/
├── src/                          # Новая архитектура
│   ├── domain/                   # Типы и интерфейсы
│   │   ├── entities/             # Article, Category, ResearchSession
│   │   └── repositories/         # Интерфейсы IArticlesRepository, etc.
│   │
│   ├── application/              # Бизнес-логика
│   │   └── use-cases/            # GetSpeckitList, GetPromptDetail, etc.
│   │
│   ├── infrastructure/           # Техническая реализация
│   │   ├── repositories/         # StrapiArticlesRepository, etc.
│   │   └── cache/                # InMemoryCacheProvider
│   │
│   └── presentation/             # UI адаптеры
│       └── composables/          # useSpeckitList(), usePromptDetail(), etc.
│
├── components/                   # Vue компоненты (только UI)
├── pages/                        # Страницы (маршрутизация)
└── server/                       # Server routes (будет deprecated)
```

---

## 📚 Основные концепции

### Три слоя архитектуры

```
┌─────────────────────────────────────┐
│  Presentation Layer (composables)   │  ← Vue компоненты используют это
├─────────────────────────────────────┤
│  Application Layer (use cases)      │  ← Бизнес-логика здесь
├─────────────────────────────────────┤
│  Infrastructure Layer (repositories)│  ← API, кеширование здесь
└─────────────────────────────────────┘
```

### Правило dependencies

- **Presentation** зависит от **Application**
- **Application** зависит от **Domain** (типы) и **Infrastructure** (интерфейсы)
- **Infrastructure** зависит от **Domain**

---

## 🔧 Как добавить новую фичу

### Шаг 1: Определить Use Case

Создайте use case в `src/application/use-cases/`:

```typescript
// src/application/use-cases/speckits/DownloadSpeckitFile.ts
import type { IArticlesRepository } from '@/domain/repositories/IArticlesRepository'

export class DownloadSpeckitFile {
  constructor(
    private articlesRepo: IArticlesRepository
  ) {}

  async execute(speckitSlug: string): Promise<Blob> {
    const speckit = await this.articlesRepo.findBySlug(speckitSlug)
    if (!speckit?.file) {
      throw new Error('Speckit file not found')
    }

    // Логика скачивания файла
    return await fetch(speckit.file.url).then(r => r.blob())
  }
}
```

### Шаг 2: Создать Presentation Composable

Создайте composable в `src/presentation/composables/`:

```typescript
// src/presentation/composables/useSpeckitDownload.ts
export function useSpeckitDownload() {
  const downloadUseCase = new DownloadSpeckitFile(articlesRepo)

  const download = async (slug: string) => {
    const blob = await downloadUseCase.execute(slug)
    // Логика UI (например, показать notification)
    return blob
  }

  return { download }
}
```

### Шаг 3: Использовать в компоненте

```vue
<!-- components/speckit/SpeckitDownloadButton.vue -->
<script setup lang="ts">
const { download, loading, error } = useSpeckitDownload()

const handleDownload = async () => {
  await download(props.slug)
}
</script>

<template>
  <button @click="handleDownload" :disabled="loading">
    Download
  </button>
</template>
```

---

## 🧪 Как писать тесты

### Тест Use Case

```typescript
// tests/application/use-cases/DownloadSpeckitFile.test.ts
import { describe, it, expect } from 'vitest'
import { DownloadSpeckitFile } from '@/application/use-cases/speckits/DownloadSpeckitFile'
import { MockArticlesRepository } from '@/tests/mocks/MockArticlesRepository'

describe('DownloadSpeckitFile', () => {
  it('should download file from speckit', async () => {
    const mockRepo = new MockArticlesRepository()
    const useCase = new DownloadSpeckitFile(mockRepo)

    mockRepo.withArticles([
      { id: 1, slug: 'test', file: { url: '/file.pdf', ... } }
    ])

    const blob = await useCase.execute('test')

    expect(blob).instanceOf(Blob)
  })
})
```

---

## 🔄 Как мигрировать существующий компонент

### До (старый код):

```vue
<script setup lang="ts">
// Логика API прямо в компоненте
const { data } = await useFetch(`/api/speckits/${props.slug}`)
const speckit = computed(() => data.value?.data)
</script>
```

### После (новая архитектура):

```vue
<script setup lang="ts">
// Только UI логика
const { speckit, loading, error } = useSpeckitDetail(() => props.slug)
</script>
```

Логика API перенесена в:
1. `SpeckitDetail` use case (`application/use-cases/`)
2. `StrapiArticlesRepository` (`infrastructure/repositories/`)
3. `useSpeckitDetail` composable (`presentation/composables/`)

---

## 📝 Правила именования

### Use Cases
- Формат: `<Verb><Entity>` или `<Verb><Entity><Detail>`
- Примеры: `GetSpeckitList`, `DownloadSpeckitFile`, `CreateResearchSession`
- Расположение: `src/application/use-cases/<module>/`

### Repositories
- Интерфейс: `I<Entity>Repository` (Domain Layer)
- Реализация: `<Source><Entity>Repository` (Infrastructure Layer)
- Примеры: `IArticlesRepository`, `StrapiArticlesRepository`

### Composables
- Формат: `use<Entity><Action>` или `use<Action>`
- Примеры: `useSpeckitList`, `usePromptDetail`, `useResearchChat`
- Расположение: `src/presentation/composables/`

---

## ⚠️ Что НЕ делать

### ❌ Не вызывайте API из компонентов напрямую

```vue
<!-- ПЛОХО -->
<script setup>
const { data } = await useFetch('/api/articles')
</script>
```

```vue
<!-- ХОРОШО -->
<script setup>
const { articles, loading } = useArticleList()
</script>
```

### ❌ Не помещайте бизнес-логику в composables

Composables в `presentation/composables/` должны только адаптировать use cases для Vue. Бизнес-логика — в use cases.

### ❌ Не импортируйте Infrastructure из Domain

Domain Layer не должен знать про реализацию. Только интерфейсы.

---

## 🎯 Чек-лист для новой функции

- [ ] Use case создан в `src/application/use-cases/`
- [ ] Repository интерфейс в `src/domain/repositories/`
- [ ] Repository реализация в `src/infrastructure/repositories/`
- [ ] Presentation composable в `src/presentation/composables/`
- [ ] Компонент использует только presentation composable
- [ ] Тесты для use case написаны
- [ ] TypeScript без ошибок

---

## 🆘 Нужна помощь?

### Полезные команды

```bash
# Проверить типы
npm run type-check

# Запустить тесты
npm run test

# Проверить зависимости
npm run dep-check
```

### Контакты

- Архитектурные вопросы: смотри `plan.md`
- Data model: смотри `data-model.md`
- Repository contracts: смотри `contracts/repositories.ts`

---

**Помни**: Цель архитектуры — упростить разработку, а не усложнить. Если что-то кажется слишком сложным, спроси команду!
