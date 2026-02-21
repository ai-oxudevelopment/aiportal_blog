// Domain Entity: Category
// Represents categories for organizing content

import type { ArticleType } from './Article'

export interface Category {
  readonly id: number
  slug: string
  name: string
  type: ArticleType
}

export interface CategoryInput {
  id: number
  slug: string
  name: string
  type: ArticleType
}

export function createCategory(data: CategoryInput): Category {
  if (!data.slug || !data.name) {
    throw new Error('Invalid category: slug and name are required')
  }
  return {
    id: data.id,
    slug: data.slug.toLowerCase(),
    name: data.name,
    type: data.type
  }
}
