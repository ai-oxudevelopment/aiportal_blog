// Speckit File Download API Route using Clean Architecture
// Server-side API endpoint for downloading speckit files

import { DownloadSpeckitFile } from '~/application/use-cases'
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
    // Execute download use case
    const articlesRepo = createStrapiArticlesRepository()
    const useCase = new DownloadSpeckitFile(articlesRepo)
    const result = await useCase.execute({ speckitSlug: slug })

    // Set appropriate headers for file download
    setHeader(event, 'Content-Type', result.mimeType)
    setHeader(event, 'Content-Disposition', `attachment; filename="${result.filename}"`)

    // Return the blob as response
    return result.blob
  } catch (error: any) {
    if (error.message === 'Speckit not found' || error.message === 'Speckit has no file attachment') {
      throw createError({
        statusCode: 404,
        statusMessage: error.message
      })
    }

    console.error('[speckits/[slug]/download.get] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to download file'
    })
  }
})
