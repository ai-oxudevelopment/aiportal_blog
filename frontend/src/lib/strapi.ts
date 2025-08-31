// Strapi API configuration using fetch
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Helper function to make API requests
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Helper function to get published content
export const getPublishedContent = async (contentType: string, params?: any) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add publication state
    queryParams.append('publicationState', 'live');
    
    // Add pagination
    if (params?.pagination) {
      Object.entries(params.pagination).forEach(([key, value]) => {
        queryParams.append(`pagination[${key}]`, String(value));
      });
    }
    
    // Add sorting
    if (params?.sort) {
      if (Array.isArray(params.sort)) {
        params.sort.forEach((sort: string) => {
          queryParams.append('sort', sort);
        });
      } else {
        queryParams.append('sort', params.sort);
      }
    }
    
    // Add populate
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }
    
    // Add filters
    if (params?.filters) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const response = await makeRequest(`/${contentType}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
};

// Helper function to get a single published item
export const getPublishedItem = async (contentType: string, id: string | number, params?: any) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add publication state
    queryParams.append('publicationState', 'live');
    
    // Add populate
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeRequest(`/${contentType}/${id}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType} with id ${id}:`, error);
    throw error;
  }
};

// Helper function to get content by slug
export const getContentBySlug = async (contentType: string, slug: string, params?: any) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add publication state
    queryParams.append('publicationState', 'live');
    
    // Add slug filter
    queryParams.append('filters[slug][$eq]', slug);
    
    // Add populate
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeRequest(`/${contentType}?${queryParams.toString()}`);
    return response.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching ${contentType} with slug ${slug}:`, error);
    throw error;
  }
};

// Export a simple client object for compatibility
const strapiClient = {
  find: getPublishedContent,
  findOne: getPublishedItem,
};

export default strapiClient;
