// frontend/src/lib/cache/CacheManager.ts
// Advanced cache management system with TTL, invalidation, and persistence

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  version: number;
  metadata?: {
    size: number;
    source: 'api' | 'computed' | 'user';
    dependencies?: string[];
  };
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enablePersistence: boolean;
  enableCompression: boolean;
  enableMetrics: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  invalidations: number;
  size: number;
  lastCleanup: Date;
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private persistenceKey = 'app-cache';

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      enablePersistence: true,
      enableCompression: false,
      enableMetrics: true,
      ...config,
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0,
      size: 0,
      lastCleanup: new Date(),
    };

    this.initialize();
  }

  private initialize() {
    // Load from persistence
    if (this.config.enablePersistence) {
      this.loadFromPersistence();
    }

    // Start cleanup interval
    this.startCleanupInterval();

    // Listen for storage events (cross-tab synchronization)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === this.persistenceKey && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        this.cache = new Map(data);
        this.updateMetrics();
      } catch (error) {
        console.warn('Failed to sync cache from storage:', error);
      }
    }
  }

  private loadFromPersistence() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.updateMetrics();
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error);
    }
  }

  private saveToPersistence() {
    if (!this.config.enablePersistence || typeof window === 'undefined') return;

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to persistence:', error);
    }
  }

  private updateMetrics() {
    this.metrics.size = this.cache.size;
  }

  private generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  // Public API
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }

    this.metrics.hits++;
    return entry.data as T;
  }

  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      version?: number;
      metadata?: CacheEntry['metadata'];
    } = {}
  ): void {
    const {
      ttl = this.config.defaultTTL,
      tags = [],
      version = 1,
      metadata,
    } = options;

    // Check size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      version,
      metadata: {
        size: this.calculateSize(data),
        source: 'api',
        ...metadata,
      },
    };

    this.cache.set(key, entry);
    this.metrics.sets++;
    this.updateMetrics();

    if (this.config.enablePersistence) {
      this.saveToPersistence();
    }
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.deletes++;
      this.updateMetrics();
      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
    }
    return deleted;
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.metrics.invalidations += count;
      this.updateMetrics();
      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
    }
    
    return count;
  }

  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.metrics.invalidations += count;
      this.updateMetrics();
      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
    }
    
    return count;
  }

  clear(): void {
    this.cache.clear();
    this.updateMetrics();
    if (this.config.enablePersistence) {
      this.saveToPersistence();
    }
  }

  cleanup(): void {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.updateMetrics();
      if (this.config.enablePersistence) {
        this.saveToPersistence();
      }
    }
    
    this.metrics.lastCleanup = new Date();
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Cache key generators
  generateKey = {
    article: (id: string | number) => this.generateKey('article', id),
    articleBySlug: (slug: string) => this.generateKey('article', 'slug', slug),
    articles: (params: Record<string, any>) => 
      this.generateKey('articles', JSON.stringify(params)),
    category: (id: string | number) => this.generateKey('category', id),
    categoryBySlug: (slug: string) => this.generateKey('category', 'slug', slug),
    categories: () => this.generateKey('categories'),
    author: (id: string | number) => this.generateKey('author', id),
    authorBySlug: (slug: string) => this.generateKey('author', 'slug', slug),
    authors: () => this.generateKey('authors'),
    tag: (id: string | number) => this.generateKey('tag', id),
    tagBySlug: (slug: string) => this.generateKey('tag', 'slug', slug),
    tags: () => this.generateKey('tags'),
    search: (query: string, params: Record<string, any>) => 
      this.generateKey('search', query, JSON.stringify(params)),
  };

  // Cache invalidation helpers
  invalidate = {
    article: (id: string | number) => {
      this.delete(this.generateKey.article(id));
      this.invalidateByTag('articles');
    },
    articles: () => {
      this.invalidateByTag('articles');
      this.invalidateByPattern('^articles:');
    },
    category: (id: string | number) => {
      this.delete(this.generateKey.category(id));
      this.invalidateByTag('categories');
    },
    categories: () => {
      this.invalidateByTag('categories');
      this.invalidateByPattern('^categories:');
    },
    author: (id: string | number) => {
      this.delete(this.generateKey.author(id));
      this.invalidateByTag('authors');
    },
    authors: () => {
      this.invalidateByTag('authors');
      this.invalidateByPattern('^authors:');
    },
    tag: (id: string | number) => {
      this.delete(this.generateKey.tag(id));
      this.invalidateByTag('tags');
    },
    tags: () => {
      this.invalidateByTag('tags');
      this.invalidateByPattern('^tags:');
    },
    search: (query?: string) => {
      if (query) {
        this.invalidateByPattern(`^search:${query}:`);
      } else {
        this.invalidateByPattern('^search:');
      }
    },
  };

  // Metrics and debugging
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{
      key: string;
      age: number;
      ttl: number;
      tags: string[];
      size: number;
    }>;
  } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
      tags: entry.tags,
      size: entry.metadata?.size || 0,
    }));

    return {
      size: this.cache.size,
      hitRate,
      entries,
    };
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Export types and utilities
export type { CacheEntry, CacheConfig, CacheMetrics };
export { CacheManager };
