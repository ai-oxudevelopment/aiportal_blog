// Application Layer: AI Client Abstraction
// Defines the contract for AI platform integrations

export interface AIClient {
  /**
   * Send a chat request to the AI platform
   * @param request - The chat request with platform and messages
   * @returns The AI response with content and finish reason
   */
  chat(request: ChatRequest): Promise<ChatResponse>
}

export interface ChatRequest {
  platform: string
  messages: Array<{ role: string; content: string }>
}

export interface ChatResponse {
  content: string
  finishReason: string
}

/**
 * Placeholder AI client implementation.
 * This should be replaced with actual AI API calls in production.
 * For now, it returns a mock response for development/testing.
 */
export class PlaceholderAIClient implements AIClient {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return a placeholder response
    const responses: Record<string, string> = {
      openai: 'This is a placeholder response from OpenAI. The AI client implementation will be added in a future work package.',
      claude: 'This is a placeholder response from Claude. The AI client implementation will be added in a future work package.',
      perplexity: 'This is a placeholder response from Perplexity. The AI client implementation will be added in a future work package.'
    }

    return {
      content: responses[request.platform] || 'AI response placeholder - implementation pending',
      finishReason: 'stop'
    }
  }
}
