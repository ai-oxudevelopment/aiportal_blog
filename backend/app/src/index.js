'use strict';

const UploadStructureService = require('./services/upload-structure');

// Function to configure public access for API endpoints
async function configurePublicAccess(strapi) {
  const contentTypes = ['article', 'category', 'section', 'collection', 'author', 'tag'];
  
  for (const contentType of contentTypes) {
    try {
      // Get the public role
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (publicRole) {
        // Get current permissions
        const permissions = await strapi.query('plugin::users-permissions.permission').findMany({
          where: {
            role: publicRole.id,
            action: { $in: ['find', 'findOne'] },
            subject: contentType
          }
        });

        // Enable find and findOne permissions if they don't exist
        const actions = ['find', 'findOne'];
        for (const action of actions) {
          const existingPermission = permissions.find(p => p.action === action);
          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                subject: contentType,
                role: publicRole.id,
                properties: {},
                conditions: []
              }
            });
            strapi.log.info(`Enabled ${action} permission for ${contentType}`);
          }
        }
      }
    } catch (error) {
      strapi.log.warn(`Could not configure permissions for ${contentType}:`, error.message);
    }
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Initialize upload directory structure
    try {
      const uploadStructureService = new UploadStructureService(strapi);
      await uploadStructureService.initializeStructure();
      strapi.log.info('Upload directory structure initialized successfully');
    } catch (error) {
      strapi.log.error('Failed to initialize upload structure:', error);
    }

    // Configure public access for API endpoints
    try {
      await configurePublicAccess(strapi);
      strapi.log.info('Public access configured successfully');
    } catch (error) {
      strapi.log.error('Failed to configure public access:', error);
    }
  },
};