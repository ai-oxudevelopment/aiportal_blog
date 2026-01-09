/**
 * Offline Status Composable
 *
 * Tracks online/offline status using navigator.onLine and network events
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useOfflineStatus = () => {
  const isOnline = ref(true)
  const wasOffline = ref(false)

  // Computed properties
  const isOffline = computed(() => !isOnline.value)
  const statusMessage = computed(() => {
    if (isOnline.value) {
      return wasOffline.value ? 'Соединение восстановлено' : 'Онлайн'
    }
    return 'Нет подключения к интернету'
  })

  // Handle online event
  const handleOnline = () => {
    wasOffline.value = !isOnline.value
    isOnline.value = true

    // Show notification when connection is restored
    if (wasOffline.value && import.meta.client) {
      console.log('Connection restored')
    }
  }

  // Handle offline event
  const handleOffline = () => {
    isOnline.value = false
    console.log('Connection lost')
  }

  // Check current status
  const checkStatus = () => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
    }
  }

  // Retry connection (forces a recheck)
  const retry = async () => {
    if (import.meta.client) {
      // Try to fetch a lightweight resource to verify connectivity
      try {
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-cache'
        })
        isOnline.value = response.ok
        if (isOnline.value) {
          wasOffline.value = !isOnline.value
        }
      } catch (error) {
        isOnline.value = false
      }
    }
  }

  onMounted(() => {
    checkStatus()

    if (import.meta.client) {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  return {
    isOnline,
    isOffline,
    statusMessage,
    wasOffline,
    checkStatus,
    retry
  }
}
