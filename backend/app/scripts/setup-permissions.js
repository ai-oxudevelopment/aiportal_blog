const axios = require('axios');

async function setupPermissions() {
  try {
    // First, get the public role
    const response = await axios.get('http://localhost:1337/api/users-permissions/roles');
    console.log('Roles response:', response.data);
    
    // Find public role
    const publicRole = response.data.roles.find(role => role.type === 'public');
    
    if (publicRole) {
      console.log('Found public role:', publicRole.id);
      
      // Update permissions for public role
      const permissions = {
        ...publicRole.permissions,
        'api::article.article': {
          controllers: {
            article: {
              find: { enabled: true, policy: [] },
              findOne: { enabled: true, policy: [] },
              count: { enabled: true, policy: [] }
            }
          }
        },
        'api::author.author': {
          controllers: {
            author: {
              find: { enabled: true, policy: [] },
              findOne: { enabled: true, policy: [] },
              count: { enabled: true, policy: [] }
            }
          }
        },
        'api::category.category': {
          controllers: {
            category: {
              find: { enabled: true, policy: [] },
              findOne: { enabled: true, policy: [] },
              count: { enabled: true, policy: [] }
            }
          }
        },
        'api::tag.tag': {
          controllers: {
            tag: {
              find: { enabled: true, policy: [] },
              findOne: { enabled: true, policy: [] },
              count: { enabled: true, policy: [] }
            }
          }
        },
        'api::section.section': {
          controllers: {
            section: {
              find: { enabled: true, policy: [] },
              findOne: { enabled: true, policy: [] },
              count: { enabled: true, policy: [] }
            }
          }
        },
        'api::collection.collection': {
          controllers: {
            collection: {
              find: { enabled: true, policy: [] },
              findOne: { enabled: true, policy: [] },
              count: { enabled: true, policy: [] }
            }
          }
        }
      };

      // Update the role
      await axios.put(`http://localhost:1337/api/users-permissions/roles/${publicRole.id}`, {
        permissions
      });

      console.log('✅ Permissions updated successfully');
    } else {
      console.log('❌ Public role not found');
    }
  } catch (error) {
    console.error('Error setting up permissions:', error.message);
  }
}

setupPermissions();
