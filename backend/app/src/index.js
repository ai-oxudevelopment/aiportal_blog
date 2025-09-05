'use strict';

const UploadStructureService = require('./services/upload-structure');

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
  },
};