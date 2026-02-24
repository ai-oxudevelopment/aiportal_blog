// StrapiArticlesRepository Implementation
// Repository for Articles (Speckits, Prompts) with caching

import type {
  IArticlesRepository,
  ArticleFilter
} from '@/domain/repositories'
import type { Article, ArticleId, ArticleType } from '@/domain/entities'
import type { ICacheProvider } from '@/domain/cache'
import type { StrapiQueryParams } from '~/types/api'
import { StrapiClient, createStrapiClient } from '../api/StrapiClient'

interface StrapiCategory {
  id: number
  attributes?: {
    slug: string
    name: string
    type: ArticleType
  }
  slug?: string
  name?: string
  type?: ArticleType
}

interface StrapiFile {
  id: string
  attributes?: {
    name: string
    url: string
    size: number
    mime: string
  }
  url?: string
  name?: string
  size?: number
  mime?: string
}

interface StrapiDiagram {
  id: string
  attributes?: {
    format: string
    content: string
  }
  format?: string
  content?: string
}

interface StrapiFaqItem {
  id: string
  attributes?: {
    question: string
    answer: string
    order: number
  }
  question?: string
  answer?: string
  order?: number
}

interface StrapiArticle {
  id: number
  attributes?: {
    slug: string
    title: string
    description: string
    body: string
    type: ArticleType
    category?: {
      data: StrapiCategory
    }
    file?: {
      data: StrapiFile
    }
    diagram?: {
      data: StrapiDiagram
    }
    faq?: {
      data: StrapiFaqItem[]
    }
    createdAt: string
    updatedAt: string
  }
  slug?: string
  title?: string
  description?: string
  body?: string
  type?: ArticleType
  category?: {
    data: StrapiCategory
  }
  file?: {
    data: StrapiFile
  }
  diagram?: {
    data: StrapiDiagram
  }
  faq?: {
    data: StrapiFaqItem[]
  }
  createdAt?: string
  updatedAt?: string
}

export class StrapiArticlesRepository implements IArticlesRepository {
  private cache: ICacheProvider<Article[]>

  constructor(
    private strapiClient: StrapiClient,
    cacheProvider: (ttl: number) => ICacheProvider<Article[]>
  ) {
    this.cache = cacheProvider(300) // 5 minutes TTL
  }

  async findAll(filter?: ArticleFilter): Promise<Article[]> {
    const cacheKey = `articles:${JSON.stringify(filter || {})}`

    // Try cache first
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached

    // Build Strapi query params
    const params: StrapiQueryParams = {
      populate: ['category', 'file', 'diagram', 'faq']
    }

    if (filter?.type) {
      params.filters = {
        type: { $eq: filter.type }
      }
    }

    if (filter?.category) {
      params.filters = {
        ...params.filters,
        category: { slug: { $eq: filter.category } }
      }
    }

    if (filter?.search) {
      params.filters = {
        ...params.filters,
        $or: [
          { title: { $containsi: filter.search } },
          { description: { $containsi: filter.search } }
        ]
      }
    }

    if (filter?.sort) {
      params.sort = filter.sort
    }

    if (filter?.offset || filter?.limit) {
      params.pagination = {
        page: Math.floor((filter.offset || 0) / (filter.limit || 10)) + 1,
        pageSize: filter.limit || 10
      }
    }

    // Fetch from Strapi
    const data = await this.strapiClient.get<StrapiArticle>('/api/articles', params)
    const articles = data.map(item => this.toArticle(item))

    // Store in cache
    await this.cache.set(cacheKey, articles, 300)

    return articles
  }

  async findBySlug(slug: string): Promise<Article | null> {
    // Try cache first
    const cacheKey = `article:slug:${slug}`
    const cached = await this.cache.get<Article[]>(cacheKey)
    if (cached && cached.length > 0) return cached[0]

    // Fetch from Strapi with filter
    const data = await this.strapiClient.get<StrapiArticle>('/api/articles', {
      filters: { slug: { $eq: slug } },
      populate: ['category', 'file', 'diagram', 'faq']
    })

    if (data.length === 0) return null

    const article = this.toArticle(data[0])

    // Cache single result
    await this.cache.set(cacheKey, [article], 300)

    return article
  }

  async findById(id: ArticleId): Promise<Article | null> {
    const cacheKey = `article:id:${id}`
    const cached = await this.cache.get<Article[]>(cacheKey)
    if (cached && cached.length > 0) return cached[0]

    const data = await this.strapiClient.getOne<StrapiArticle>('/api/articles', id)
    if (!data) return null

    const article = this.toArticle(data)
    await this.cache.set(cacheKey, [article], 300)

    return article
  }

  private toArticle(data: StrapiArticle): Article {
    // Handle both v4 (attributes) and v5 (flat) formats
    const attrs = data.attributes || data

    // Handle category
    const categoryData = attrs.category?.data
    const categoryAttrs = categoryData?.attributes || categoryData
    const category = {
      id: categoryData?.id || 0,
      slug: categoryAttrs?.slug || '',
      name: categoryAttrs?.name || '',
      type: categoryAttrs?.type || 'speckit'
    }

    // Handle file
    const fileData = attrs.file?.data
    const fileAttrs = fileData?.attributes || fileData
    const file = fileAttrs ? {
      id: fileData?.id || '',
      name: fileAttrs?.name || '',
      url: fileAttrs?.url || '',
      size: fileAttrs?.size || 0,
      mimeType: fileAttrs?.mime || ''
    } : undefined

    // Handle diagram
    const diagramData = attrs.diagram?.data
    const diagramAttrs = diagramData?.attributes || diagramData
    const diagram = diagramAttrs ? {
      format: diagramAttrs?.format || 'mermaid',
      content: diagramAttrs?.content || ''
    } : undefined

    // Handle FAQ
    const faqData = attrs.faq?.data || []
    const faq = faqData.map((item: StrapiFaqItem) => {
      const itemAttrs = item.attributes || item
      return {
        question: itemAttrs?.question || '',
        answer: itemAttrs?.answer || '',
        order: itemAttrs?.order || 0
      }
    })

    return {
      id: data.id,
      slug: attrs?.slug || '',
      title: attrs?.title || '',
      description: attrs?.description || '',
      body: attrs?.body || '',
      type: attrs?.type || 'speckit',
      category,
      file,
      diagram,
      faq,
      createdAt: attrs?.createdAt ? new Date(attrs.createdAt) : new Date(),
      updatedAt: attrs?.updatedAt ? new Date(attrs.updatedAt) : new Date()
    }
  }
}

export function createStrapiArticlesRepository(): IArticlesRepository {
  const strapiClient = createStrapiClient()
  // Dynamic import to avoid circular dependencies
  const createCache = (ttl: number) => {
    const { createInMemoryCache } = require('../cache')
    return createInMemoryCache<Article[]>({ defaultTtl: ttl })
  }
  return new StrapiArticlesRepository(strapiClient, createCache)
}
