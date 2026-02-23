// GetSpeckitList Use Case
// Use case for fetching a list of speckits with filtering

import type { IArticlesRepository } from '@/domain/repositories'
import type { Article } from '@/domain/entities'

export interface GetSpeckitListRequest {
  category?: string
  search?: string
  offset?: number
  limit?: number
}

export interface GetSpeckitListResponse {
  speckits: Article[]
  total: number
  hasMore: boolean
}

export class GetSpeckitList {
  constructor(
    private articlesRepo: IArticlesRepository
  ) {}

  async execute(request: GetSpeckitListRequest = {}): Promise<GetSpeckitListResponse> {
    // Always filter only speckits
    const filter = {
      type: 'speckit' as const,
      category: request.category,
      search: request.search,
      offset: request.offset,
      limit: request.limit || 20
    }

    const speckits = await this.articlesRepo.findAll(filter)

    return {
      speckits,
      total: speckits.length,
      hasMore: speckits.length === filter.limit
    }
  }
}
