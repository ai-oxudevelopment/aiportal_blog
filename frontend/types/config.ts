// Runtime config interface for Nuxt
interface RuntimeConfig {
  // Private config (server-side only)
  apiSecret: string
}

interface PublicRuntimeConfig {
  // App config
  appName: string
  appVersion: string
  environment: 'development' | 'staging' | 'production'
  debug: boolean

  // API config
  strapiUrl: string
  strapiTimeout: number
  strapiRetryAttempts: number

  // Cache config
  cacheTtl: number
  cacheStaleWhileRevalidate: number
  cacheEnabled: boolean
}

// Extend Nuxt's runtime config interface
interface NuxtRuntimeConfig extends RuntimeConfig {}
interface NuxtPublicRuntimeConfig extends PublicRuntimeConfig {}
