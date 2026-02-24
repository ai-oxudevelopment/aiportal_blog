// Infrastructure Layer: Repository Factories
// Factory functions for creating repository instances

import { StrapiResearchRepository } from './StrapiResearchRepository'
import { StrapiArticlesRepository, createStrapiArticlesRepository } from './StrapiArticlesRepository'
import type { IResearchRepository } from '@/domain/repositories'

/**
 * Creates a Strapi-backed Research repository instance
 * @param strapiUrl - The Strapi CMS URL (defaults to runtime config)
 * @param apiKey - The Strapi API key (defaults to env variable or empty string)
 */
export function createStrapiResearchRepository(
  strapiUrl?: string,
  apiKey?: string
): IResearchRepository {
  // Use runtime config if strapiUrl not provided
  const url = strapiUrl || useRuntimeConfig().public.strapiUrl
  const key = apiKey || process.env.STRAPI_API_KEY || ''

  return new StrapiResearchRepository(url, key)
}

// Export repository classes for testing
export { StrapiResearchRepository }

// Repository exports
export { StrapiArticlesRepository, createStrapiArticlesRepository } from './StrapiArticlesRepository'
