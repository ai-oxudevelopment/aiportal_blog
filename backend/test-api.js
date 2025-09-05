const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function testAPI() {
  console.log('🧪 Testing Strapi API endpoints...\n');
  
  const endpoints = [
    'articles',
    'authors', 
    'categories',
    'sections',
    'collections',
    'tags',
    'playbooks'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing /api/${endpoint}...`);
      const response = await axios.get(`${STRAPI_URL}/api/${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} - ${response.data.data ? response.data.data.length : 0} items`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(`🔒 ${endpoint}: 403 Forbidden (public access not configured)`);
      } else if (error.response?.status === 404) {
        console.log(`❌ ${endpoint}: 404 Not Found (endpoint not available)`);
      } else {
        console.log(`❌ ${endpoint}: ${error.response?.status || 'Error'} - ${error.message}`);
      }
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('- If you see 403 Forbidden, you need to configure public access in admin panel');
  console.log('- If you see 404 Not Found, the content type is not properly configured');
  console.log('- If you see 200 OK, the endpoint is working correctly');
  console.log('\n🔧 To configure public access:');
  console.log('1. Go to http://localhost:1337/admin');
  console.log('2. Create admin account if needed');
  console.log('3. Go to Settings → Users & Permissions Plugin → Roles → Public');
  console.log('4. Enable "find" and "findOne" permissions for all content types');
}

testAPI().catch(console.error);
