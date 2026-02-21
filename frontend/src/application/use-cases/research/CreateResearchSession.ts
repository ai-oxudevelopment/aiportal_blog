// Application Layer: CreateResearchSession Use Case
// Handles the creation of a new AI research session

import type { IResearchRepository } from '@/domain/repositories'
import type { ResearchSession, ResearchPlatform } from '@/domain/entities'

export interface CreateResearchSessionRequest {
  platform: ResearchPlatform
}

export interface CreateResearchSessionResponse {
  session: ResearchSession
  initialMessage?: string
}

/**
 * Use case for creating a new AI research session.
 * This is a pure business logic class that orchestrates the repository
 * and adds domain-specific behavior like welcome messages.
 */
export class CreateResearchSession {
  constructor(
    private researchRepo: IResearchRepository
  ) {}

  async execute(
    request: CreateResearchSessionRequest
  ): Promise<CreateResearchSessionResponse> {
    // Validation
    if (!request.platform) {
      throw new Error('Platform is required')
    }

    const validPlatforms: ResearchPlatform[] = ['openai', 'claude', 'perplexity']
    if (!validPlatforms.includes(request.platform)) {
      throw new Error(
        `Invalid platform: ${request.platform}. Must be one of: ${validPlatforms.join(', ')}`
      )
    }

    // Create session through repository
    const session = await this.researchRepo.createSession(request.platform)

    // Add welcome message for better UX
    const welcomeMessage = this.getWelcomeMessage(request.platform)
    if (welcomeMessage) {
      await this.researchRepo.addMessage(session.id, {
        role: 'assistant',
        content: welcomeMessage
      })

      // Get updated session with the welcome message
      const updatedSession = await this.researchRepo.getSession(session.id)

      return {
        session: updatedSession || session,
        initialMessage: welcomeMessage
      }
    }

    return {
      session,
      initialMessage: undefined
    }
  }

  private getWelcomeMessage(platform: ResearchPlatform): string {
    const messages: Record<ResearchPlatform, string> = {
      openai: 'Hello! I\'m your AI assistant powered by OpenAI. How can I help you today?',
      claude: 'Hi there! I\'m Claude, ready to assist you with your research.',
      perplexity: 'Welcome! I\'m your Perplexity AI assistant. What would you like to explore?'
    }
    return messages[platform]
  }
}
