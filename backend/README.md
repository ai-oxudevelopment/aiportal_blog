# Strapi Backend

Базовая архитектура Strapi CMS для блога AI Portal.

## Структура

```
backend/
├── app/                    # Основное приложение Strapi
│   ├── config/            # Конфигурация
│   ├── src/
│   │   ├── api/           # API контроллеры и схемы
│   │   │   ├── article/   # Статьи
│   │   │   ├── author/    # Авторы
│   │   │   ├── category/  # Категории
│   │   │   ├── collection/# Коллекции
│   │   │   ├── playbook/  # Плейбуки
│   │   │   ├── section/   # Разделы
│   │   │   └── tag/       # Теги
│   │   └── extensions/    # Расширения
│   └── public/uploads/    # Загруженные файлы
├── scripts/admin/         # Административные скрипты
│   ├── populate-content.js      # Заполнение контентом
│   └── setup-public-permissions.js # Настройка публичного доступа
└── docker-compose.yml     # Docker конфигурация
```

## Запуск

```bash
# Запуск через Docker Compose
docker-compose up -d

# Или локально
cd app && npm run develop
```

## API

- **Админ панель**: http://localhost:1337/admin
- **API**: http://localhost:1337/api/

## Контент-типы

- **Sections** - Основные разделы блога
- **Categories** - Категории статей
- **Articles** - Статьи блога
- **Authors** - Авторы статей
- **Tags** - Теги для статей
- **Collections** - Коллекции статей
- **Playbooks** - Плейбуки и руководства

## Скрипты

- `populate-content.js` - Заполнение базы данных тестовым контентом
- `setup-public-permissions.js` - Настройка публичного доступа к API
