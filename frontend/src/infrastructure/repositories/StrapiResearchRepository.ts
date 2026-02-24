// Infrastructure Layer: Research Repository
// Implements IResearchRepository using Strapi CMS as backend

import type {
  IResearchRepository,
  ResearchSession,
  ResearchPlatform
} from '@/domain/repositories'
import type { ResearchMessage, SessionStatus } from '@/domain/entities'
import type { ResearchSessionMessage } from '~/types/api'

/**
 * Strapi message format (partial data from API)
 */
interface StrapiMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string | number
}

interface StrapiResearchResponse {
  data: {
    id: string
    documentId: string
    attributes?: {
      platform: string
      messages: StrapiMessage[]
      status: string
      createdAt: string
      updatedAt: string
      publishedAt: string
    }
    platform: string
    messages: StrapiMessage[]
    status: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

interface StrapiListResponse {
  data: StrapiResearchResponse['data'][]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export class StrapiResearchRepository implements IResearchRepository {
  constructor(
    private strapiUrl: string,
    private apiKey: string
  ) {}

  async createSession(platform: ResearchPlatform): Promise<ResearchSession> {
    const response = await fetch(`${this.strapiUrl}/api/research-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        data: {
          platform,
          status: 'active',
          messages: []
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const json: StrapiResearchResponse = await response.json()
    return this.toDomain(json)
  }

  async addMessage(
    sessionId: string,
    message: Omit<ResearchMessage, 'id' | 'timestamp'>
  ): Promise<void> {
    // First, get the current session to append the message
    const getSessionResponse = await fetch(
      `${this.strapiUrl}/api/research-sessions/${sessionId || sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    )

    if (!getSessionResponse.ok) {
      throw new Error(`Failed to get session: ${getSessionResponse.statusText}`)
    }

    const sessionData: StrapiResearchResponse = await getSessionResponse.json()
    const currentMessages = this.extractMessages(sessionData)

    // Add the new message
    const newMessage = {
      id: crypto.randomUUID(),
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...currentMessages, newMessage]

    // Update the session with the new messages array
    const updateResponse = await fetch(
      `${this.strapiUrl}/api/research-sessions/${sessionId || sessionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          data: {
            messages: updatedMessages
          }
        })
      }
    )

    if (!updateResponse.ok) {
      throw new Error(`Failed to add message: ${updateResponse.statusText}`)
    }
  }

  async getSession(sessionId: string): Promise<ResearchSession | null> {
    const response = await fetch(
      `${this.strapiUrl}/api/research-sessions/${sessionId || sessionId}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    )

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`)
    }

    const json: StrapiResearchResponse = await response.json()
    return this.toDomain(json)
  }

  async updateStatus(sessionId: string, status: SessionStatus): Promise<void> {
    const response = await fetch(
      `${this.strapiUrl}/api/research-sessions/${sessionId || sessionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ data: { status } })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.statusText}`)
    }
  }

  private extractMessages(json: StrapiResearchResponse): StrapiMessage[] {
    // Handle both Strapi v4 and v5 response formats
    if (json.data.attributes) {
      return json.data.attributes.messages || []
    }
    return json.data.messages || []
  }

  private toDomain(json: StrapiResearchResponse): ResearchSession {
    // Handle both Strapi v4 and v5 response formats
    const attrs = json.data.attributes || json.data

    return {
      id: json.data.id,
      messages: (attrs.messages || []).map((m: StrapiMessage): ResearchMessage => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp || Date.now())
      })),
      platform: attrs.platform as ResearchPlatform,
      status: attrs.status as SessionStatus,
      createdAt: new Date(attrs.createdAt || Date.now()),
      updatedAt: new Date(attrs.updatedAt || Date.now())
    }
  }
}
