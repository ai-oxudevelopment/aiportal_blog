'use strict';

/**
 * playbook controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::playbook.playbook');
