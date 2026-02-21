// Cache Interface
// Generic cache provider for data caching

export interface ICacheProvider<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T, ttl?: number): Promise<void>
  invalidate(pattern: string): Promise<void>
  clear(): Promise<void>
}

export interface CacheOptions {
  defaultTtl: number        // seconds
  staleWhileRevalidate?: number
  maxEntries?: number
}
