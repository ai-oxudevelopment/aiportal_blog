'use strict';

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
    // Set up public permissions for content types
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
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

        await strapi
          .query('plugin::users-permissions.role')
          .update({ where: { id: publicRole.id }, data: { permissions } });

        console.log('✅ Public permissions configured successfully');
      }
    } catch (error) {
      console.log('⚠️ Could not configure public permissions:', error.message);
    }
  },
};
