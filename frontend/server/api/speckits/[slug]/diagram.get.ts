// Speckit Diagram API Route using Clean Architecture
// Server-side API endpoint for fetching speckit diagram data

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
    // Get speckit to access diagram data
    const articlesRepo = createStrapiArticlesRepository()
    const speckit = await articlesRepo.findBySlug(slug)

    if (!speckit || speckit.type !== 'speckit') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Speckit not found'
      })
    }

    if (!speckit.diagram) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Diagram not found for this speckit'
      })
    }

    return {
      data: {
        format: speckit.diagram.format,
        content: speckit.diagram.content
      }
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error
    }

    console.error('[speckits/[slug]/diagram.get] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch diagram'
    })
  }
})
