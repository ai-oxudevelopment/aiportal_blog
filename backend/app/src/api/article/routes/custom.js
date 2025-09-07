// backend/app/src/api/article/routes/custom.js

'use strict';

/**
 * Custom article routes
 */

module.exports = {
  routes: [
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
  ],
};
