import { describe, it, expect } from 'vitest'
import { createResearchMessage } from '@/domain/entities'

describe('ResearchMessage', () => {
  it('should create valid user message', () => {
    const msg = createResearchMessage('user', 'Hello AI')

    expect(msg.id).toBeDefined()
    expect(typeof msg.id).toBe('string')
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Hello AI')
    expect(msg.timestamp).toBeInstanceOf(Date)
  })

  it('should create valid assistant message', () => {
    const msg = createResearchMessage('assistant', 'Hello human')

    expect(msg.id).toBeDefined()
    expect(msg.role).toBe('assistant')
    expect(msg.content).toBe('Hello human')
    expect(msg.timestamp).toBeInstanceOf(Date)
  })

  it('should create unique IDs for each message', () => {
    const msg1 = createResearchMessage('user', 'First')
    const msg2 = createResearchMessage('user', 'Second')

    expect(msg1.id).not.toBe(msg2.id)
  })

  it('should create system messages', () => {
    const msg = createResearchMessage('system', 'You are a helpful assistant')

    expect(msg.role).toBe('system')
    expect(msg.content).toBe('You are a helpful assistant')
  })
})
