// Быстрый скрипт для заполнения Strapi тестовыми статьями
// Запуск: node quick-populate.js

const { populateArticles } = require('./populate-ai-articles');

console.log('🚀 Быстрое заполнение Strapi тестовыми статьями по AI...\n');

populateArticles()
  .then(() => {
    console.log('\n✅ Заполнение завершено!');
    console.log('📖 Проверьте статьи в Strapi Admin Panel: http://localhost:1337/admin');
  })
  .catch((error) => {
    console.error('❌ Ошибка при заполнении:', error.message);
    console.log('\n💡 Убедитесь, что:');
    console.log('   1. Strapi запущен на http://localhost:1337');
    console.log('   2. Настроен публичный доступ для статей');
    console.log('   3. Установлен axios: npm install axios');
  });
