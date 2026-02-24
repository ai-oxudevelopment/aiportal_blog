// API endpoints and timeouts
export interface ApiConfig {
  strapi: {
    url: string
    timeout: number
    retryAttempts: number
    retryDelay: number
  }
  cache: {
    ttl: number
    staleWhileRevalidate: number
    enabled: boolean
  }
}

export const apiDefaults: Partial<ApiConfig> = {
  strapi: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  cache: {
    ttl: 300000,  // 5 minutes
    staleWhileRevalidate: 3600000,  // 1 hour
    enabled: true,
  },
}
