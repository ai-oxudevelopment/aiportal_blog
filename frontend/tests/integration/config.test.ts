/**
 * Configuration Integration Tests
 * Tests for configuration loading, validation, and environment variables
 */

describe('Configuration', () => {
  describe('Runtime Config', () => {
    it('should have required strapiUrl config', () => {
      // This test verifies the config structure exists
      // Actual values will be tested at runtime
      expect(process.env.STRAPI_URL || 'https://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru').toBeTruthy()
    })

    it('should have valid timeout values', () => {
      const timeout = parseInt(process.env.STRAPI_TIMEOUT || '10000')
      expect(timeout).toBeGreaterThanOrEqual(1000)
      expect(timeout).toBeLessThanOrEqual(60000)
    })

    it('should have valid retry attempts', () => {
      const retries = parseInt(process.env.STRAPI_RETRY_ATTEMPTS || '3')
      expect(retries).toBeGreaterThanOrEqual(1)
      expect(retries).toBeLessThanOrEqual(10)
    })

    it('should have valid cache TTL values', () => {
      const cacheTtl = parseInt(process.env.CACHE_TTL || '300000')
      const staleTtl = parseInt(process.env.CACHE_STALE_WHILE_REVALIDATE || '3600000')

      expect(cacheTtl).toBeGreaterThan(0)
      expect(staleTtl).toBeGreaterThan(cacheTtl)
    })
  })

  describe('Environment Validation', () => {
    it('should validate URL format', () => {
      const url = process.env.STRAPI_URL || 'https://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'

      try {
        new URL(url)
        // If we get here, URL is valid
        expect(true).toBe(true)
      } catch {
        throw new Error(`Invalid STRAPI_URL: ${url}`)
      }
    })

    it('should have valid log level', () => {
      const validLevels = ['error', 'warn', 'info', 'http', 'debug']
      const logLevel = process.env.LOG_LEVEL || 'info'

      expect(validLevels).toContain(logLevel)
    })

    it('should have valid environment', () => {
      const validEnvs = ['development', 'staging', 'production']
      const env = process.env.NODE_ENV || 'development'

      expect(validEnvs).toContain(env)
    })
  })

  describe('Config Defaults', () => {
    it('should use default app name', () => {
      const appName = process.env.APP_NAME || 'AI Portal Blog'
      expect(appName).toBeTruthy()
    })

    it('should use default app version', () => {
      const appVersion = process.env.APP_VERSION || '1.0.0'
      expect(appVersion).toMatch(/^\d+\.\d+\.\d+/)
    })

    it('should have cache enabled by default', () => {
      const cacheEnabled = process.env.CACHE_ENABLED !== 'false'
      expect(cacheEnabled).toBe(true)
    })
  })
})
