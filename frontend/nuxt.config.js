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

      // Logging config
      logLevel: process.env.LOG_LEVEL || 'info',
    }
  },

  // Vue error handler
  vue: {
    onError: (err, instance, info) => {
      // Import logger at runtime to avoid import issues
      const logger = (globalThis as any).__logger
      if (logger) {
        logger.error('Vue error handler caught error', {
          error: err instanceof Error ? {
            message: err.message,
            stack: err.stack,
            name: err.name,
          } : err,
          componentName: instance?.$options?.name || 'Unknown',
          lifecycleHook: info,
        })
      }

      // In development, show full error
      if (process.env.NODE_ENV === 'development') {
        console.error('Vue error:', err)
        console.error('Info:', info)
      }
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
    '~/contracts': './contracts',
  }
})
