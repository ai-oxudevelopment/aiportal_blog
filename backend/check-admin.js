const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function checkAdminPanel() {
  try {
    console.log('🔍 Checking Strapi admin panel status...\n');
    
    // Check admin panel accessibility
    const adminResponse = await axios.get(`${STRAPI_URL}/admin`);
    console.log('✅ Admin panel is accessible');
    
    // Check if we can access the init endpoint
    try {
      const initResponse = await axios.get(`${STRAPI_URL}/admin/init`);
      console.log('✅ Admin initialization endpoint accessible');
      
      if (initResponse.data && initResponse.data.data) {
        console.log('📋 Admin panel info:');
        console.log(`   - Strapi Version: ${initResponse.data.data.strapiVersion || 'Unknown'}`);
        console.log(`   - Environment: ${initResponse.data.data.environment || 'Unknown'}`);
      }
    } catch (initError) {
      console.log('⚠️  Admin init endpoint not accessible (may require login)');
    }
    
    // Try to access admin registration endpoint
    try {
      const regResponse = await axios.get(`${STRAPI_URL}/admin/register-admin`);
      console.log('✅ Admin registration is available');
      console.log('📝 You can create a new admin account');
    } catch (regError) {
      if (regError.response?.status === 404) {
        console.log('ℹ️  Admin registration not available (admin already exists)');
        console.log('🔑 Try logging in with existing credentials');
      } else {
        console.log('⚠️  Admin registration endpoint error:', regError.response?.status);
      }
    }
    
    console.log('\n🌐 Next steps:');
    console.log('1. Open http://localhost:1337/admin in your browser');
    console.log('2. If you see a login form, try the credentials from ADMIN_SETUP.md');
    console.log('3. If you see a registration form, create a new admin account');
    console.log('4. After login, configure public API access');
    
  } catch (error) {
    console.error('❌ Error checking admin panel:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Strapi is running: docker-compose ps');
    console.log('2. Check Strapi logs: docker-compose logs aiportal-strapi');
    console.log('3. Restart Strapi: docker-compose restart aiportal-strapi');
  }
}

checkAdminPanel();
