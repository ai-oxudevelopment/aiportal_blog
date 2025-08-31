# AI Portal Blog

AI Portal Blog с Next.js frontend и Strapi CMS backend.

## Структура проекта

```
aiportal_blog/
├── frontend/          # Next.js приложение
├── backend/           # Strapi CMS
├── docs/             # Документация
└── scripts/          # Скрипты
```

## Требования

- Node.js 18+ (для frontend)
- Docker (для backend Strapi)
- npm или yarn

## Установка и запуск

### 1. Установка зависимостей

```bash
npm run install:all
```

### 2. Запуск в режиме разработки

```bash
# Запуск обоих приложений одновременно
npm run dev

# Или по отдельности:
npm run dev:frontend  # Frontend на http://localhost:3000
npm run dev:backend   # Backend на http://localhost:1337
```

### 3. Запуск в продакшн режиме

```bash
npm run build
npm run start
```

## Доступ к приложениям

- **Frontend**: http://localhost:3000
- **Backend Strapi**: http://localhost:1337
- **Strapi Admin**: http://localhost:1337/admin

## Полезные команды

```bash
npm run clean          # Очистка кэша
npm run test           # Запуск тестов
npm run logs           # Просмотр логов backend
```

## Разработка

- Frontend: Next.js с TypeScript и Tailwind CSS
- Backend: Strapi CMS с SQLite базой данных
- База данных: SQLite (для разработки)
