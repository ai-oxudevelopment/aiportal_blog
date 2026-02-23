// Presentation Layer: useResearchChat Composable
// Vue 3 composable that adapts Research use cases for UI components

import { ref, computed, type Ref } from 'vue'
import type { ResearchPlatform, ResearchSession } from '@/domain/entities'
import { CreateResearchSession } from '@/application/use-cases/research/CreateResearchSession'
import { SubmitResearchQuery } from '@/application/use-cases/research/SubmitResearchQuery'
import { PlaceholderAIClient } from '@/application/use-cases/research/AIClient'
import { createStrapiResearchRepository } from '@/infrastructure/repositories'

export interface UseResearchChatReturn {
  // State
  session: Ref<ResearchSession | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  messages: Ref<ResearchSession['messages']>

  // Actions
  createSession: () => Promise<ResearchSession>
  submitQuery: (query: string) => Promise<void>
  reset: () => void
}

/**
 * Vue 3 composable for AI research chat functionality.
 * Provides reactive state and actions for managing research sessions.
 *
 * @param platform - The AI platform to use (openai, claude, perplexity)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const {
 *   session,
 *   isLoading,
 *   error,
 *   messages,
 *   createSession,
 *   submitQuery
 * } = useResearchChat('claude')
 *
 * onMounted(() => {
 *   createSession()
 * })
 * </script>
 * ```
 */
export function useResearchChat(
  platform: ResearchPlatform
): UseResearchChatReturn {
  // Reactive state
  const session = ref<ResearchSession | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const messages = computed(() => session.value?.messages || [])

  // Initialize use cases with dependencies
  const researchRepo = createStrapiResearchRepository()
  const createSessionUC = new CreateResearchSession(researchRepo)
  const aiClient = new PlaceholderAIClient()
  const submitQueryUC = new SubmitResearchQuery(researchRepo, aiClient)

  /**
   * Creates a new research session
   */
  const createSession = async (): Promise<ResearchSession> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await createSessionUC.execute({ platform })
      session.value = result.session
      return result.session
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create session'
      error.value = errorMessage
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submits a query to the AI and returns the response
   */
  const submitQuery = async (query: string): Promise<void> => {
    if (!session.value) {
      error.value = 'No active session. Please create a session first.'
      throw new Error('No active session')
    }

    if (!query.trim()) {
      error.value = 'Query cannot be empty'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await submitQueryUC.execute({
        sessionId: session.value.id,
        query
      })

      // Refresh session to get updated messages
      const updatedSession = await researchRepo.getSession(session.value.id)
      if (updatedSession) {
        session.value = updatedSession
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to submit query'
      error.value = errorMessage
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resets the composable state
   */
  const reset = (): void => {
    session.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    session: computed(() => session.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    messages,

    // Actions
    createSession,
    submitQuery,
    reset
  }
}
