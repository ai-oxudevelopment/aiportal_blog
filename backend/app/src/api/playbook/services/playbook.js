'use strict';

/**
 * playbook service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::playbook.playbook');
