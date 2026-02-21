// Speckits API Route using Clean Architecture
// Server-side API endpoint that uses the new architecture

import { GetSpeckitList } from '~/application/use-cases'
import { createStrapiArticlesRepository } from '~/infrastructure/repositories'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // Build request from query params
    const request = {
      category: query.category as string | undefined,
      search: query.search as string | undefined,
      offset: query.offset ? Number(query.offset) : undefined,
      limit: query.limit ? Number(query.limit) : undefined
    }

    // Execute use case
    const articlesRepo = createStrapiArticlesRepository()
    const useCase = new GetSpeckitList(articlesRepo)
    const result = await useCase.execute(request)

    return {
      data: result.speckits,
      meta: {
        total: result.total,
        hasMore: result.hasMore
      }
    }
  } catch (error: any) {
    console.error('[speckits.get] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch speckits'
    })
  }
})
