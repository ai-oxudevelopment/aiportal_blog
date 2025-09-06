const axios = require('axios');

const STRAPI_URL = 'отсутствует подключение';
const API_TOKEN = 'отсутствует подключение';

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test 1: Get all categories
    console.log('1. Testing all categories...');
    const allCategoriesResponse = await axios.get(`${STRAPI_URL}/api/categories`, { headers });
    console.log(`✅ Found ${allCategoriesResponse.data.data.length} categories`);
    
    // Test 2: Get categories with sections populated
    console.log('\n2. Testing categories with sections...');
    const categoriesWithSectionsResponse = await axios.get(`${STRAPI_URL}/api/categories?populate[sections]=true`, { headers });
    console.log(`✅ Found ${categoriesWithSectionsResponse.data.data.length} categories with sections`);
    
    // Test 3: Filter by section slug
    console.log('\n3. Testing filter by section slug...');
    const filterBySlugResponse = await axios.get(`${STRAPI_URL}/api/categories?filters[sections][slug][$eq]=prompts&populate[sections]=true`, { headers });
    console.log(`✅ Found ${filterBySlugResponse.data.data.length} categories for prompts section`);
    
    if (filterBySlugResponse.data.data.length > 0) {
      console.log('Categories found:');
      filterBySlugResponse.data.data.forEach(cat => {
        console.log(`  - ${cat.attributes.name} (slug: ${cat.attributes.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
