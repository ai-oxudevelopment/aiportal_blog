const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'отсутствует подключение';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// Структура секций согласно требованиям
const sectionsData = [
  // Главные секции
  {
    name: 'Инструменты',
    slug: 'tools',
    description: 'Готовые инструменты и решения для работы с AI',
    icon: '🛠️',
    order: 1,
    sectionType: 'main',
    subsections: [
      {
        name: 'Готовые инструкции',
        slug: 'ready-instructions',
        description: 'Пошаговые инструкции для различных задач',
        icon: '📋',
        order: 1
      },
      {
        name: 'AI-агенты',
        slug: 'ai-agents',
        description: 'Готовые AI-агенты для автоматизации',
        icon: '🤖',
        order: 2
      },
      {
        name: 'MCP',
        slug: 'mcp',
        description: 'Model Context Protocol инструменты',
        icon: '🔗',
        order: 3
      }
    ]
  },
  {
    name: 'Изучить',
    slug: 'learn',
    description: 'Образовательные материалы и исследования',
    icon: '📚',
    order: 2,
    sectionType: 'main',
    subsections: [
      {
        name: 'Исследования',
        slug: 'research',
        description: 'Научные исследования и аналитика',
        icon: '🔬',
        order: 1
      },
      {
        name: 'Видеокурсы',
        slug: 'video-courses',
        description: 'Обучающие видео и курсы',
        icon: '🎥',
        order: 2
      },
      {
        name: 'Учебные статьи',
        slug: 'tutorials',
        description: 'Подробные обучающие материалы',
        icon: '📖',
        order: 3
      },
      {
        name: 'UseCases платформы',
        slug: 'platform-usecases',
        description: 'Примеры использования платформы',
        icon: '💡',
        order: 4
      }
    ]
  },
  {
    name: 'Внедрить',
    slug: 'implement',
    description: 'Практические руководства по внедрению',
    icon: '🚀',
    order: 3,
    sectionType: 'main',
    subsections: [
      {
        name: 'Истории успеха',
        slug: 'success-stories',
        description: 'Реальные кейсы успешного внедрения',
        icon: '🏆',
        order: 1
      },
      {
        name: 'Гайды',
        slug: 'guides',
        description: 'Подробные руководства по внедрению',
        icon: '📝',
        order: 2
      }
    ]
  }
];

async function createSection(sectionData, parentId = null) {
  try {
    const payload = {
      data: {
        name: sectionData.name,
        slug: sectionData.slug,
        description: sectionData.description,
        icon: sectionData.icon,
        order: sectionData.order,
        sectionType: sectionData.sectionType || 'sub',
        publishedAt: new Date().toISOString()
      }
    };

    if (parentId) {
      payload.data.parentSection = parentId;
    }

    const response = await axios.post(
      `${STRAPI_URL}/api/sections`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Created section: ${sectionData.name}`);
    return response.data.data.id;
  } catch (error) {
    console.error(`❌ Error creating section ${sectionData.name}:`, error.response?.data || error.message);
    return null;
  }
}

async function populateSections() {
  console.log('🚀 Starting sections population...');
  
  if (!API_TOKEN) {
    console.error('❌ STRAPI_API_TOKEN is required. Please set it in your environment variables.');
    process.exit(1);
  }

  try {
    // Сначала создаем главные секции
    const mainSections = [];
    for (const sectionData of sectionsData) {
      const sectionId = await createSection(sectionData);
      if (sectionId) {
        mainSections.push({ id: sectionId, subsections: sectionData.subsections });
      }
    }

    // Затем создаем подсекции
    for (const mainSection of mainSections) {
      if (mainSection.subsections) {
        for (const subsectionData of mainSection.subsections) {
          await createSection(subsectionData, mainSection.id);
        }
      }
    }

    console.log('✅ All sections populated successfully!');
  } catch (error) {
    console.error('❌ Error during population:', error.message);
  }
}

// Запускаем скрипт
populateSections();
