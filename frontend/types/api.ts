// API Type Definitions
// Common types for API responses and requests

/**
 * Strapi response wrapper (v4/v5 compatible)
 */
export interface StrapiResponse<T> {
  data: T
  meta?: StrapiMeta
}

export interface StrapiMeta {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

/**
 * Strapi error response
 */
export interface StrapiErrorResponse {
  error: {
    status: number
    name: string
    message: string
    details?: Record<string, unknown>
  }
}

/**
 * API request parameters for Strapi queries
 */
export interface StrapiQueryParams {
  populate?: string | string[]
  filters?: Record<string, unknown>
  sort?: string
  pagination?: {
    page?: number
    pageSize?: number
    start?: number
    limit?: number
  }
  fields?: string[]
}

/**
 * API request parameters for article filtering
 */
export interface ArticleFilters {
  type?: 'speckit' | 'prompt' | 'blog'
  category?: string
  search?: string
  sort?: string
  offset?: number
  limit?: number
}

/**
 * Research session types
 */
export interface ResearchSessionMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface StrapiResearchSession {
  id: string
  documentId: string
  platform: string
  messages: ResearchSessionMessage[]
  status: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

/**
 * Generic API error
 */
export interface ApiError {
  message: string
  statusCode?: number
  code?: string
  details?: Record<string, unknown>
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  )
}

/**
 * Type guard for Strapi errors
 */
export function isStrapiError(error: unknown): error is StrapiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error
  )
}
