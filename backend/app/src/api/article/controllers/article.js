// backend/app/src/api/article/controllers/article.js

'use strict';

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  // Custom controller methods can be added here
  async findOne(ctx) {
    const { id } = ctx.params;
    
    const entity = await strapi.entityService.findOne('api::article.article', id, {
      populate: {
        categories: true,
        tags: true,
        section: true,
        collections: true,
        author: true,
      },
    });

    if (!entity) {
      return ctx.notFound('Article not found');
    }

    return this.sanitizeOutput(entity, ctx);
  },

  async find(ctx) {
    const { query } = ctx;
    
    const entities = await strapi.entityService.findMany('api::article.article', {
      ...query,
      populate: {
        categories: true,
        tags: true,
        section: true,
        collections: true,
        author: true,
      },
    });

    return this.sanitizeOutput(entities, ctx);
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    
    // Validate promptId uniqueness for prompts
    if (data.type === 'prompt' && data.promptId) {
      const existingArticle = await strapi.entityService.findMany('api::article.article', {
        filters: { 
          promptId: data.promptId,
          type: 'prompt'
        },
      });
      
      if (existingArticle.length > 0) {
        return ctx.badRequest('Prompt ID already exists');
      }
    }

    const entity = await strapi.entityService.create('api::article.article', {
      data,
      populate: {
        categories: true,
        tags: true,
        section: true,
        collections: true,
        author: true,
      },
    });

    return this.sanitizeOutput(entity, ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    // Validate promptId uniqueness for prompts if being updated
    if (data.type === 'prompt' && data.promptId) {
      const existingArticle = await strapi.entityService.findMany('api::article.article', {
        filters: { 
          promptId: data.promptId,
          type: 'prompt',
          id: { $ne: id }
        },
      });
      
      if (existingArticle.length > 0) {
        return ctx.badRequest('Prompt ID already exists');
      }
    }

    const entity = await strapi.entityService.update('api::article.article', id, {
      data,
      populate: {
        categories: true,
        tags: true,
        section: true,
        collections: true,
        author: true,
      },
    });

    return this.sanitizeOutput(entity, ctx);
  },

  // Custom method to get prompts only
  async findPrompts(ctx) {
    const { query } = ctx;
    
    const entities = await strapi.entityService.findMany('api::article.article', {
      ...query,
      filters: {
        ...query.filters,
        type: 'prompt'
      },
      populate: {
        categories: true,
        tags: true,
        section: true,
        collections: true,
        author: true,
      },
    });

    return this.sanitizeOutput(entities, ctx);
  },

  // Custom method to get articles only
  async findArticles(ctx) {
    const { query } = ctx;
    
    const entities = await strapi.entityService.findMany('api::article.article', {
      ...query,
      filters: {
        ...query.filters,
        type: 'article'
      },
      populate: {
        categories: true,
        tags: true,
        section: true,
        collections: true,
        author: true,
      },
    });

    return this.sanitizeOutput(entities, ctx);
  },

  // Increment usage count for prompts
  async incrementUsage(ctx) {
    const { id } = ctx.params;
    
    const entity = await strapi.entityService.findOne('api::article.article', id);
    
    if (!entity) {
      return ctx.notFound('Article not found');
    }

    if (entity.type !== 'prompt') {
      return ctx.badRequest('Only prompts can have usage count incremented');
    }

    const updatedEntity = await strapi.entityService.update('api::article.article', id, {
      data: {
        usage_count: (entity.usage_count || 0) + 1
      }
    });

    return this.sanitizeOutput(updatedEntity, ctx);
  }
}));
