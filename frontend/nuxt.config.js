// https://nuxt.com/docs/configuration
export default defineNuxtConfig({
  runtimeConfig: {
    // Private config (server-side only)
    apiSecret: process.env.API_SECRET || '',

    // Public config (exposed to client)
    public: {
      // App config
      appName: process.env.APP_NAME || 'AI Portal Blog',
      appVersion: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      debug: process.env.DEBUG === 'true',

      // API config
      strapiUrl: process.env.STRAPI_URL || 'https://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru',
      strapiTimeout: parseInt(process.env.STRAPI_TIMEOUT || '10000'),
      strapiRetryAttempts: parseInt(process.env.STRAPI_RETRY_ATTEMPTS || '3'),

      // Cache config
      cacheTtl: parseInt(process.env.CACHE_TTL || '300000'),
      cacheStaleWhileRevalidate: parseInt(process.env.CACHE_STALE_WHILE_REVALIDATE || '3600000'),
      cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    }
  },

  imports: {
    // Auto-import composables from these directories
    dirs: [
      'composables',  // existing composables
      'src/presentation/composables',  // NEW: Presentation layer composables
      'src/infrastructure/logging',  // NEW: Logging composables
      'src/infrastructure/errors',  // NEW: Error handling composables
    ]
  },

  // Path aliases for clean imports
  alias: {
    '@domain': './src/domain',
    '@application': './src/application',
    '@infrastructure': './src/infrastructure',
    '@presentation': './src/presentation',
    '~/types': './types',
    '~/config': './config',
  }
})
