<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { getLogger } from '~/infrastructure/logging'
import { getUserFriendlyMessage } from '~/server/error-handler'

interface Props {
  fallback?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallback: 'Something went wrong.',
  showDetails: false,
})

const emit = defineEmits<{
  error: [error: Error]
}>()

const error = ref<Error | null>(null)
const logger = getLogger()

onErrorCaptured((err: Error) => {
  logger.error('ErrorBoundary caught error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    component: 'ErrorBoundary',
  })

  error.value = err
  emit('error', err)

  // Return false to prevent error from propagating further
  return false
})

function retry() {
  error.value = null
}

const userMessage = computed(() => {
  if (error.value) {
    return getUserFriendlyMessage(error.value)
  }
  return null
})
</script>

<template>
  <div v-if="error" class="error-boundary" role="alert" aria-live="assertive">
    <div class="error-icon">⚠️</div>
    <h3>{{ userMessage?.title || fallback }}</h3>
    <p>{{ userMessage?.message || error.message }}</p>
    <p v-if="showDetails && error.message">{{ error.message }}</p>
    <button v-if="userMessage?.canRetry" @click="retry" class="retry-button" type="button">
      Try Again
    </button>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  padding: 2rem;
  text-align: center;
  border: 1px solid #ef4444;
  border-radius: 0.5rem;
  background: #fef2f2;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.retry-button:focus {
  outline: 2px solid #1e40af;
  outline-offset: 2px;
}

.retry-button:focus-visible {
  outline: 2px solid #1e40af;
  outline-offset: 2px;
}
</style>
