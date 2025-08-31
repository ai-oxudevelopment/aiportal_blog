# Work Progress Tests - Система автоматизированного тестирования рабочего процесса

Эта система предназначена для автоматизированной проверки выполнения задач из рабочего процесса с AI (TaskMaster).

## 📁 Структура проекта

```
cypress/
├── work-progress-tests/           # Основная папка с тестами рабочего процесса
│   ├── README.md                  # Документация по тестам
│   ├── task-001-project-structure.cy.ts
│   ├── task-001-project-structure-simple.cy.ts
│   ├── README-task-001.md
│   └── task-template.cy.ts        # Шаблон для новых тестов
├── fixtures/
│   ├── project-structure.json     # Данные для Task 1
│   └── task-template-data.json    # Шаблон данных
├── support/
│   └── tasks.ts                   # Пользовательские задачи Cypress
└── e2e/                           # Обычные E2E тесты
    ├── accessibility.cy.ts
    └── project-state.cy.ts

scripts/
└── run-work-progress-tests.sh     # Скрипт запуска всех тестов
```

## 🚀 Быстрый старт

### Установка зависимостей
```bash
# С npm
npm install

# С bun (рекомендуется)
bun install
```

### Запуск тестов

#### Все тесты рабочего процесса
```bash
# С npm
npm run test:work-progress

# С bun (рекомендуется)
bun run test:work-progress
```


#### Интерактивный режим
```bash
# Открыть Cypress для всех тестов
bun run test:work-progress-open

# Открыть Cypress для Task 1
bun run test:task-001-open
```

## 📋 Доступные команды

### Основные команды
| Команда | Описание |
|---------|----------|
| `bun run test:work-progress:bun` | Запуск всех тестов рабочего процесса |
| `bun run test:work-progress-open` | Открыть Cypress для всех тестов |
| `bun run test:task-001:bun` | Запуск упрощенных тестов Task 1 |
| `bun run test:task-001-full:bun` | Запуск полных тестов Task 1 |
| `bun run test:task-001-open` | Открыть Cypress для Task 1 |

### Скрипты
| Скрипт | Описание |
|--------|----------|
| `./scripts/verify-task-001.sh` | Проверка Task 1 с автоматическим определением пакетного менеджера |
| `./scripts/run-work-progress-tests.sh` | Запуск всех тестов рабочего процесса |

## 🎯 Текущие тесты

### Task 1: Project Structure Setup
- **Файлы:** `task-001-project-structure*.cy.ts`
- **Назначение:** Проверка настройки двухпапочной структуры (frontend/backend)
- **Проверяет:**
  - ✅ Создание папок frontend и backend
  - ✅ Перемещение Next.js шаблона в frontend
  - ✅ Инициализация Strapi CMS в backend
  - ✅ Конфигурационные файлы
  - ✅ Запуск приложений
  - ✅ Доступность портов

## 📝 Создание новых тестов

### 1. Использование шаблона
```bash
# Скопировать шаблон
cp cypress/work-progress-tests/task-template.cy.ts cypress/work-progress-tests/task-002-description.cy.ts

# Скопировать данные
cp cypress/fixtures/task-template-data.json cypress/fixtures/task-002-data.json
```

### 2. Обновление package.json
Добавить новые команды:
```json
{
  "scripts": {
    "test:task-002:bun": "bun run cypress run --spec 'cypress/work-progress-tests/task-002-description.cy.ts'",
    "test:task-002-full:bun": "bun run cypress run --spec 'cypress/work-progress-tests/task-002-description-full.cy.ts'"
  }
}
```

### 3. Создание документации
Создать `cypress/work-progress-tests/README-task-002.md`

## 🔧 Конфигурация

### Cypress Configuration
Файл `cypress.config.ts` настроен для работы с тестами из обеих папок:
- `cypress/e2e/**/*.cy.ts` - Обычные E2E тесты
- `cypress/work-progress-tests/**/*.cy.ts` - Тесты рабочего процесса

### Пользовательские задачи
Файл `cypress/support/tasks.ts` содержит задачи для:
- **File System:** `readdir`, `readFile`, `fileExists`, `dirExists`
- **Port Checking:** `checkPort`
- **Application Management:** `startFrontend`, `stopFrontend`, `startBackend`, `stopBackend`

## 🎨 Конвенции именования

### Файлы тестов
- `task-XXX-description.cy.ts` - Основные тесты
- `task-XXX-description-simple.cy.ts` - Упрощенные тесты
- `task-XXX-description-full.cy.ts` - Полные интеграционные тесты

### Команды
- `test:task-XXX:bun` - Упрощенные тесты с bun
- `test:task-XXX-full:bun` - Полные тесты с bun
- `test:task-XXX-open` - Интерактивный режим

### Фикстуры
- `task-XXX-data.json` - Данные для конкретной задачи

## 🔍 Отладка

### Проблемы с запуском
```bash
# Проверить структуру файлов
ls -la cypress/work-progress-tests/

# Проверить конфигурацию Cypress
cat cypress.config.ts

# Запустить в интерактивном режиме
bun run cypress open
```

### Логи и вывод
```bash
# Подробный вывод
DEBUG=cypress:* bun run test:work-progress:bun

# Только ошибки
bun run test:work-progress:bun --quiet
```

## 📚 Документация

- `cypress/work-progress-tests/README.md` - Основная документация
- `cypress/work-progress-tests/README-task-001.md` - Документация Task 1
- `cypress/work-progress-tests/task-template.cy.ts` - Шаблон тестов
- `cypress/fixtures/task-template-data.json` - Шаблон данных

## 🚀 Интеграция с TaskMaster

Система интегрирована с рабочим процессом TaskMaster:

1. **До выполнения задачи:** Тесты покажут требования
2. **Во время выполнения:** Тесты можно запускать для проверки прогресса
3. **После выполнения:** Все тесты должны проходить успешно

### Workflow
```bash
# 1. Проверить текущий статус
bun run test:work-progress:bun

# 2. Выполнить задачу
# ... работа над задачей ...

# 3. Проверить результат
bun run test:task-XXX:bun

# 4. Если все тесты проходят - задача завершена
```

## 🎉 Преимущества системы

- ✅ **Автоматизированная проверка** выполнения задач
- ✅ **Четкие критерии** завершения каждой задачи
- ✅ **Поддержка bun и npm** для гибкости
- ✅ **Интерактивный режим** для отладки
- ✅ **Шаблоны** для быстрого создания новых тестов
- ✅ **Документация** для каждой задачи
- ✅ **Интеграция** с рабочим процессом TaskMaster
