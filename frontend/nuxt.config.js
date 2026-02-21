// https://nuxt.com/docs/configuration
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
    }
  },

  imports: {
    // Auto-import composables from these directories
    dirs: [
      'composables',  // existing composables
      'src/presentation/composables',  // NEW: Presentation layer composables
    ]
  },

  // Path aliases for clean imports
  alias: {
    '@domain': './src/domain',
    '@application': './src/application',
    '@infrastructure': './src/infrastructure',
    '@presentation': './src/presentation',
  }
})
