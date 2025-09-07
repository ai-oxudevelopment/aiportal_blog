// backend/scripts/admin/populate-prompt-articles.js
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'strapi',
  user: 'strapi',
  password: 'strapi123',
});

// Sample prompts data organized by category (reused from populate-prompts.js)
const promptsData = {
  'hr-prompts': [
    {
      name: 'Анализ резюме кандидата',
      description: 'Проанализируй резюме кандидата на позицию [должность] и выдели ключевые навыки, опыт и соответствие требованиям.',
      promptId: 'HR_001',
      tags: ['hr', 'recruitment', 'analysis']
    },
    {
      name: 'Составление описания вакансии',
      description: 'Создай привлекательное описание вакансии для позиции [должность] в компании [тип компании] с указанием требований и условий.',
      promptId: 'HR_002',
      tags: ['hr', 'job-description', 'recruitment']
    },
    {
      name: 'Подготовка вопросов для интервью',
      description: 'Составь список вопросов для интервью с кандидатом на позицию [должность] с учетом специфики [отрасль].',
      promptId: 'HR_003',
      tags: ['hr', 'interview', 'questions']
    },
    {
      name: 'Оценка кандидата после интервью',
      description: 'Проанализируй ответы кандидата на интервью и дай рекомендации по найму с обоснованием.',
      promptId: 'HR_004',
      tags: ['hr', 'evaluation', 'decision']
    },
    {
      name: 'План адаптации нового сотрудника',
      description: 'Создай план адаптации нового сотрудника на позиции [должность] в [отдел] на первые 90 дней.',
      promptId: 'HR_005',
      tags: ['hr', 'onboarding', 'planning']
    },
    {
      name: 'Критерии оценки эффективности',
      description: 'Разработай критерии оценки эффективности сотрудника в [роль] с KPI и метриками.',
      promptId: 'HR_006',
      tags: ['hr', 'performance', 'kpi']
    },
    {
      name: 'План развития сотрудника',
      description: 'Создай индивидуальный план развития для сотрудника [должность] с учетом его целей и потребностей компании.',
      promptId: 'HR_007',
      tags: ['hr', 'development', 'career']
    },
    {
      name: 'Обработка конфликтных ситуаций',
      description: 'Предложи стратегию разрешения конфликта между сотрудниками [описание ситуации] с пошаговым планом действий.',
      promptId: 'HR_008',
      tags: ['hr', 'conflict', 'resolution']
    }
  ],
  'sales-prompts': [
    {
      name: 'Анализ потребностей клиента',
      description: 'Проанализируй профиль клиента [тип клиента] и предложи персонализированное коммерческое предложение для [продукт/услуга].',
      promptId: 'SALES_001',
      tags: ['sales', 'analysis', 'proposal']
    },
    {
      name: 'Обработка возражений клиента',
      description: 'Подготовь ответы на типичные возражения клиентов при продаже [продукт/услуга] в [отрасль].',
      promptId: 'SALES_002',
      tags: ['sales', 'objections', 'responses']
    },
    {
      name: 'Скрипт холодного звонка',
      description: 'Создай скрипт для холодного звонка потенциальному клиенту [тип клиента] с предложением [продукт/услуга].',
      promptId: 'SALES_003',
      tags: ['sales', 'cold-calling', 'script']
    },
    {
      name: 'Презентация продукта',
      description: 'Составь структуру презентации [продукт/услуга] для клиента [тип клиента] с акцентом на [ключевые преимущества].',
      promptId: 'SALES_004',
      tags: ['sales', 'presentation', 'product']
    },
    {
      name: 'Анализ воронки продаж',
      description: 'Проанализируй данные воронки продаж и предложи способы оптимизации на этапе [этап].',
      promptId: 'SALES_005',
      tags: ['sales', 'funnel', 'optimization']
    },
    {
      name: 'Прогнозирование продаж',
      description: 'На основе исторических данных спрогнозируй объем продаж на [период] с учетом [факторы].',
      promptId: 'SALES_006',
      tags: ['sales', 'forecasting', 'analytics']
    },
    {
      name: 'Сегментация клиентской базы',
      description: 'Раздели клиентскую базу на сегменты по критериям [критерии] и предложи стратегии для каждого сегмента.',
      promptId: 'SALES_007',
      tags: ['sales', 'segmentation', 'strategy']
    },
    {
      name: 'Планирование активности менеджера',
      description: 'Создай план активности для менеджера по продажам на [период] с учетом [цели и ограничения].',
      promptId: 'SALES_008',
      tags: ['sales', 'planning', 'activity']
    },
    {
      name: 'Работа с потерянными клиентами',
      description: 'Разработай стратегию возврата потерянного клиента [тип клиента] с предложением [продукт/услуга].',
      promptId: 'SALES_009',
      tags: ['sales', 'retention', 'win-back']
    },
    {
      name: 'Ценообразование и скидки',
      description: 'Предложи стратегию ценообразования для [продукт/услуга] с учетом [факторы] и политики скидок.',
      promptId: 'SALES_010',
      tags: ['sales', 'pricing', 'discounts']
    }
  ],
  'marketing-prompts': [
    {
      name: 'Создание статьи для блога',
      description: 'Создай статью на тему [тема] для блога компании [тип компании] с фокусом на [целевая аудитория].',
      promptId: 'MKT_001',
      tags: ['marketing', 'content', 'blog']
    },
    {
      name: 'SEO-оптимизация контента',
      description: 'Оптимизируй текст для SEO с ключевыми словами [ключевые слова] и мета-описанием.',
      promptId: 'MKT_002',
      tags: ['marketing', 'seo', 'optimization']
    },
    {
      name: 'Посты для социальных сетей',
      description: 'Создай серию постов для [платформа] на тему [тема] с призывом к действию [CTA].',
      promptId: 'MKT_003',
      tags: ['marketing', 'social-media', 'posts']
    },
    {
      name: 'Контент-план',
      description: 'Составь контент-план на [период] для [платформа] с учетом [цели и аудитория].',
      promptId: 'MKT_004',
      tags: ['marketing', 'content-plan', 'strategy']
    },
    {
      name: 'Рекламное объявление',
      description: 'Создай рекламное объявление для [продукт/услуга] на [платформа] с акцентом на [преимущества].',
      promptId: 'MKT_005',
      tags: ['marketing', 'advertising', 'ads']
    },
    {
      name: 'A/B тестирование',
      description: 'Предложи варианты для A/B тестирования рекламного объявления с фокусом на [метрика].',
      promptId: 'MKT_006',
      tags: ['marketing', 'ab-testing', 'optimization']
    },
    {
      name: 'Анализ маркетинговой кампании',
      description: 'Проанализируй результаты маркетинговой кампании [тип кампании] и предложи улучшения.',
      promptId: 'MKT_007',
      tags: ['marketing', 'analytics', 'campaign']
    },
    {
      name: 'Email-рассылка',
      description: 'Создай email-рассылку для [цель] с темой [тема] и персонализацией для [сегмент].',
      promptId: 'MKT_008',
      tags: ['marketing', 'email', 'newsletter']
    },
    {
      name: 'Email-последовательность',
      description: 'Разработай email-последовательность для [воронка продаж] с [количество] писем.',
      promptId: 'MKT_009',
      tags: ['marketing', 'email-sequence', 'automation']
    },
    {
      name: 'Маркетинговый отчет',
      description: 'Создай отчет по маркетинговой активности за [период] с ключевыми метриками и выводами.',
      promptId: 'MKT_010',
      tags: ['marketing', 'reporting', 'analytics']
    }
  ],
  'management-prompts': [
    {
      name: 'Планирование проекта',
      description: 'Создай план проекта [название проекта] с этапами, сроками и ответственными лицами.',
      promptId: 'MGT_001',
      tags: ['management', 'project', 'planning']
    },
    {
      name: 'Управление командой',
      description: 'Предложи стратегию управления командой [размер команды] для достижения [цели].',
      promptId: 'MGT_002',
      tags: ['management', 'team', 'leadership']
    },
    {
      name: 'Мотивация сотрудников',
      description: 'Разработай план мотивации сотрудников [отдел] с учетом их потребностей и целей компании.',
      promptId: 'MGT_003',
      tags: ['management', 'motivation', 'employees']
    },
    {
      name: 'Управление изменениями',
      description: 'Создай план внедрения изменений [тип изменений] в организации с учетом сопротивления.',
      promptId: 'MGT_004',
      tags: ['management', 'change', 'implementation']
    },
    {
      name: 'Принятие решений',
      description: 'Проанализируй ситуацию [описание] и предложи варианты решения с оценкой рисков.',
      promptId: 'MGT_005',
      tags: ['management', 'decision-making', 'analysis']
    },
    {
      name: 'Управление временем',
      description: 'Создай систему управления временем для менеджера с приоритизацией задач.',
      promptId: 'MGT_006',
      tags: ['management', 'time-management', 'productivity']
    },
    {
      name: 'Обратная связь сотрудникам',
      description: 'Подготовь структуру обратной связи для сотрудника [должность] с конкретными примерами.',
      promptId: 'MGT_007',
      tags: ['management', 'feedback', 'communication']
    },
    {
      name: 'Стратегическое планирование',
      description: 'Разработай стратегический план развития [направление] на [период] с целями и KPI.',
      promptId: 'MGT_008',
      tags: ['management', 'strategy', 'planning']
    }
  ],
  'analytics-prompts': [
    {
      name: 'Анализ данных',
      description: 'Проанализируй данные [тип данных] и выяви ключевые тренды и закономерности.',
      promptId: 'ANAL_001',
      tags: ['analytics', 'data-analysis', 'trends']
    },
    {
      name: 'Создание дашборда',
      description: 'Создай структуру дашборда для мониторинга [метрики] с визуализацией данных.',
      promptId: 'ANAL_002',
      tags: ['analytics', 'dashboard', 'visualization']
    },
    {
      name: 'Прогнозирование',
      description: 'Построй прогноз [показатель] на основе исторических данных с учетом [факторы].',
      promptId: 'ANAL_003',
      tags: ['analytics', 'forecasting', 'prediction']
    },
    {
      name: 'A/B тест анализ',
      description: 'Проанализируй результаты A/B теста [описание теста] и дай рекомендации.',
      promptId: 'ANAL_004',
      tags: ['analytics', 'ab-testing', 'statistics']
    },
    {
      name: 'Сегментация пользователей',
      description: 'Проведи сегментацию пользователей по [критерии] и опиши характеристики каждого сегмента.',
      promptId: 'ANAL_005',
      tags: ['analytics', 'segmentation', 'users']
    },
    {
      name: 'Анализ воронки',
      description: 'Проанализируй воронку [процесс] и определи точки оттока и возможности оптимизации.',
      promptId: 'ANAL_006',
      tags: ['analytics', 'funnel', 'conversion']
    },
    {
      name: 'Корреляционный анализ',
      description: 'Найди корреляции между [переменные] и объясни их значение для бизнеса.',
      promptId: 'ANAL_007',
      tags: ['analytics', 'correlation', 'statistics']
    },
    {
      name: 'Отчет по метрикам',
      description: 'Создай отчет по ключевым метрикам [область] за [период] с выводами и рекомендациями.',
      promptId: 'ANAL_008',
      tags: ['analytics', 'reporting', 'metrics']
    }
  ],
  'finance-prompts': [
    {
      name: 'Финансовый анализ',
      description: 'Проведи финансовый анализ компании [тип компании] по показателям [показатели].',
      promptId: 'FIN_001',
      tags: ['finance', 'analysis', 'company']
    },
    {
      name: 'Бюджетирование',
      description: 'Создай бюджет на [период] для [отдел/проект] с учетом [ограничения].',
      promptId: 'FIN_002',
      tags: ['finance', 'budgeting', 'planning']
    },
    {
      name: 'Анализ рентабельности',
      description: 'Рассчитай рентабельность [продукт/услуга] и предложи способы ее повышения.',
      promptId: 'FIN_003',
      tags: ['finance', 'profitability', 'optimization']
    },
    {
      name: 'Управление денежными потоками',
      description: 'Создай план управления денежными потоками на [период] с учетом [факторы].',
      promptId: 'FIN_004',
      tags: ['finance', 'cash-flow', 'management']
    },
    {
      name: 'Инвестиционный анализ',
      description: 'Проведи анализ инвестиционного проекта [описание] с расчетом ROI и рисков.',
      promptId: 'FIN_005',
      tags: ['finance', 'investment', 'roi']
    },
    {
      name: 'Финансовое планирование',
      description: 'Разработай финансовый план развития [направление] на [период] с источниками финансирования.',
      promptId: 'FIN_006',
      tags: ['finance', 'planning', 'development']
    },
    {
      name: 'Анализ затрат',
      description: 'Проведи анализ структуры затрат [процесс/продукт] и предложи оптимизацию.',
      promptId: 'FIN_007',
      tags: ['finance', 'cost-analysis', 'optimization']
    },
    {
      name: 'Финансовая отчетность',
      description: 'Подготовь структуру финансовой отчетности для [тип организации] с ключевыми показателями.',
      promptId: 'FIN_008',
      tags: ['finance', 'reporting', 'statements']
    }
  ],
  'documents-prompts': [
    {
      name: 'Создание договора',
      description: 'Создай шаблон договора [тип договора] с учетом [специфические условия].',
      promptId: 'DOC_001',
      tags: ['documents', 'contracts', 'templates']
    },
    {
      name: 'Анализ документа',
      description: 'Проанализируй документ [тип документа] и выдели ключевые моменты и риски.',
      promptId: 'DOC_002',
      tags: ['documents', 'analysis', 'review']
    },
    {
      name: 'Создание инструкции',
      description: 'Создай пошаговую инструкцию для [процесс] с учетом [аудитория].',
      promptId: 'DOC_003',
      tags: ['documents', 'instructions', 'procedures']
    },
    {
      name: 'Обработка жалоб',
      description: 'Подготовь ответ на жалобу клиента [тип жалобы] с планом решения проблемы.',
      promptId: 'DOC_004',
      tags: ['documents', 'complaints', 'customer-service']
    },
    {
      name: 'Создание презентации',
      description: 'Создай структуру презентации на тему [тема] для [аудитория] с ключевыми слайдами.',
      promptId: 'DOC_005',
      tags: ['documents', 'presentation', 'structure']
    },
    {
      name: 'Ведение протокола',
      description: 'Создай шаблон протокола совещания с разделами для [тип совещания].',
      promptId: 'DOC_006',
      tags: ['documents', 'minutes', 'meetings']
    },
    {
      name: 'Создание отчета',
      description: 'Создай структуру отчета по [направление] за [период] с разделами и метриками.',
      promptId: 'DOC_007',
      tags: ['documents', 'reports', 'structure']
    },
    {
      name: 'Обработка заявок',
      description: 'Создай процесс обработки заявок [тип заявок] с этапами и ответственными.',
      promptId: 'DOC_008',
      tags: ['documents', 'applications', 'process']
    }
  ],
  'development-prompts': [
    {
      name: 'Техническое задание',
      description: 'Создай техническое задание для разработки [функциональность] с требованиями и ограничениями.',
      promptId: 'DEV_001',
      tags: ['development', 'specification', 'requirements']
    },
    {
      name: 'Архитектура системы',
      description: 'Спроектируй архитектуру системы [описание системы] с компонентами и взаимодействиями.',
      promptId: 'DEV_002',
      tags: ['development', 'architecture', 'design']
    },
    {
      name: 'Код-ревью',
      description: 'Проведи код-ревью для [функциональность] и предложи улучшения с примерами.',
      promptId: 'DEV_003',
      tags: ['development', 'code-review', 'quality']
    },
    {
      name: 'Тестирование',
      description: 'Создай план тестирования для [модуль/функция] с тест-кейсами и сценариями.',
      promptId: 'DEV_004',
      tags: ['development', 'testing', 'qa']
    },
    {
      name: 'Документация API',
      description: 'Создай документацию для API [название API] с примерами запросов и ответов.',
      promptId: 'DEV_005',
      tags: ['development', 'api', 'documentation']
    },
    {
      name: 'Оптимизация производительности',
      description: 'Предложи способы оптимизации производительности [компонент] с метриками.',
      promptId: 'DEV_006',
      tags: ['development', 'performance', 'optimization']
    },
    {
      name: 'Безопасность',
      description: 'Проведи аудит безопасности [система] и предложи меры защиты от [тип угроз].',
      promptId: 'DEV_007',
      tags: ['development', 'security', 'audit']
    },
    {
      name: 'DevOps процессы',
      description: 'Создай CI/CD пайплайн для [проект] с этапами развертывания и мониторинга.',
      promptId: 'DEV_008',
      tags: ['development', 'devops', 'cicd']
    }
  ],
  'support-prompts': [
    {
      name: 'Обработка тикетов',
      description: 'Создай процесс обработки тикетов поддержки с приоритизацией и эскалацией.',
      promptId: 'SUP_001',
      tags: ['support', 'tickets', 'process']
    },
    {
      name: 'Решение проблем',
      description: 'Предложи пошаговое решение проблемы [описание проблемы] для пользователя.',
      promptId: 'SUP_002',
      tags: ['support', 'troubleshooting', 'solutions']
    },
    {
      name: 'FAQ создание',
      description: 'Создай FAQ для [продукт/услуга] с наиболее частыми вопросами и ответами.',
      promptId: 'SUP_003',
      tags: ['support', 'faq', 'knowledge-base']
    },
    {
      name: 'Обучение пользователей',
      description: 'Создай план обучения пользователей [продукт] с материалами и этапами.',
      promptId: 'SUP_004',
      tags: ['support', 'training', 'education']
    },
    {
      name: 'Мониторинг системы',
      description: 'Настрой мониторинг системы [название] с алертами и метриками.',
      promptId: 'SUP_005',
      tags: ['support', 'monitoring', 'alerts']
    },
    {
      name: 'Эскалация проблем',
      description: 'Создай процедуру эскалации критических проблем с временными рамками.',
      promptId: 'SUP_006',
      tags: ['support', 'escalation', 'procedures']
    },
    {
      name: 'Анализ обращений',
      description: 'Проанализируй обращения в поддержку за [период] и выяви основные проблемы.',
      promptId: 'SUP_007',
      tags: ['support', 'analysis', 'trends']
    },
    {
      name: 'Улучшение сервиса',
      description: 'Предложи улучшения сервиса поддержки на основе [метрики и отзывы].',
      promptId: 'SUP_008',
      tags: ['support', 'improvement', 'service']
    }
  ],
  'communication-prompts': [
    {
      name: 'Деловая переписка',
      description: 'Создай профессиональное письмо для [ситуация] с учетом [контекст и аудитория].',
      promptId: 'COMM_001',
      tags: ['communication', 'email', 'business']
    },
    {
      name: 'Презентация для клиента',
      description: 'Подготовь презентацию [тема] для клиента [тип клиента] с акцентом на [преимущества].',
      promptId: 'COMM_002',
      tags: ['communication', 'presentation', 'client']
    },
    {
      name: 'Внутренние коммуникации',
      description: 'Создай план внутренних коммуникаций для [событие/изменение] с каналами и сообщениями.',
      promptId: 'COMM_003',
      tags: ['communication', 'internal', 'planning']
    },
    {
      name: 'Обратная связь',
      description: 'Подготовь конструктивную обратную связь для [ситуация] с конкретными примерами.',
      promptId: 'COMM_004',
      tags: ['communication', 'feedback', 'constructive']
    },
    {
      name: 'Публичные выступления',
      description: 'Создай структуру выступления на тему [тема] для [аудитория] с ключевыми сообщениями.',
      promptId: 'COMM_005',
      tags: ['communication', 'public-speaking', 'presentation']
    },
    {
      name: 'Межкультурная коммуникация',
      description: 'Адаптируй сообщение [содержание] для аудитории [культура] с учетом особенностей.',
      promptId: 'COMM_006',
      tags: ['communication', 'cross-cultural', 'adaptation']
    },
    {
      name: 'Кризисные коммуникации',
      description: 'Разработай план коммуникаций в кризисной ситуации [описание] с ключевыми сообщениями.',
      promptId: 'COMM_007',
      tags: ['communication', 'crisis', 'management']
    },
    {
      name: 'Переговоры',
      description: 'Подготовь стратегию переговоров по [тема] с учетом интересов всех сторон.',
      promptId: 'COMM_008',
      tags: ['communication', 'negotiations', 'strategy']
    }
  ],
  'base-prompts': [
    {
      name: 'Анализ проблемы',
      description: 'Проанализируй проблему [описание] и предложи варианты решения с оценкой рисков.',
      promptId: 'BASE_001',
      tags: ['analysis', 'problem-solving', 'decision-making']
    },
    {
      name: 'Планирование задач',
      description: 'Создай план выполнения задач [список задач] с приоритизацией и временными рамками.',
      promptId: 'BASE_002',
      tags: ['planning', 'tasks', 'prioritization']
    },
    {
      name: 'Исследование темы',
      description: 'Проведи исследование темы [тема] и представь основные выводы и рекомендации.',
      promptId: 'BASE_003',
      tags: ['research', 'analysis', 'insights']
    },
    {
      name: 'Создание чек-листа',
      description: 'Создай детальный чек-лист для [процесс] с этапами и контрольными точками.',
      promptId: 'BASE_004',
      tags: ['checklist', 'process', 'quality']
    },
    {
      name: 'Сравнительный анализ',
      description: 'Проведи сравнительный анализ [объекты сравнения] по критериям [критерии].',
      promptId: 'BASE_005',
      tags: ['comparison', 'analysis', 'evaluation']
    },
    {
      name: 'Создание шаблона',
      description: 'Создай универсальный шаблон для [тип документа] с переменными и инструкциями.',
      promptId: 'BASE_006',
      tags: ['template', 'standardization', 'efficiency']
    },
    {
      name: 'Оптимизация процесса',
      description: 'Проанализируй процесс [описание] и предложи способы его оптимизации.',
      promptId: 'BASE_007',
      tags: ['optimization', 'process', 'efficiency']
    },
    {
      name: 'Создание инструкции',
      description: 'Создай пошаговую инструкцию для [действие] с учетом [аудитория и контекст].',
      promptId: 'BASE_008',
      tags: ['instructions', 'guidance', 'procedures']
    }
  ]
};

