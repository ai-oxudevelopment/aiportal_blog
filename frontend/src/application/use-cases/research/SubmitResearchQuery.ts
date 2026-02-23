// Application Layer: SubmitResearchQuery Use Case
// Handles submitting queries to AI and managing the research session

import type { IResearchRepository } from '@/domain/repositories'
import type { ResearchMessage, SessionStatus } from '@/domain/entities'
import type { AIClient } from './AIClient'

export interface SubmitResearchQueryRequest {
  sessionId: string
  query: string
}

export interface SubmitResearchQueryResponse {
  userMessage: ResearchMessage
  assistantMessage: ResearchMessage
  isComplete: boolean
}

/**
 * Use case for submitting a research query to an AI platform.
 * Orchestrates the flow: validate -> save user message -> get AI response -> save assistant response
 */
export class SubmitResearchQuery {
  constructor(
    private researchRepo: IResearchRepository,
    private aiClient: AIClient
  ) {}

  async execute(
    request: SubmitResearchQueryRequest
  ): Promise<SubmitResearchQueryResponse> {
    // Validate input
    if (!request.query?.trim()) {
      throw new Error('Query cannot be empty')
    }

    // Get session to validate state
    const session = await this.researchRepo.getSession(request.sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status !== 'active') {
      throw new Error(
        `Session is not active. Current status: ${session.status}`
      )
    }

    // Create user message object
    const userMessage: ResearchMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: request.query,
      timestamp: new Date()
    }

    // Add user message to session
    await this.researchRepo.addMessage(request.sessionId, {
      role: userMessage.role,
      content: userMessage.content
    })

    // Get AI response
    const response = await this.aiClient.chat({
      platform: session.platform,
      messages: [
        ...session.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        {
          role: 'user',
          content: request.query
        }
      ]
    })

    // Create assistant message object
    const assistantMessage: ResearchMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date()
    }

    // Add assistant message to session
    await this.researchRepo.addMessage(request.sessionId, {
      role: assistantMessage.role,
      content: assistantMessage.content
    })

    // Update session status if conversation is complete
    const isComplete = response.finishReason === 'stop'

    if (isComplete) {
      await this.researchRepo.updateStatus(request.sessionId, 'completed')
    }

    return {
      userMessage,
      assistantMessage,
      isComplete
    }
  }
}
