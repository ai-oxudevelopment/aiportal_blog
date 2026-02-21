// Repository Interface: Articles
// Provides access to Article entities (Speckits, Prompts, Blogs)

import type { Article, ArticleId, ArticleType } from '../entities'

export interface ArticleFilter {
  type?: ArticleType
  category?: string
  search?: string
  offset?: number
  limit?: number
}

export interface IArticlesRepository {
  findAll(filter?: ArticleFilter): Promise<Article[]>
  findBySlug(slug: string): Promise<Article | null>
  findById(id: ArticleId): Promise<Article | null>
}

// Custom error for repository operations
export class RepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'RepositoryError'
  }
}
