// frontend/src/lib/strapi.ts
// Enhanced Strapi API client with improved error handling, caching, and request management

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'отсутствует подключение';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

// Enhanced error types
export class StrapiAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public endpoint: string
  ) {
    super(message);
    this.name = 'StrapiAPIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Request cache for deduplication
const requestCache = new Map<string, Promise<any>>();

// Simple in-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache management
const getCachedData = (key: string): any | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

const setCachedData = (key: string, data: any, ttl: number = CACHE_TTL): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

// Request retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: Error) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    if (error instanceof StrapiAPIError) {
      return error.status >= 500 || error.status === 429; // Server errors or rate limiting
    }
    return error instanceof NetworkError;
  },
};

// Enhanced request function with retry logic and caching
const makeRequest = async (
  endpoint: string, 
  options: RequestInit = {},
  useCache: boolean = true,
  retryConfig: RetryConfig = defaultRetryConfig
) => {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
  
  // Check cache first for GET requests
  if (useCache && (!options.method || options.method === 'GET')) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Check for duplicate requests
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }
  
  const requestPromise = executeRequestWithRetry(url, options, retryConfig);
  requestCache.set(cacheKey, requestPromise);
  
  try {
    const result = await requestPromise;
    
    // Cache successful GET requests
    if (useCache && (!options.method || options.method === 'GET')) {
      setCachedData(cacheKey, result);
    }
    
    return result;
  } finally {
    // Clean up request cache
    requestCache.delete(cacheKey);
  }
};

// Execute request with retry logic
const executeRequestWithRetry = async (
  url: string,
  options: RequestInit,
  retryConfig: RetryConfig,
  attempt: number = 1
): Promise<any> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = new StrapiAPIError(
        `Strapi API error: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        url
      );
      
      // Retry on server errors or rate limiting
      if (attempt < retryConfig.maxRetries && retryConfig.retryCondition(error)) {
        await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay * attempt));
        return executeRequestWithRetry(url, options, retryConfig, attempt + 1);
      }
      
      throw error;
    }

    return response.json();
  } catch (error) {
    const networkError = new NetworkError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : new Error('Unknown error')
    );
    
    // Retry on network errors
    if (attempt < retryConfig.maxRetries && retryConfig.retryCondition(networkError)) {
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay * attempt));
      return executeRequestWithRetry(url, options, retryConfig, attempt + 1);
    }
    
    throw networkError;
  }
};

// Cache management utilities
export const clearCache = (): void => {
  cache.clear();
};

export const clearCacheByPattern = (pattern: string): void => {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
};

export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};

// Enhanced helper function to get published content
export const getPublishedContent = async (
  contentType: string, 
  params?: any,
  options?: { useCache?: boolean; retryConfig?: RetryConfig }
) => {
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

    const response = await makeRequest(
      `/${contentType}?${queryParams.toString()}`,
      {},
      options?.useCache ?? true,
      options?.retryConfig
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
};

// Enhanced helper function to get a single published item
export const getPublishedItem = async (
  contentType: string, 
  id: string | number, 
  params?: any,
  options?: { useCache?: boolean; retryConfig?: RetryConfig }
) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add publication state
    queryParams.append('publicationState', 'live');
    
    // Add populate
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }

    const response = await makeRequest(
      `/${contentType}/${id}?${queryParams.toString()}`,
      {},
      options?.useCache ?? true,
      options?.retryConfig
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType} with id ${id}:`, error);
    throw error;
  }
};

// Enhanced helper function to get content by slug
export const getContentBySlug = async (
  contentType: string, 
  slug: string, 
  params?: any,
  options?: { useCache?: boolean; retryConfig?: RetryConfig }
) => {
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

    const response = await makeRequest(
      `/${contentType}?${queryParams.toString()}`,
      {},
      options?.useCache ?? true,
      options?.retryConfig
    );
    return response.data?.[0] || null;
  } catch (error) {
    console.error(`Error fetching ${contentType} with slug ${slug}:`, error);
    throw error;
  }
};

// Enhanced Strapi client with additional utilities
const strapiClient = {
  find: getPublishedContent,
  findOne: getPublishedItem,
  findBySlug: getContentBySlug,
  clearCache,
  clearCacheByPattern,
  getCacheStats,
  makeRequest,
};

// Export enhanced client and utilities
export default strapiClient;

// Export configuration for external use
export const getStrapiConfig = () => ({
  url: STRAPI_URL,
  hasToken: !!STRAPI_TOKEN,
});

// Export retry configuration for customization
export { defaultRetryConfig, type RetryConfig };
