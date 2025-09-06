const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

// Простые секции без иерархии для начала
const sectionsData = [
  {
    name: 'Инструменты',
    slug: 'tools',
    description: 'Готовые инструменты и решения для работы с AI',
    icon: '🛠️',
    order: 1
  },
  {
    name: 'Изучить',
    slug: 'learn',
    description: 'Образовательные материалы и исследования',
    icon: '📚',
    order: 2
  },
  {
    name: 'Внедрить',
    slug: 'implement',
    description: 'Практические руководства по внедрению',
    icon: '🚀',
    order: 3
  }
];

async function createSection(sectionData) {
  try {
    const payload = {
      data: {
        name: sectionData.name,
        slug: sectionData.slug,
        description: sectionData.description,
        icon: sectionData.icon,
        order: sectionData.order,
        publishedAt: new Date().toISOString()
      }
    };

    const response = await axios.post(
      `${STRAPI_URL}/api/sections`,
      payload,
      {
        headers: {
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
  console.log('🚀 Starting simple sections population...');
  
  try {
    for (const sectionData of sectionsData) {
      await createSection(sectionData);
    }

    console.log('✅ All sections populated successfully!');
  } catch (error) {
    console.error('❌ Error during population:', error.message);
  }
}

// Запускаем скрипт
populateSections();
