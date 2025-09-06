const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

// Данные для входа в админку (используйте ваши данные)
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'admin123';

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

async function getAuthToken() {
  try {
    const response = await axios.post(`${STRAPI_URL}/admin/auth/local`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Error getting auth token:', error.response?.data || error.message);
    return null;
  }
}

async function createSection(sectionData, parentId = null, token) {
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
          'Authorization': `Bearer ${token}`,
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
  console.log('🚀 Starting sections population with authentication...');
  
  try {
    // Получаем токен авторизации
    const token = await getAuthToken();
    if (!token) {
      console.error('❌ Failed to get authentication token');
      process.exit(1);
    }
    
    console.log('✅ Authentication successful');

    // Сначала создаем главные секции
    const mainSections = [];
    for (const sectionData of sectionsData) {
      const sectionId = await createSection(sectionData, null, token);
      if (sectionId) {
        mainSections.push({ id: sectionId, subsections: sectionData.subsections });
      }
    }

    // Затем создаем подсекции
    for (const mainSection of mainSections) {
      if (mainSection.subsections) {
        for (const subsectionData of mainSection.subsections) {
          await createSection(subsectionData, mainSection.id, token);
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
