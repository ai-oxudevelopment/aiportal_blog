// backend/app/src/services/media-cache.js
let Redis = null;

// Conditionally require ioredis only if available
try {
  Redis = require('ioredis');
} catch (error) {
  // ioredis not installed, will use in-memory cache only
  console.warn('ioredis not available, using in-memory cache only');
}

/**
 * Service for caching media API responses and metadata
 */
class MediaCacheService {
  constructor(strapi) {
    this.strapi = strapi;
    this.redis = null;
    this.isEnabled = process.env.REDIS_URL || process.env.REDIS_HOST;
    this.defaultTTL = 3600; // 1 hour default TTL
    
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  initializeRedis() {
    if (!this.isEnabled || !Redis) {
      this.strapi.log.info('Redis not configured or not available, using in-memory cache fallback');
      this.memoryCache = new Map();
      return;
    }

    try {
      const redisConfig = {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      };

      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, redisConfig);
      } else {
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB || 0,
          ...redisConfig
        });
      }

      this.redis.on('connect', () => {
        this.strapi.log.info('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.strapi.log.error('Redis connection error:', error);
        this.redis = null;
        this.memoryCache = new Map(); // Fallback to memory cache
      });

    } catch (error) {
      this.strapi.log.error('Failed to initialize Redis:', error);
      this.redis = null;
      this.memoryCache = new Map(); // Fallback to memory cache
    }
  }

  /**
   * Generate cache key for media operations
   * @param {string} operation - Operation type
   * @param {Object} params - Parameters for the operation
   * @returns {string} Cache key
   */
  generateCacheKey(operation, params = {}) {
    const keyParts = ['media', operation];
    
    // Add sorted parameters to ensure consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    if (sortedParams) {
      keyParts.push(sortedParams);
    }
    
    return keyParts.join(':');
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached data or null
   */
  async get(key) {
    try {
      if (this.redis) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } else if (this.memoryCache) {
        const cached = this.memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.data;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      this.strapi.log.error('Cache get error:', error);
    }
    return null;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, data, ttl = this.defaultTTL) {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
        return true;
      } else if (this.memoryCache) {
        this.memoryCache.set(key, {
          data,
          expires: Date.now() + (ttl * 1000)
        });
        return true;
      }
    } catch (error) {
      this.strapi.log.error('Cache set error:', error);
    }
    return false;
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      if (this.redis) {
        await this.redis.del(key);
        return true;
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
        return true;
      }
    } catch (error) {
      this.strapi.log.error('Cache delete error:', error);
    }
    return false;
  }

  /**
   * Delete multiple cache keys by pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<number>} Number of keys deleted
   */
  async delPattern(pattern) {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return keys.length;
      } else if (this.memoryCache) {
        let deletedCount = 0;
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
            deletedCount++;
          }
        }
        return deletedCount;
      }
    } catch (error) {
      this.strapi.log.error('Cache pattern delete error:', error);
    }
    return 0;
  }

  /**
   * Cache media library folders
   * @param {Array} folders - Folders data
   * @param {number} ttl - Cache TTL
   * @returns {Promise<boolean>} Success status
   */
  async cacheFolders(folders, ttl = 1800) { // 30 minutes
    const key = this.generateCacheKey('folders');
    return await this.set(key, folders, ttl);
  }

  /**
   * Get cached media library folders
   * @returns {Promise<Array|null>} Cached folders or null
   */
  async getCachedFolders() {
    const key = this.generateCacheKey('folders');
    return await this.get(key);
  }

  /**
   * Cache files in folder
   * @param {string} folderName - Folder name
   * @param {Object} options - Query options
   * @param {Array} files - Files data
   * @param {number} ttl - Cache TTL
   * @returns {Promise<boolean>} Success status
   */
  async cacheFilesInFolder(folderName, options, files, ttl = 900) { // 15 minutes
    const key = this.generateCacheKey('files_in_folder', { folderName, ...options });
    return await this.set(key, files, ttl);
  }

  /**
   * Get cached files in folder
   * @param {string} folderName - Folder name
   * @param {Object} options - Query options
   * @returns {Promise<Array|null>} Cached files or null
   */
  async getCachedFilesInFolder(folderName, options) {
    const key = this.generateCacheKey('files_in_folder', { folderName, ...options });
    return await this.get(key);
  }

  /**
   * Cache search results
   * @param {Object} filters - Search filters
   * @param {Array} results - Search results
   * @param {number} ttl - Cache TTL
   * @returns {Promise<boolean>} Success status
   */
  async cacheSearchResults(filters, results, ttl = 600) { // 10 minutes
    const key = this.generateCacheKey('search', filters);
    return await this.set(key, results, ttl);
  }

  /**
   * Get cached search results
   * @param {Object} filters - Search filters
   * @returns {Promise<Array|null>} Cached results or null
   */
  async getCachedSearchResults(filters) {
    const key = this.generateCacheKey('search', filters);
    return await this.get(key);
  }

  /**
   * Cache media library statistics
   * @param {Object} stats - Statistics data
   * @param {number} ttl - Cache TTL
   * @returns {Promise<boolean>} Success status
   */
  async cacheStats(stats, ttl = 3600) { // 1 hour
    const key = this.generateCacheKey('stats');
    return await this.set(key, stats, ttl);
  }

  /**
   * Get cached media library statistics
   * @returns {Promise<Object|null>} Cached stats or null
   */
  async getCachedStats() {
    const key = this.generateCacheKey('stats');
    return await this.get(key);
  }

  /**
   * Cache tags list
   * @param {Array} tags - Tags data
   * @param {number} ttl - Cache TTL
   * @returns {Promise<boolean>} Success status
   */
  async cacheTags(tags, ttl = 1800) { // 30 minutes
    const key = this.generateCacheKey('tags');
    return await this.set(key, tags, ttl);
  }

  /**
   * Get cached tags list
   * @returns {Promise<Array|null>} Cached tags or null
   */
  async getCachedTags() {
    const key = this.generateCacheKey('tags');
    return await this.get(key);
  }

  /**
   * Invalidate cache when files are modified
   * @param {string} operation - Operation type (create, update, delete)
   * @param {Object} fileData - File data
   * @returns {Promise<number>} Number of cache entries invalidated
   */
  async invalidateOnFileChange(operation, fileData) {
    const patterns = [
      'media:folders:*',
      'media:files_in_folder:*',
      'media:search:*',
      'media:stats:*',
      'media:tags:*'
    ];

    let totalInvalidated = 0;
    for (const pattern of patterns) {
      const invalidated = await this.delPattern(pattern);
      totalInvalidated += invalidated;
    }

    this.strapi.log.info(`Invalidated ${totalInvalidated} cache entries after file ${operation}`);
    return totalInvalidated;
  }

  /**
   * Clear all media cache
   * @returns {Promise<number>} Number of cache entries cleared
   */
  async clearAllMediaCache() {
    return await this.delPattern('media:*');
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    try {
      if (this.redis) {
        const info = await this.redis.info('memory');
        const keyspace = await this.redis.info('keyspace');
        return {
          type: 'redis',
          connected: this.redis.status === 'ready',
          memory: info,
          keyspace: keyspace
        };
      } else if (this.memoryCache) {
        return {
          type: 'memory',
          connected: true,
          size: this.memoryCache.size,
          keys: Array.from(this.memoryCache.keys())
        };
      }
    } catch (error) {
      this.strapi.log.error('Failed to get cache stats:', error);
    }
    
    return {
      type: 'none',
      connected: false
    };
  }
}

module.exports = MediaCacheService;
