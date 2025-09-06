// backend/app/src/middlewares/global/media-cache.js
const MediaCacheService = require('../../services/media-cache');

/**
 * Middleware for caching media API responses
 */
module.exports = (config, { strapi }) => {
  const mediaCache = new MediaCacheService(strapi);

  return async (ctx, next) => {
    // Only cache GET requests to media-library endpoints
    if (ctx.method !== 'GET' || !ctx.path.startsWith('/api/media-library')) {
      return await next();
    }

    // Skip caching for admin users or when cache is disabled
    if (ctx.state.user?.role?.type === 'administrator' || ctx.query.nocache === 'true') {
      return await next();
    }

    try {
      // Generate cache key based on path and query parameters
      const cacheKey = mediaCache.generateCacheKey(
        ctx.path.replace('/api/media-library/', ''),
        ctx.query
      );

      // Try to get cached response
      const cachedResponse = await mediaCache.get(cacheKey);
      
      if (cachedResponse) {
        ctx.set('X-Cache', 'HIT');
        ctx.set('X-Cache-Key', cacheKey);
        ctx.body = cachedResponse;
        return;
      }

      // Cache miss - proceed with request
      await next();

      // Cache successful responses
      if (ctx.status === 200 && ctx.body) {
        // Determine TTL based on endpoint
        let ttl = 900; // 15 minutes default
        
        if (ctx.path.includes('/stats')) {
          ttl = 3600; // 1 hour for stats
        } else if (ctx.path.includes('/folders')) {
          ttl = 1800; // 30 minutes for folders
        } else if (ctx.path.includes('/tags')) {
          ttl = 1800; // 30 minutes for tags
        } else if (ctx.path.includes('/search')) {
          ttl = 600; // 10 minutes for search
        }

        await mediaCache.set(cacheKey, ctx.body, ttl);
        ctx.set('X-Cache', 'MISS');
        ctx.set('X-Cache-Key', cacheKey);
        ctx.set('X-Cache-TTL', ttl.toString());
      }

    } catch (error) {
      strapi.log.error('Media cache middleware error:', error);
      // Continue without caching on error
      await next();
    }
  };
};
