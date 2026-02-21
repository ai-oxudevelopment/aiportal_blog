# Repository Contracts

**Feature**: 001-clean-architecture-refactoring
**Purpose**: Domain Layer interfaces for data access
**Date**: 2025-02-21

---

## Overview

Эти контракты определяют интерфейсы для Infrastructure Layer. Все репозитории должны их реализовывать.

---

## IArticlesRepository

Интерфейс для доступа к статьям (Speckits, Prompts, Blogs).

```typescript
/**
 * Repository for accessing Article entities (Speckits, Prompts, Blogs)
 *
 * @interface IArticlesRepository
 * @domain Domain Layer
 */
interface IArticlesRepository {
  /**
   * Find all articles matching the filter criteria
   *
   * @param filter - Optional filter for article type, category, or search term
   * @returns Promise resolving to array of Articles
   * @throws {RepositoryError} if data source is unavailable
   */
  findAll(filter?: ArticleFilter): Promise<Article[]>

  /**
   * Find a single article by its slug
   *
   * @param slug - URL-friendly identifier of the article
   * @returns Promise resolving to Article or null if not found
   * @throws {RepositoryError} if data source is unavailable
   */
  findBySlug(slug: string): Promise<Article | null>

  /**
   * Find a single article by its ID
   *
   * @param id - Unique identifier of the article
   * @returns Promise resolving to Article or null if not found
   * @throws {RepositoryError} if data source is unavailable
   */
  findById(id: ArticleId): Promise<Article | null>
}

/**
 * Filter options for article queries
 */
interface ArticleFilter {
  /** Filter by article type ('speckit' | 'prompt' | 'blog') */
  type?: ArticleType

  /** Filter by category slug */
  category?: string

  /** Search in title and description */
  search?: string

  /** Pagination offset */
  offset?: number

  /** Maximum results to return */
  limit?: number
}

type ArticleType = 'speckit' | 'prompt' | 'blog'

/**
 * Custom error for repository operations
 */
class RepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'RepositoryError'
  }
}
```

---

## ICategoriesRepository

Интерфейс для доступа к категориям.

```typescript
/**
 * Repository for accessing Category entities
 *
 * @interface ICategoriesRepository
 * @domain Domain Layer
 */
interface ICategoriesRepository {
  /**
   * Find all categories, optionally filtered by type
   *
   * @param type - Optional filter for article type this category belongs to
   * @returns Promise resolving to array of Categories
   * @throws {RepositoryError} if data source is unavailable
   */
  findAll(type?: ArticleType): Promise<Category[]>

  /**
   * Find a category by its slug
   *
   * @param slug - URL-friendly identifier of the category
   * @returns Promise resolving to Category or null if not found
   * @throws {RepositoryError} if data source is unavailable
   */
  findBySlug(slug: string): Promise<Category | null>
}
```

---

## IResearchRepository

Интерфейс для управления AI research сессиями.

```typescript
/**
 * Repository for managing ResearchSession entities
 *
 * @interface IResearchRepository
 * @domain Domain Layer
 */
interface IResearchRepository {
  /**
   * Create a new research session
   *
   * @param platform - AI platform to use for the session
   * @returns Promise resolving to the created ResearchSession
   * @throws {RepositoryError} if session creation fails
   */
  createSession(platform: ResearchPlatform): Promise<ResearchSession>

  /**
   * Add a message to an existing session
   *
   * @param sessionId - Unique identifier of the session
   * @param message - Message data (id and timestamp will be generated)
   * @returns Promise that resolves when message is added
   * @throws {RepositoryError} if session not found or message add fails
   */
  addMessage(
    sessionId: string,
    message: Omit<ResearchMessage, 'id' | 'timestamp'>
  ): Promise<void>

  /**
   * Retrieve a research session by ID
   *
   * @param sessionId - Unique identifier of the session
   * @returns Promise resolving to ResearchSession or null if not found
   * @throws {RepositoryError} if data source is unavailable
   */
  getSession(sessionId: string): Promise<ResearchSession | null>

  /**
   * Update the status of a research session
   *
   * @param sessionId - Unique identifier of the session
   * @param status - New status for the session
   * @returns Promise that resolves when status is updated
   * @throws {RepositoryError} if session not found or update fails
   */
  updateStatus(sessionId: string, status: SessionStatus): Promise<void>
}

type ResearchPlatform = 'openai' | 'claude' | 'perplexity'
type SessionStatus = 'active' | 'completed' | 'error'
```

---

## ICacheProvider

Интерфейс для кеширования данных.

```typescript
/**
 * Generic cache provider interface
 *
 * @interface ICacheProvider
 * @domain Domain Layer
 * @template T - Type of cached values
 */
interface ICacheProvider<T> {
  /**
   * Retrieve a value from cache
   *
   * @param key - Cache key to look up
   * @returns Promise resolving to cached value or null if not found/expired
   */
  get(key: string): Promise<T | null>

  /**
   * Store a value in cache
   *
   * @param key - Cache key to store under
   * @param value - Value to cache
   * @param ttl - Optional time-to-live in seconds (default: 300)
   * @returns Promise that resolves when value is cached
   */
  set(key: string, value: T, ttl?: number): Promise<void>

  /**
   * Invalidate cache entries matching a pattern
   *
   * @param pattern - Glob pattern for keys to invalidate (e.g., "articles:*")
   * @returns Promise that resolves when matching entries are invalidated
   */
  invalidate(pattern: string): Promise<void>

  /**
   * Clear all cache entries
   *
   * @returns Promise that resolves when cache is cleared
   */
  clear(): Promise<void>
}

/**
 * Cache configuration options
 */
interface CacheOptions {
  /** Default time-to-live in seconds */
  defaultTtl: number

  /** Stale-while-revalidate time in seconds */
  staleWhileRevalidate?: number

  /** Maximum number of entries (for in-memory cache) */
  maxEntries?: number
}
```

---

## Implementation Notes

### Strapi Implementation

```typescript
// src/infrastructure/repositories/StrapiArticlesRepository.ts
class StrapiArticlesRepository implements IArticlesRepository {
  constructor(
    private strapiClient: StrapiClient,
    private cache: ICacheProvider<Article[]>
  ) {}

  async findAll(filter?: ArticleFilter): Promise<Article[]> {
    const cacheKey = `articles:${JSON.stringify(filter)}`

    // Try cache first
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached

    // Fetch from Strapi
    const data = await this.strapiClient.get('/api/articles', { params: filter })
    const articles = data.map(this.toArticle)

    // Store in cache
    await this.cache.set(cacheKey, articles, 300) // 5 minutes

    return articles
  }

  // ... other methods
}
```

### In-Memory Cache Implementation

```typescript
// src/infrastructure/cache/InMemoryCacheProvider.ts
class InMemoryCacheProvider<T> implements ICacheProvider<T> {
  private cache = new Map<string, { value: T; expires: number }>()

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  // ... other methods
}
```

---

## Testing Notes

### Mock Repository for Testing

```typescript
// tests/mocks/MockArticlesRepository.ts
class MockArticlesRepository implements IArticlesRepository {
  private articles: Article[] = []

  async findAll(): Promise<Article[]> {
    return [...this.articles]
  }

  // Helper for setting up test data
  withArticles(articles: Article[]): this {
    this.articles = articles
    return this
  }
}
```
