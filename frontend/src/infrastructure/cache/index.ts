// Cache exports
export { InMemoryCacheProvider } from './InMemoryCacheProvider'

export function createInMemoryCache<T>(
  options?: { defaultTtl?: number; maxEntries?: number }
): ICacheProvider<T> {
  const { InMemoryCacheProvider } = require('./InMemoryCacheProvider')
  return new InMemoryCacheProvider<T>(options)
}
