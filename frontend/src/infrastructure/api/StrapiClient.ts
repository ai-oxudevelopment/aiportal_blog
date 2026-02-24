// StrapiClient for working with Strapi API
// Universal client with response normalization

import type { StrapiQueryParams } from '~/types/api'

interface StrapiConfig {
  url: string
  apiKey?: string
  version: 'v4' | 'v5'
}

interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface StrapiError {
  error: {
    status: number
    name: string
    message: string
  }
}

/**
 * Generic Strapi data item (v4 format with attributes)
 */
interface StrapiItem<T> {
  id: string | number
  attributes?: T
}

export class StrapiClient {
  constructor(private config: StrapiConfig) {}

  async get<T>(endpoint: string, params?: StrapiQueryParams): Promise<T[]> {
    const url = new URL(endpoint, this.config.url)

    // Add query params
    if (params) {
      // Strapi specific params
      if (params.populate) {
        if (Array.isArray(params.populate)) {
          url.searchParams.set('populate', params.populate.join(','))
        } else {
          url.searchParams.set('populate', params.populate)
        }
      }
      if (params.filters) {
        // Strapi v5 filters format
        url.searchParams.set('filters', JSON.stringify(params.filters))
      }
      if (params.sort) {
        url.searchParams.set('sort', params.sort)
      }
      if (params.pagination) {
        url.searchParams.set('pagination', JSON.stringify(params.pagination))
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const response = await fetch(url.toString(), { headers })

    if (!response.ok) {
      const error: StrapiError = await response.json()
      throw new Error(`Strapi error: ${error.error.message}`)
    }

    const json: StrapiResponse<T[]> = await response.json()

    // Normalize Strapi response
    return this.normalizeData(json.data)
  }

  async getOne<T>(endpoint: string, id: string | number): Promise<T | null> {
    const url = new URL(`${endpoint}/${id}`, this.config.url)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const response = await fetch(url.toString(), { headers })

    if (response.status === 404) return null
    if (!response.ok) {
      const error: StrapiError = await response.json()
      throw new Error(`Strapi error: ${error.error.message}`)
    }

    const json: StrapiResponse<T> = await response.json()
    return this.normalizeData(json.data)
  }

  private normalizeData<T>(data: T | T[]): T {
    // Strapi v5 returns data directly, v4 wraps in attributes
    if (this.config.version === 'v5') {
      return data as T
    }

    // v4 normalization
    if (Array.isArray(data)) {
      return data.map(item => this.normalizeItem(item)) as T
    }
    return this.normalizeItem(data) as T
  }

  private normalizeItem<T>(item: StrapiItem<T> | T): T {
    // Check if this is a v4 format item with attributes
    if (typeof item === 'object' && item !== null && 'attributes' in item) {
      const strapiItem = item as StrapiItem<T>
      return {
        id: strapiItem.id,
        ...(strapiItem.attributes as T)
      }
    }
    return item as T
  }
}

export function createStrapiClient(config?: Partial<StrapiConfig>): StrapiClient {
  return new StrapiClient({
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    apiKey: process.env.STRAPI_API_KEY,
    version: 'v5',
    ...config
  })
}
