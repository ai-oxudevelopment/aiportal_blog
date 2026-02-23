<!-- Presentation Layer: Research Page -->
<!-- This is a UI-only component that uses the useResearchChat composable -->

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchChat } from '@/presentation/composables/useResearchChat'

const route = useRoute()
const searchId = route.params.searchId as string

// Extract platform from searchId or default to perplexity
// Format: searchId could be like 'claude-research-123' or just '123'
const getPlatformFromSearchId = (id: string): 'openai' | 'claude' | 'perplexity' => {
  const lowerId = id.toLowerCase()
  if (lowerId.includes('openai')) return 'openai'
  if (lowerId.includes('claude')) return 'claude'
  return 'perplexity' // default
}

const platform = getPlatformFromSearchId(searchId)

// Use the research chat composable
const {
  session,
  isLoading,
  error,
  messages,
  createSession,
  submitQuery,
  reset
} = useResearchChat(platform)

// Local state for the input
const query = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Create or load session on mount
onMounted(async () => {
  try {
    await createSession()
  } catch (e) {
    console.error('Failed to create research session:', e)
  }
})

// Scroll to bottom when new messages arrive
watch(messages, () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })

const handleSubmit = async (): Promise<void> => {
  if (!query.value.trim() || isLoading.value) {
    return
  }

  const currentQuery = query.value
  query.value = '' // Clear input immediately for better UX

  try {
    await submitQuery(currentQuery)
  } catch (e) {
    // Error is already set in the composable
    console.error('Failed to submit query:', e)
  }
}

const handleReset = (): void => {
  reset()
  query.value = ''
}

// Format timestamp for display
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="research-container">
    <!-- Header -->
    <div class="research-header">
      <h1>AI Research Assistant</h1>
      <p class="platform-badge">
        Powered by {{ platform.charAt(0).toUpperCase() + platform.slice(1) }}
      </p>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="messages-container"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', `message-${msg.role}`]"
      >
        <div class="message-header">
          <span class="message-role">{{ msg.role === 'user' ? 'You' : platform }}</span>
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
        <div class="message-content">
          {{ msg.content }}
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="message message-assistant">
        <div class="message-header">
          <span class="message-role">{{ platform }}</span>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="messages.length === 0 && !isLoading" class="empty-state">
        <p>Start a conversation with {{ platform }}...</p>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
      <button @click="error = null" class="error-dismiss">×</button>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="handleSubmit" class="input-form">
      <input
        v-model="query"
        type="text"
        class="query-input"
        placeholder="Ask anything..."
        :disabled="isLoading"
        autocomplete="off"
      />
      <button
        type="submit"
        class="submit-button"
        :disabled="isLoading || !query.trim()"
        :class="{ 'loading': isLoading }"
      >
        <span v-if="!isLoading">Send</span>
        <span v-else>...</span>
      </button>
      <button
        type="button"
        @click="handleReset"
        class="reset-button"
        :disabled="isLoading"
        title="Start new conversation"
      >
        ↻
      </button>
    </form>

    <!-- Session Info -->
    <div v-if="session" class="session-info">
      <span class="session-id">Session: {{ session.id.slice(0, 8) }}...</span>
      <span :class="['status-badge', `status-${session.status}`]">
        {{ session.status }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.research-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  background: #f5f5f5;
}

.research-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e0e0e0;
}

.research-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.platform-badge {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.message {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  background: #e3f2fd;
  margin-left: 2rem;
}

.message-assistant {
  background: #f3e5f5;
  margin-right: 2rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #666;
}

.message-role {
  font-weight: 600;
  text-transform: uppercase;
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.error-dismiss {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #c62828;
}

.input-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0 0 8px 8px;
}

.query-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.query-input:focus {
  border-color: #667eea;
}

.query-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.submit-button,
.reset-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-button {
  padding: 0.75rem;
  background: #f5f5f5;
  color: #666;
}

.reset-button:hover:not(:disabled) {
  background: #e0e0e0;
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: #666;
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.status-active {
  background: #c8e6c9;
  color: #2e7d32;
}

.status-completed {
  background: #e1f5fe;
  color: #0277bd;
}

.status-error {
  background: #ffebee;
  color: #c62828;
}

/* Responsive */
@media (max-width: 768px) {
  .research-container {
    padding: 0.5rem;
  }

  .message-user {
    margin-left: 0.5rem;
  }

  .message-assistant {
    margin-right: 0.5rem;
  }

  .input-form {
    flex-wrap: wrap;
  }

  .submit-button {
    flex: 1;
  }
}
</style>
