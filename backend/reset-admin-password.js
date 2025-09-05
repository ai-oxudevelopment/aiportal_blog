const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'strapi',
    user: 'strapi',
    password: 'strapi123'
  });

  try {
    await client.connect();
    console.log('🔧 Resetting admin password...\n');
    
    // Check if admin_users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ admin_users table not found. Strapi may not be fully initialized.');
      return;
    }
    
    // Get existing admin users
    const adminUsers = await client.query('SELECT id, email, username FROM admin_users;');
    
    if (adminUsers.rows.length === 0) {
      console.log('❌ No admin users found. You need to create an admin account first.');
      console.log('🌐 Go to http://localhost:1337/admin and create a new account.');
      return;
    }
    
    console.log('📋 Found admin users:');
    adminUsers.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Username: ${user.username}`);
    });
    
    // Hash new password
    const newPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password for all admin users
    await client.query('UPDATE admin_users SET password = $1, updated_at = NOW();', [hashedPassword]);
    
    console.log('✅ Admin password reset successfully!');
    console.log('\n📋 New login credentials:');
    console.log('   Password: admin123456');
    console.log('\n🔑 Try logging in with any of these emails:');
    adminUsers.rows.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    console.log('\n🌐 Access admin panel at: http://localhost:1337/admin');
    console.log('\n⚠️  Note: You may need to restart Strapi for changes to take effect');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Database connection failed. Make sure PostgreSQL is running:');
      console.log('   docker-compose ps');
      console.log('   docker-compose up -d aiportal-postgres');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Database host not found. Check your database configuration.');
    } else {
      console.log('\n📝 Alternative solutions:');
      console.log('1. Go to http://localhost:1337/admin');
      console.log('2. If you see a registration form, create a new account');
      console.log('3. If you see a login form, try these credentials:');
      console.log('   - Email: admin@localhost, Password: admin123456');
      console.log('   - Email: admin@aiportal.com, Password: admin123456');
    }
  } finally {
    await client.end();
  }
}

resetAdminPassword();
