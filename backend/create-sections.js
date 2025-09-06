const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

const sections = [
  {
    name: 'Инструменты',
    slug: 'tools'
  },
  {
    name: 'Изучить', 
    slug: 'learn'
  },
  {
    name: 'Внедрить',
    slug: 'implement'
  }
];

async function createSections() {
  console.log('🚀 Создание секций в Strapi...');
  
  for (const section of sections) {
    try {
      console.log(`📝 Создаю секцию: ${section.name}`);
      
      const response = await axios.post(`${STRAPI_URL}/api/sections`, {
        data: {
          name: section.name,
          slug: section.slug,
          publishedAt: new Date().toISOString()
        }
      });
      
      console.log(`✅ Секция "${section.name}" создана успешно`);
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log(`⚠️  Секция "${section.name}" уже существует`);
      } else {
        console.error(`❌ Ошибка при создании секции "${section.name}":`, error.response?.data || error.message);
      }
    }
  }
  
  console.log('🎉 Готово! Проверьте Strapi Admin: http://localhost:1337/admin');
}

createSections().catch(console.error);
