// Domain Entity: Article
// Represents content items (Speckits, Prompts, Blogs)

export interface Article {
  readonly id: number
  slug: string
  title: string
  description: string
  body: string
  type: ArticleType
  category: Category
  file?: FileAttachment
  diagram?: DiagramData
  faq?: FaqItem[]
  createdAt: Date
  updatedAt: Date
}

export type ArticleType = 'speckit' | 'prompt' | 'blog'

export interface FileAttachment {
  readonly id: string
  name: string
  url: string
  size: number
  mimeType: string
}

export interface DiagramData {
  format: 'mermaid' | 'plantuml'
  content: string
  rendered?: string
}

export interface FaqItem {
  question: string
  answer: string
  order: number
}

// Value Object for type-safe IDs
// Using branded types to prevent mixing IDs from different entities
export type ArticleId = number & { readonly __brand: unique symbol }

export function createArticleId(id: number): ArticleId {
  if (id <= 0) {
    throw new Error('Invalid ArticleId: must be positive')
  }
  return id as ArticleId
}
