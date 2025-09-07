// backend/app/src/api/article/routes/article.js

'use strict';

/**
 * article router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::article.article', {
  config: {
    find: {
      middlewares: [],
    },
    findOne: {
      middlewares: [],
    },
    create: {
      middlewares: [],
    },
    update: {
      middlewares: [],
    },
    delete: {
      middlewares: [],
    },
  },
  only: ['find', 'findOne', 'create', 'update', 'delete'],
}).routes.concat([
  {
    method: 'GET',
    path: '/articles/prompts',
    handler: 'article.findPrompts',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'GET',
    path: '/articles/articles',
    handler: 'article.findArticles',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'GET',
    path: '/articles/:id/usage',
    handler: 'article.incrementUsage',
    config: {
      policies: [],
      middlewares: [],
    },
  },
]);
