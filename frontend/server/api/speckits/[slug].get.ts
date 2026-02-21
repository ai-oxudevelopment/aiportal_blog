// Speckit Detail API Route using Clean Architecture
// Server-side API endpoint that uses the new architecture

import { GetSpeckitDetail } from '~/application/use-cases'
import { createStrapiArticlesRepository } from '~/infrastructure/repositories'

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params || {}

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  try {
    // Execute use case
    const articlesRepo = createStrapiArticlesRepository()
    const useCase = new GetSpeckitDetail(articlesRepo)
    const result = await useCase.execute({ slug })

    return {
      data: result.speckit,
      related: result.relatedSpeckits
    }
  } catch (error: any) {
    if (error.message === 'Speckit not found') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Speckit not found'
      })
    }

    console.error('[speckits/[slug].get] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch speckit'
    })
  }
})
