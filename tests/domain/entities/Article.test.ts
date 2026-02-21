import { describe, it, expect } from 'vitest'
import { createArticleId } from '@/domain/entities'

describe('ArticleId', () => {
  it('should create valid ArticleId', () => {
    const id = createArticleId(1)
    expect(id).toBe(1)
  })

  it('should throw error for non-positive ID', () => {
    expect(() => createArticleId(0)).toThrow('Invalid ArticleId')
    expect(() => createArticleId(-1)).toThrow('Invalid ArticleId')
  })
})
