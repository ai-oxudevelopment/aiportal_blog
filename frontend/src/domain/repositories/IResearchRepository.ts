// Repository Interface: Research
// Provides access to ResearchSession entities

import type { ResearchSession, ResearchPlatform, SessionStatus } from '../entities'
import type { ResearchMessage } from '../entities'

export interface IResearchRepository {
  createSession(platform: ResearchPlatform): Promise<ResearchSession>
  addMessage(sessionId: string, message: Omit<ResearchMessage, 'id' | 'timestamp'>): Promise<void>
  getSession(sessionId: string): Promise<ResearchSession | null>
  updateStatus(sessionId: string, status: SessionStatus): Promise<void>
}
