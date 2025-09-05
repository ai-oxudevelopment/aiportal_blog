const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function createAdmin() {
  try {
    console.log('🔧 Creating Strapi admin account...\n');
    
    // First, try to get the admin registration endpoint
    const response = await axios.post(`${STRAPI_URL}/admin/register-admin`, {
      firstname: 'Admin',
      lastname: 'User',
      username: 'admin',
      email: 'admin@aiportal.com',
      password: 'admin123456',
      confirmPassword: 'admin123456'
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Email: admin@aiportal.com');
    console.log('   Password: admin123456');
    console.log('\n🌐 Access admin panel at: http://localhost:1337/admin');
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already registered')) {
      console.log('ℹ️  Admin account already exists');
      console.log('🔑 Try these common credentials:');
      console.log('   Email: admin@aiportal.com');
      console.log('   Password: admin123456');
      console.log('\n   Or:');
      console.log('   Email: admin@localhost');
      console.log('   Password: admin123456');
      console.log('\n   Or:');
      console.log('   Email: admin');
      console.log('   Password: admin');
    } else {
      console.error('❌ Error creating admin account:', error.response?.data || error.message);
      console.log('\n📝 Manual setup required:');
      console.log('1. Go to http://localhost:1337/admin');
      console.log('2. If you see registration form, create account with:');
      console.log('   - Email: admin@aiportal.com');
      console.log('   - Password: admin123456');
      console.log('3. If you see login form, try common credentials above');
    }
  }
}

createAdmin();
