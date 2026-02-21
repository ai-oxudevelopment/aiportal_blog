// Domain Entity: ResearchSession
// Represents AI chat/research sessions

export interface ResearchSession {
  readonly id: string
  messages: ResearchMessage[]
  platform: ResearchPlatform
  status: SessionStatus
  createdAt: Date
  updatedAt: Date
}

export type ResearchPlatform = 'openai' | 'claude' | 'perplexity'
export type SessionStatus = 'active' | 'completed' | 'error'

export interface ResearchMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

// Factory function for creating research messages
export function createResearchMessage(
  role: ResearchMessage['role'],
  content: string
): ResearchMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date()
  }
}