// Function to generate rich content for prompt articles
function generatePromptArticleContent(prompt) {
  const content = `
<h2>Описание промпта</h2>
<p>${prompt.description}</p>

<h3>Как использовать</h3>
<p>Скопируйте промпт и замените переменные в квадратных скобках на конкретные значения для вашей задачи.</p>

<h3>Пример использования</h3>
<p>Вместо [должность] укажите конкретную позицию, например "Frontend разработчик". Вместо [тип компании] укажите "IT-стартап".</p>

<h3>Советы по применению</h3>
<ul>
  <li>Адаптируйте промпт под специфику вашей отрасли</li>
  <li>Добавляйте дополнительные контекстные детали</li>
  <li>Используйте конкретные примеры для лучших результатов</li>
  <li>Экспериментируйте с формулировками для оптимизации</li>
</ul>

<h3>Связанные промпты</h3>
<p>Рекомендуем также изучить другие промпты в этой категории для комплексного подхода к решению задач.</p>
`;

  return content.trim();
}

// Function to generate meta description
function generateMetaDescription(prompt) {
  return `Готовый промпт для ${prompt.name.toLowerCase()}. ${prompt.description.substring(0, 120)}... Используйте для автоматизации рабочих процессов.`;
}

// Function to calculate reading time
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

async function populatePromptArticles() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Get existing categories
    console.log('\n📁 Fetching existing categories...');
    const categoriesResult = await client.query(`
      SELECT id, slug FROM categories WHERE published_at IS NOT NULL
    `);
    
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    
    console.log(`✅ Found ${categoriesResult.rows.length} categories`);

    // Get existing tags
    console.log('\n🏷️ Fetching existing tags...');
    const tagsResult = await client.query(`
      SELECT id, slug FROM tags WHERE published_at IS NOT NULL
    `);
    
    const tagMap = {};
    tagsResult.rows.forEach(tag => {
      tagMap[tag.slug] = tag.id;
    });
    
    console.log(`✅ Found ${tagsResult.rows.length} tags`);

    // Get existing sections
    console.log('\n📂 Fetching existing sections...');
    const sectionsResult = await client.query(`
      SELECT id, slug FROM sections WHERE published_at IS NOT NULL
    `);
    
    const sectionMap = {};
    sectionsResult.rows.forEach(section => {
      sectionMap[section.slug] = section.id;
    });
    
    console.log(`✅ Found ${sectionsResult.rows.length} sections`);

    // Skip author linking as it's not used in the system
    console.log('\n👤 Skipping author linking (not used in system)');

    // Clear existing prompt articles
    console.log('\n🧹 Clearing existing prompt articles...');
    await client.query('DELETE FROM articles_categories_links WHERE article_id IN (SELECT id FROM articles WHERE type = \'prompt\')');
    await client.query('DELETE FROM articles_tags_links WHERE article_id IN (SELECT id FROM articles WHERE type = \'prompt\')');
    await client.query('DELETE FROM articles WHERE type = \'prompt\'');
    console.log('✅ Existing prompt articles cleared');

    // Create prompt articles
    console.log('\n📝 Creating prompt articles...');
    let totalArticles = 0;
    const createdArticles = [];

    for (const [categorySlug, prompts] of Object.entries(promptsData)) {
      const categoryId = categoryMap[categorySlug];
      
      if (!categoryId) {
        console.log(`⚠️ Category ${categorySlug} not found, skipping...`);
        continue;
      }

      console.log(`\n📂 Processing category: ${categorySlug} (${prompts.length} prompts)`);

      for (const prompt of prompts) {
        const content = generatePromptArticleContent(prompt);
        const metaDescription = generateMetaDescription(prompt);
        const readingTime = calculateReadingTime(content);
        const slug = prompt.promptId.toLowerCase().replace(/_/g, '-');

        // Create prompt as article with type='prompt'
        const result = await client.query(`
          INSERT INTO articles (
            title, slug, content, meta_description, type, prompt_id, 
            featured, usage_count, reading_time, status, publish_date, 
            published_at, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, 'prompt', $5, $6, $7, $8, 'published', NOW(), NOW(), NOW(), NOW())
          RETURNING id
        `, [
          prompt.name,
          slug,
          content,
          metaDescription,
          prompt.promptId,
          Math.random() < 0.1, // 10% chance to be featured
          Math.floor(Math.random() * 100), // Random usage count 0-99
          readingTime
        ]);

        const articleId = result.rows[0].id;
        createdArticles.push({ id: articleId, ...prompt });
        totalArticles++;

        // Link to category
        await client.query(`
          INSERT INTO articles_categories_links (article_id, category_id, article_order, category_order)
          VALUES ($1, $2, 1, 1)
        `, [articleId, categoryId]);

        // Link to tags
        for (const tagSlug of prompt.tags) {
          const tagId = tagMap[tagSlug];
          if (tagId) {
            await client.query(`
              INSERT INTO articles_tags_links (article_id, tag_id, article_order, tag_order)
              VALUES ($1, $2, 1, 1)
            `, [articleId, tagId]);
          }
        }

        // Skip section linking as it's not used in the current schema

        console.log(`  ✅ Created: ${prompt.name} (${prompt.promptId})`);
      }
    }

    // Create additional random prompt articles to reach 100 total
    const additionalArticles = 100 - totalArticles;
    if (additionalArticles > 0) {
      console.log(`\n🎲 Creating ${additionalArticles} additional random prompt articles...`);
      
      const allCategoryIds = Object.values(categoryMap);
      const allTagIds = Object.values(tagMap);
      
      for (let i = 0; i < additionalArticles; i++) {
        const randomCategoryId = allCategoryIds[Math.floor(Math.random() * allCategoryIds.length)];
        const randomTagIds = allTagIds
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 random tags

        const articleName = `Универсальный промпт ${i + 1}`;
        const articleDescription = `Описание для универсального промпта ${i + 1}. Этот промпт может быть использован для различных задач в рамках категории.`;
        const promptId = `UNI_${String(i + 1).padStart(3, '0')}`;
        const slug = promptId.toLowerCase().replace(/_/g, '-');

        const content = generatePromptArticleContent({
          name: articleName,
          description: articleDescription,
          promptId: promptId
        });
        const metaDescription = generateMetaDescription({
          name: articleName,
          description: articleDescription
        });
        const readingTime = calculateReadingTime(content);

        const result = await client.query(`
          INSERT INTO articles (
            title, slug, content, meta_description, type, prompt_id, 
            featured, usage_count, reading_time, status, publish_date, 
            published_at, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, 'prompt', $5, $6, $7, $8, 'published', NOW(), NOW(), NOW(), NOW())
          RETURNING id
        `, [
          articleName,
          slug,
          content,
          metaDescription,
          promptId,
          Math.random() < 0.1,
          Math.floor(Math.random() * 100),
          readingTime
        ]);

        const articleId = result.rows[0].id;

        // Link to random category
        await client.query(`
          INSERT INTO articles_categories_links (article_id, category_id, article_order, category_order)
          VALUES ($1, $2, 1, 1)
        `, [articleId, randomCategoryId]);

        // Link to random tags
        for (const tagId of randomTagIds) {
          await client.query(`
            INSERT INTO articles_tags_links (article_id, tag_id, article_order, tag_order)
            VALUES ($1, $2, 1, 1)
          `, [articleId, tagId]);
        }

        console.log(`  ✅ Created: ${articleName} (${promptId})`);
        totalArticles++;
      }
    }

    console.log('\n🎉 Prompt articles populated successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - ${totalArticles} prompt articles created`);
    console.log(`  - ${Object.keys(promptsData).length} categories used`);
    console.log(`  - ${tagsResult.rows.length} tags available`);
    console.log(`  - ${sectionsResult.rows.length} sections linked`);
    console.log('  - All relationships linked');
    console.log('  - Rich content with usage instructions');
    console.log('  - SEO-optimized meta descriptions');
    console.log('  - Reading time calculated');

    // Show distribution by category
    console.log('\n📈 Distribution by category:');
    for (const [categorySlug, prompts] of Object.entries(promptsData)) {
      const categoryName = categorySlug.replace('-prompts', '').replace('-', ' ').toUpperCase();
      console.log(`  - ${categoryName}: ${prompts.length} articles`);
    }
    if (additionalArticles > 0) {
      console.log(`  - Additional random: ${additionalArticles} articles`);
    }

  } catch (error) {
    console.error('❌ Error populating prompt articles:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  populatePromptArticles();
}

module.exports = { populatePromptArticles };
