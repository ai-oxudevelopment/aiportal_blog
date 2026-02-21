// Repository Interface: Categories
// Provides access to Category entities

import type { Category, ArticleType } from '../entities'

export interface ICategoriesRepository {
  findAll(type?: ArticleType): Promise<Category[]>
  findBySlug(slug: string): Promise<Category | null>
}
