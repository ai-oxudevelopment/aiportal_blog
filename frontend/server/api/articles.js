export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Build the Strapi API URL
  const strapiUrl = process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'
  const apiUrl = new URL('/api/articles', strapiUrl)
  
  // Add basic query parameters with proper handling
  const fields = ['title', 'description', 'slug']
  fields.forEach((field, index) => {
    apiUrl.searchParams.append(`fields[${index}]`, field)
  })
  
  // Add populate parameter
  apiUrl.searchParams.append('populate[0]', 'categories')
  
  // Add pagination to get more items
  apiUrl.searchParams.append('pagination[pageSize]', '100')
  
  try {
    console.log('Fetching from Strapi:', apiUrl.toString())
    
    const response = await $fetch(apiUrl.toString())
    
    console.log(`Successfully fetched ${response.data?.length || 0} articles from Strapi`)
    if (response.data && response.data.length > 0) {
      console.log('Sample article:', response.data[0])
    }
    
    return response
  } catch (error) {
    console.error('Error fetching from Strapi:', error)
    console.error('Full error:', error.message, error.statusCode)
    
    // Return error response
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch articles from Strapi'
    })
  }
})