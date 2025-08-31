// Server-side API utilities for SSR/SSG data fetching
import type {
  Article,
  Category,
  Section,
  Collection,
  Author,
  Tag,
} from './types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Server-side request function
const makeServerRequest = async (endpoint: string, options: RequestInit = {}) => {
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
    // Ensure fresh data for SSR
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Server-side content fetching with proper error handling
export const getServerArticles = async (params?: any): Promise<Article[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    queryParams.append('publicationState', 'live');
    
    if (params?.pagination) {
      Object.entries(params.pagination).forEach(([key, value]) => {
        queryParams.append(`pagination[${key}]`, String(value));
      });
    }
    
    if (params?.sort) {
      if (Array.isArray(params.sort)) {
        params.sort.forEach((sort: string) => {
          queryParams.append('sort', sort);
        });
      } else {
        queryParams.append('sort', params.sort);
      }
    }
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }
    
    if (params?.filters) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const response = await makeServerRequest(`/articles?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching articles on server:', error);
    return [];
  }
};

export const getServerArticle = async (id: string | number, params?: any): Promise<Article | null> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/articles/${id}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article ${id} on server:`, error);
    return null;
  }
};

export const getServerArticleBySlug = async (slug: string, params?: any): Promise<Article | null> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    queryParams.append('filters[slug][$eq]', slug);
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/articles?${queryParams.toString()}`);
    return response.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching article by slug ${slug} on server:`, error);
    return null;
  }
};

export const getServerCategories = async (params?: any): Promise<Category[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/categories?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories on server:', error);
    return [];
  }
};

export const getServerCategoryBySlug = async (slug: string, params?: any): Promise<Category | null> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    queryParams.append('filters[slug][$eq]', slug);
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/categories?${queryParams.toString()}`);
    return response.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching category by slug ${slug} on server:`, error);
    return null;
  }
};

export const getServerSections = async (params?: any): Promise<Section[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/sections?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sections on server:', error);
    return [];
  }
};

export const getServerSectionBySlug = async (slug: string, params?: any): Promise<Section | null> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    queryParams.append('filters[slug][$eq]', slug);
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/sections?${queryParams.toString()}`);
    return response.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching section by slug ${slug} on server:`, error);
    return null;
  }
};

export const getServerAuthors = async (params?: any): Promise<Author[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/authors?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching authors on server:', error);
    return [];
  }
};

export const getServerAuthorBySlug = async (slug: string, params?: any): Promise<Author | null> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    queryParams.append('filters[slug][$eq]', slug);
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/authors?${queryParams.toString()}`);
    return response.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching author by slug ${slug} on server:`, error);
    return null;
  }
};

export const getServerTags = async (params?: any): Promise<Tag[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/tags?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tags on server:', error);
    return [];
  }
};

// Server-side search function
export const searchServerArticles = async (query: string, params?: any): Promise<Article[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publicationState', 'live');
    queryParams.append('filters[$or][0][title][$containsi]', query);
    queryParams.append('filters[$or][1][content][$containsi]', query);
    queryParams.append('filters[$or][2][excerpt][$containsi]', query);
    
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeServerRequest(`/articles?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error searching articles on server:', error);
    return [];
  }
};

// Utility function to get image URL for server-side rendering
export const getServerImageUrl = (image: any, format: string = 'medium'): string => {
  if (!image?.data?.attributes) return '';
  
  const { url, formats } = image.data.attributes;
  
  if (formats && formats[format]) {
    return `${STRAPI_URL}${formats[format].url}`;
  }
  
  return `${STRAPI_URL}${url}`;
};
