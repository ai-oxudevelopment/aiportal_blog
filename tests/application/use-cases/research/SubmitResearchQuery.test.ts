import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubmitResearchQuery } from '@/application/use-cases/research/SubmitResearchQuery'
import type { IResearchRepository } from '@/domain/repositories'
import type { AIClient } from '@/application/use-cases/research/AIClient'
import type { ResearchSession } from '@/domain/entities'

describe('SubmitResearchQuery', () => {
  let useCase: SubmitResearchQuery
  let mockRepo: IResearchRepository
  let mockAIClient: AIClient

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
      createSession: vi.fn(),
      addMessage: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn().mockResolvedValue(mockSession),
      updateStatus: vi.fn().mockResolvedValue(undefined)
    }

    // Mock AI client
    mockAIClient = {
      chat: vi.fn().mockResolvedValue({
        content: 'This is a test response',
        finishReason: 'stop'
      })
    }

    useCase = new SubmitResearchQuery(mockRepo, mockAIClient)
  })

  it('should submit query successfully', async () => {
    const result = await useCase.execute({
      sessionId: '123',
      query: 'What is AI?'
    })

    expect(result.userMessage).toBeDefined()
    expect(result.userMessage.content).toBe('What is AI?')
    expect(result.userMessage.role).toBe('user')
    expect(result.assistantMessage.content).toBe('This is a test response')
    expect(result.isComplete).toBe(true)
  })

  it('should throw error for empty query', async () => {
    await expect(useCase.execute({
      sessionId: '123',
      query: ''
    })).rejects.toThrow('Query cannot be empty')
  })

  it('should throw error for whitespace-only query', async () => {
    await expect(useCase.execute({
      sessionId: '123',
      query: '   '
    })).rejects.toThrow('Query cannot be empty')
  })

  it('should throw error when session not found', async () => {
    vi.mocked(mockRepo.getSession).mockResolvedValueOnce(null)

    await expect(useCase.execute({
      sessionId: '123',
      query: 'Test query'
    })).rejects.toThrow('Session not found')
  })

  it('should throw error when session is not active', async () => {
    const completedSession = { ...mockSession, status: 'completed' as const }
    vi.mocked(mockRepo.getSession).mockResolvedValueOnce(completedSession)

    await expect(useCase.execute({
      sessionId: '123',
      query: 'Test query'
    })).rejects.toThrow('Session is not active')
  })

  it('should add both user and assistant messages', async () => {
    await useCase.execute({
      sessionId: '123',
      query: 'Hello'
    })

    expect(mockRepo.addMessage).toHaveBeenCalledTimes(2)
    expect(mockRepo.addMessage).toHaveBeenNthCalledWith(1, '123', {
      role: 'user',
      content: 'Hello'
    })
    expect(mockRepo.addMessage).toHaveBeenNthCalledWith(2, '123', {
      role: 'assistant',
      content: 'This is a test response'
    })
  })

  it('should call AI client with platform and messages', async () => {
    mockSession.messages = [
      {
        id: '1',
        role: 'user',
        content: 'Previous message',
        timestamp: new Date()
      }
    ]

    await useCase.execute({
      sessionId: '123',
      query: 'New message'
    })

    expect(mockAIClient.chat).toHaveBeenCalledWith({
      platform: 'claude',
      messages: [
        { role: 'user', content: 'Previous message' },
        { role: 'user', content: 'New message' }
      ]
    })
  })

  it('should update session status when complete', async () => {
    await useCase.execute({
      sessionId: '123',
      query: 'Test'
    })

    expect(mockRepo.updateStatus).toHaveBeenCalledWith('123', 'completed')
  })

  it('should not update status when not complete', async () => {
    vi.mocked(mockAIClient.chat).mockResolvedValueOnce({
      content: 'Response',
      finishReason: 'length'
    })

    await useCase.execute({
      sessionId: '123',
      query: 'Test'
    })

    expect(mockRepo.updateStatus).not.toHaveBeenCalled()
  })
})
