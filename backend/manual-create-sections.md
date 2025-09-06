# Инструкция по созданию секций в Strapi

## Шаг 1: Удалить существующие секции
1. Откройте Strapi Admin: http://localhost:1337/admin
2. Перейдите в Content Manager → Section
3. Удалите существующие секции "Секция-1" и "Секция-2"

## Шаг 2: Создать главные секции

### Секция "Инструменты"
- **Name**: Инструменты
- **Slug**: tools
- **Description**: Готовые инструменты и решения для работы с AI
- **Icon**: 🛠️
- **Order**: 1
- **Section Type**: main
- **Published**: ✅

### Секция "Изучить"
- **Name**: Изучить
- **Slug**: learn
- **Description**: Образовательные материалы и исследования
- **Icon**: 📚
- **Order**: 2
- **Section Type**: main
- **Published**: ✅

### Секция "Внедрить"
- **Name**: Внедрить
- **Slug**: implement
- **Description**: Практические руководства по внедрению
- **Icon**: 🚀
- **Order**: 3
- **Section Type**: main
- **Published**: ✅

## Шаг 3: Создать подсекции

### Подсекции для "Инструменты" (Parent Section: Инструменты)
1. **Готовые инструкции**
   - Name: Готовые инструкции
   - Slug: ready-instructions
   - Description: Пошаговые инструкции для различных задач
   - Icon: 📋
   - Order: 1
   - Section Type: sub
   - Parent Section: Инструменты
   - Published: ✅

2. **AI-агенты**
   - Name: AI-агенты
   - Slug: ai-agents
   - Description: Готовые AI-агенты для автоматизации
   - Icon: 🤖
   - Order: 2
   - Section Type: sub
   - Parent Section: Инструменты
   - Published: ✅

3. **MCP**
   - Name: MCP
   - Slug: mcp
   - Description: Model Context Protocol инструменты
   - Icon: 🔗
   - Order: 3
   - Section Type: sub
   - Parent Section: Инструменты
   - Published: ✅

### Подсекции для "Изучить" (Parent Section: Изучить)
1. **Исследования**
   - Name: Исследования
   - Slug: research
   - Description: Научные исследования и аналитика
   - Icon: 🔬
   - Order: 1
   - Section Type: sub
   - Parent Section: Изучить
   - Published: ✅

2. **Видеокурсы**
   - Name: Видеокурсы
   - Slug: video-courses
   - Description: Обучающие видео и курсы
   - Icon: 🎥
   - Order: 2
   - Section Type: sub
   - Parent Section: Изучить
   - Published: ✅

3. **Учебные статьи**
   - Name: Учебные статьи
   - Slug: tutorials
   - Description: Подробные обучающие материалы
   - Icon: 📖
   - Order: 3
   - Section Type: sub
   - Parent Section: Изучить
   - Published: ✅

4. **UseCases платформы**
   - Name: UseCases платформы
   - Slug: platform-usecases
   - Description: Примеры использования платформы
   - Icon: 💡
   - Order: 4
   - Section Type: sub
   - Parent Section: Изучить
   - Published: ✅

### Подсекции для "Внедрить" (Parent Section: Внедрить)
1. **Истории успеха**
   - Name: Истории успеха
   - Slug: success-stories
   - Description: Реальные кейсы успешного внедрения
   - Icon: 🏆
   - Order: 1
   - Section Type: sub
   - Parent Section: Внедрить
   - Published: ✅

2. **Гайды**
   - Name: Гайды
   - Slug: guides
   - Description: Подробные руководства по внедрению
   - Icon: 📝
   - Order: 2
   - Section Type: sub
   - Parent Section: Внедрить
   - Published: ✅

## Шаг 4: Проверить результат
После создания всех секций, откройте frontend и проверьте, что меню отображает секции из API.
