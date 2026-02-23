// GetSpeckitDetail Use Case
// Use case for fetching detailed information about a speckit

import type { IArticlesRepository } from '@/domain/repositories'
import type { Article } from '@/domain/entities'

export interface GetSpeckitDetailRequest {
  slug: string
}

export interface GetSpeckitDetailResponse {
  speckit: Article
  relatedSpeckits?: Article[]
}

export class GetSpeckitDetail {
  constructor(
    private articlesRepo: IArticlesRepository
  ) {}

  async execute(request: GetSpeckitDetailRequest): Promise<GetSpeckitDetailResponse> {
    // Get speckit by slug
    const speckit = await this.articlesRepo.findBySlug(request.slug)

    if (!speckit || speckit.type !== 'speckit') {
      throw new Error('Speckit not found')
    }

    // Get related speckits from the same category
    const relatedSpeckits = await this.articlesRepo.findAll({
      type: 'speckit',
      category: speckit.category.slug,
      limit: 3
    })

    // Filter out current speckit
    const filtered = relatedSpeckits.filter(s => s.slug !== request.slug).slice(0, 3)

    return {
      speckit,
      relatedSpeckits: filtered.length > 0 ? filtered : undefined
    }
  }
}
