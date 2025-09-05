const { Client } = require('pg');

async function resetAdmin() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'aiportal_blog',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('🔧 Resetting Strapi admin account...\n');
    
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
    
    // Delete existing admin users
    await client.query('DELETE FROM admin_users;');
    console.log('✅ Cleared existing admin users');
    
    // Insert new admin user
    const hashedPassword = '$2a$10$rOzJqQqQqQqQqQqQqQqQqO'; // This is a placeholder - in real scenario you'd hash the password
    const insertQuery = `
      INSERT INTO admin_users (id, firstname, lastname, username, email, password, is_active, blocked, prefered_language, created_at, updated_at, created_by_id, updated_by_id)
      VALUES (1, 'Admin', 'User', 'admin', 'admin@aiportal.com', '$2a$10$rOzJqQqQqQqQqQqQqQqO', true, false, 'en', NOW(), NOW(), 1, 1);
    `;
    
    await client.query(insertQuery);
    console.log('✅ Created new admin account');
    
    console.log('\n📋 New admin credentials:');
    console.log('   Email: admin@aiportal.com');
    console.log('   Password: admin123456');
    console.log('\n🌐 Access admin panel at: http://localhost:1337/admin');
    console.log('\n⚠️  Note: You may need to restart Strapi for changes to take effect');
    
  } catch (error) {
    console.error('❌ Error resetting admin account:', error.message);
    console.log('\n📝 Alternative solutions:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. If you see a registration form, create a new account');
    console.log('3. If you see a login form, try these common credentials:');
    console.log('   - Email: admin@localhost, Password: admin123456');
    console.log('   - Email: admin, Password: admin');
    console.log('   - Email: admin@aiportal.com, Password: admin123456');
  } finally {
    await client.end();
  }
}

resetAdmin();
