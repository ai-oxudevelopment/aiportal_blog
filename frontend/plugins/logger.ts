// Logger initialization plugin
import { setLogger, createWinstonLogger } from '~/infrastructure/logging'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Create logger instance
  const logger = createWinstonLogger({
    level: config.public.logLevel || 'info',
    format: config.public.environment === 'production' ? 'json' : 'text',
    environment: config.public.environment || 'development',
  })

  // Set logger globally
  setLogger(logger)

  // Provide logger to app
  nuxtApp.provide('logger', logger)
})
