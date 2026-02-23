import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateResearchSession } from '@/application/use-cases/research/CreateResearchSession'
import type { IResearchRepository } from '@/domain/repositories'
import type { ResearchSession } from '@/domain/entities'

describe('CreateResearchSession', () => {
  let useCase: CreateResearchSession
  let mockRepo: IResearchRepository

  const mockSession: ResearchSession = {
    id: '123',
    messages: [],
    platform: 'claude',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    // Mock repository
    mockRepo = {
      createSession: vi.fn().mockResolvedValue(mockSession),
      addMessage: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn().mockResolvedValue(mockSession),
      updateStatus: vi.fn().mockResolvedValue(undefined)
    }

    useCase = new CreateResearchSession(mockRepo)
  })

  it('should create session with valid platform', async () => {
    const result = await useCase.execute({ platform: 'claude' })

    expect(result.session).toBeDefined()
    expect(result.session.platform).toBe('claude')
    expect(result.initialMessage).toBeDefined()
    expect(mockRepo.createSession).toHaveBeenCalledWith('claude')
  })

  it('should add welcome message for openai', async () => {
    const result = await useCase.execute({ platform: 'openai' })

    expect(result.initialMessage).toContain('OpenAI')
    expect(mockRepo.addMessage).toHaveBeenCalledWith(
      '123',
      { role: 'assistant', content: expect.stringContaining('OpenAI') }
    )
  })

  it('should add welcome message for claude', async () => {
    const result = await useCase.execute({ platform: 'claude' })

    expect(result.initialMessage).toContain('Claude')
    expect(mockRepo.addMessage).toHaveBeenCalledWith(
      '123',
      { role: 'assistant', content: expect.stringContaining('Claude') }
    )
  })

  it('should add welcome message for perplexity', async () => {
    const result = await useCase.execute({ platform: 'perplexity' })

    expect(result.initialMessage).toContain('Perplexity')
    expect(mockRepo.addMessage).toHaveBeenCalledWith(
      '123',
      { role: 'assistant', content: expect.stringContaining('Perplexity') }
    )
  })

  it('should throw error for missing platform', async () => {
    await expect(useCase.execute({ platform: '' as any }))
      .rejects.toThrow('Platform is required')
  })

  it('should throw error for invalid platform', async () => {
    await expect(useCase.execute({ platform: 'invalid' as any }))
      .rejects.toThrow('Invalid platform')
  })

  it('should fetch updated session after adding welcome message', async () => {
    await useCase.execute({ platform: 'claude' })

    expect(mockRepo.getSession).toHaveBeenCalledWith('123')
  })
})
