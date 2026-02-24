// Configuration Type Definitions
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  debug: boolean
}

export interface ApiConfig {
  strapiUrl: string
  strapiTimeout: number
  strapiRetryAttempts: number
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'http' | 'debug'
  format: 'json' | 'text'
}

export interface CacheConfig {
  ttl: number
  staleWhileRevalidate: number
  enabled: boolean
}

export interface RuntimeConfig {
  apiSecret: string
  public: {
    appName: string
    appVersion: string
    environment: 'development' | 'staging' | 'production'
    debug: boolean
    strapiUrl: string
    strapiTimeout: number
    strapiRetryAttempts: number
    cacheTtl: number
    cacheStaleWhileRevalidate: number
    cacheEnabled: boolean
    logLevel: string
  }
}
