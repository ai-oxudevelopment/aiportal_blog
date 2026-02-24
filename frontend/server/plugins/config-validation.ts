// Configuration validation plugin
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Validate required config values
  const errors: string[] = []

  // Check required API config
  if (!config.public.strapiUrl) {
    errors.push('STRAPI_URL is required')
  }

  // Validate URLs
  try {
    new URL(config.public.strapiUrl)
  } catch {
    errors.push('STRAPI_URL must be a valid URL')
  }

  // Validate numeric values
  if (config.public.strapiTimeout < 1000) {
    errors.push('STRAPI_TIMEOUT must be at least 1000ms')
  }

  if (config.public.strapiRetryAttempts < 0) {
    errors.push('STRAPI_RETRY_ATTEMPTS must be non-negative')
  }

  // Fail fast if errors
  if (errors.length > 0) {
    console.error('❌ Configuration errors:')
    errors.forEach(err => console.error(`  - ${err}`))
    throw new Error('Invalid configuration')
  }

  console.log('✅ Configuration validated')
})
