// server/api/speckits/[slug]/diagram.get.ts
/**
 * GET /api/speckits/{slug}/diagram
 * Fetches Mermaid diagram data for a specific Speckit
 */

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params || {}

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Не указан идентификатор Speckit',
      message: 'Slug parameter is required'
    })
  }

  const strapiUrl = process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'
  const apiUrl = new URL('/api/articles', strapiUrl)

  // Filter by slug and type
  apiUrl.searchParams.append('filters[slug][$eq]', slug)
  apiUrl.searchParams.append('filters[type][$eq]', 'speckit')

  // Populate only diagram field
  apiUrl.searchParams.append('fields[0]', 'diagram')

  try {
    console.log(`[api/speckits/${slug}/diagram] Fetching diagram for slug="${slug}"`)

    const response = await $fetch(apiUrl.toString())

    if (!response.data || response.data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Speckit не найден',
        message: `Speckit with slug '${slug}' does not exist`
      })
    }

    const item = response.data[0]
    const attrs = item.attributes || item
    const diagramSource = attrs.diagram || null

    // Validate and return diagram data
    const diagramData = diagramSource
      ? {
          source: diagramSource,
          type: detectDiagramType(diagramSource),
          valid: true
        }
      : null

    console.log(`[api/speckits/${slug}/diagram] Diagram found:`, !!diagramData)

    return {
      data: diagramData
    }
  } catch (error: any) {
    console.error(`[api/speckits/${slug}/diagram] Error:`, error)

    if (error.statusCode === 404) {
      throw error
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Не удалось загрузить диаграмму. Попробуйте позже.',
      message: error.message || 'Internal server error'
    })
  }
})

/**
 * Helper function to detect diagram type from Mermaid source
 */
function detectDiagramType(source: string): string {
  const firstLine = source.split('\n')[0].trim()
  const type = firstLine.split(/\s+/)[0]

  const validTypes = [
    'graph', 'flowchart', 'sequenceDiagram',
    'classDiagram', 'stateDiagram', 'erDiagram',
    'gantt', 'pie', 'mindmap', 'gitGraph'
  ]

  return validTypes.includes(type) ? type : 'flowchart'
}
