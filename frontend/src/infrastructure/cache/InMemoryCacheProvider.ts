// InMemoryCacheProvider Implementation
// Implements ICacheProvider interface for in-memory caching

import type { ICacheProvider } from '@/domain/cache'

interface CacheEntry<T> {
  value: T
  expires: number
}

export class InMemoryCacheProvider<T> implements ICacheProvider<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(private options = { defaultTtl: 300, maxEntries: 1000 }) {
    // Clean expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const expires = Date.now() + (ttl || this.options.defaultTtl) * 1000

    // Check entry limit
    if (this.cache.size >= this.options.maxEntries) {
      // Remove oldest entry (simple strategy)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, { value, expires })
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}
