const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

// Content types that need public access
const CONTENT_TYPES = [
  'article',
  'category', 
  'section',
  'collection',
  'author',
  'tag',
  'playbook'
];

// Permissions to enable for public role
const PERMISSIONS = ['find', 'findOne'];

async function setupPublicAccess() {
  try {
    console.log('🔧 Setting up public access for Strapi API...');
    
    // First, we need to get the public role ID
    const rolesResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles`);
    const publicRole = rolesResponse.data.roles.find(role => role.type === 'public');
    
    if (!publicRole) {
      console.error('❌ Public role not found');
      return;
    }
    
    console.log(`✅ Found public role with ID: ${publicRole.id}`);
    
    // Get current permissions
    const permissionsResponse = await axios.get(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`);
    const currentPermissions = permissionsResponse.data.role.permissions;
    
    // Update permissions for each content type
    const updatedPermissions = { ...currentPermissions };
    
    CONTENT_TYPES.forEach(contentType => {
      if (!updatedPermissions[contentType]) {
        updatedPermissions[contentType] = {};
      }
      
      PERMISSIONS.forEach(permission => {
        updatedPermissions[contentType][permission] = {
          enabled: true
        };
      });
    });
    
    // Update the role with new permissions
    await axios.put(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
      permissions: updatedPermissions
    });
    
    console.log('✅ Public access configured successfully!');
    console.log('📋 Enabled permissions:');
    CONTENT_TYPES.forEach(contentType => {
      console.log(`   - ${contentType}: ${PERMISSIONS.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up public access:', error.response?.data || error.message);
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to http://localhost:1337/admin');
    console.log('2. Navigate to Settings → Users & Permissions Plugin → Roles → Public');
    console.log('3. Enable find and findOne permissions for all content types');
  }
}

setupPublicAccess();
