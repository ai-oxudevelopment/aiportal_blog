export default defineEventHandler(async (event) => {
  const { slug } = event.context.params || {}

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  const strapiUrl = process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'
  const apiUrl = new URL('/api/articles', strapiUrl)

  // Filter by slug
  apiUrl.searchParams.append('filters[slug][$eq]', slug)

  // Filter by type="speckit"
  apiUrl.searchParams.append('filters[type][$eq]', 'speckit')

  // Populate categories, body, file and diagram (don't use fields[] to get proper structure)
  apiUrl.searchParams.append('populate', 'categories')
  apiUrl.searchParams.append('populate', 'body')
  apiUrl.searchParams.append('populate[file]', '*')
  apiUrl.searchParams.append('populate', 'diagram')

  try {
    console.log(`[speckits/[slug].get] Fetching speckit with slug="${slug}" from Strapi`)
    console.log(`[speckits/[slug].get] URL: ${apiUrl.toString()}`)

    let response
    try {
      response = await $fetch(apiUrl.toString())
    } catch (fetchError: any) {
      // If populate fields don't exist, try without them
      if (fetchError.statusCode === 400) {
        console.log(`[speckits/[slug].get] Populate fields might not exist, trying with wildcard populate...`)
        const fallbackUrl = new URL('/api/articles', strapiUrl)
        fallbackUrl.searchParams.append('filters[slug][$eq]', slug)
        fallbackUrl.searchParams.append('filters[type][$eq]', 'speckit')
        fallbackUrl.searchParams.append('populate', '*')
        response = await $fetch(fallbackUrl.toString())
      } else {
        throw fetchError
      }
    }

    console.log(`[speckits/[slug].get] Raw response:`, JSON.stringify(response, null, 2))

    if (!response.data || response.data.length === 0) {
      console.log(`[speckits/[slug].get] No speckit found with slug="${slug}"`)

      throw createError({
        statusCode: 404,
        statusMessage: 'Speckit not found'
      })
    }

    const item = response.data[0]

    // Handle both flat format (Strapi v5 with fields) and nested format (Strapi v4/v5 without fields)
    const attrs = item.attributes || item

    console.log(`[speckits/[slug].get] Successfully fetched speckit: ${attrs.title}`)

    // Handle categories in both formats
    const categoriesData = attrs.categories?.data || attrs.categories || []
    const categories = categoriesData.map((cat: any) => ({
      id: cat.id,
      name: cat.attributes?.name || cat.name
    }))

    // Handle file upload (check multiple possible paths)
    let fileData = attrs.file?.data || attrs.file
    // Also check if file is nested under attributes
    if (!fileData && item.attributes?.file) {
      fileData = item.attributes.file.data || item.attributes.file
    }
    // Also check direct nested structure
    if (!fileData && item.file?.data) {
      fileData = item.file.data
    }

    const fileInfo = fileData ? {
      url: fileData.attributes?.url || fileData.url,
      name: fileData.attributes?.name || fileData.name || fileData.attributes?.alternativeText || 'download',
      size: fileData.attributes?.size || fileData.size
    } : null

    console.log(`[speckits/[slug].get] File info:`, fileInfo)
    console.log(`[speckits/[slug].get] File data raw:`, JSON.stringify(fileData || 'null', null, 2))

    // Normalize response to SpeckitFull format
    const normalizedData = {
      id: String(item.id),
      title: attrs.title,
      slug: attrs.slug,
      description: attrs.description,
      type: 'speckit',
      categories: categories,
      body: attrs.body || '',
      file: fileInfo,
      diagram: attrs.diagram || null
    }

    console.log(`[speckits/[slug].get] Normalized data:`, JSON.stringify(normalizedData, null, 2))

    return {
      data: normalizedData
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error
    }

    console.error(`[speckits/[slug].get] Error fetching speckit with slug="${slug}":`, error)
    console.error('[speckits/[slug].get] Full error:', error.message, error.statusCode)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Не удалось загрузить speckit. Попробуйте позже.'
    })
  }
})
