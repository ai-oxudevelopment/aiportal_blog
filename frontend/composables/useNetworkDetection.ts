/**
 * Network Detection Composable
 *
 * Detects slow network connections (2G, EDGE) using the Navigator Connection API.
 * Provides reactive state for UI components to show loading indicators and adjust behavior.
 *
 * Browser Support:
 * - Chrome/Edge: 61+
 * - Firefox: 31+ (mozConnection)
 * - Safari: Not supported (falls back to fast connection)
 *
 * Usage:
 * ```vue
 * <script setup>
 * const { isSlowConnection, connection } = useNetworkDetection()
 * </script>
 *
 * <template>
 *   <div v-if="isSlowConnection">
 *     Loading on slow connection...
 *   </div>
 * </template>
 * ```
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface NetworkInformation {
  effectiveType: string // 'slow-2g', '2g', '3g', '4g'
  downlink: number // MB/s (approximate)
  rtt: number // Round-trip time in ms
  saveData: boolean // User's data saving mode preference
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

/**
 * Composable for detecting slow network connections
 *
 * @returns Object with reactive network state
 */
export function useNetworkDetection() {
  const connection = ref<NetworkInformation | null>(null)

  // Computed property for slow connection detection
  const isSlowConnection = computed(() => {
    if (!connection.value) {
      return false // Default to fast if API not available
    }

    const effectiveType = connection.value.effectiveType
    return effectiveType === 'slow-2g' || effectiveType === '2g'
  })

  // Computed property for very slow connection (< 2G)
  const isVerySlowConnection = computed(() => {
    if (!connection.value) {
      return false
    }

    return connection.value.effectiveType === 'slow-2g'
  })

  // Computed property for data saving mode
  const isDataSavingMode = computed(() => {
    return connection.value?.saveData ?? false
  })

  // Computed property for connection quality description
  const connectionQuality = computed(() => {
    if (!connection.value) {
      return 'Unknown'
    }

    const effectiveType = connection.value.effectiveType
    switch (effectiveType) {
      case 'slow-2g':
        return 'Very Slow (< 50 KB/s)'
      case '2g':
        return 'Slow (50-100 KB/s)'
      case '3g':
        return 'Moderate (400-1000 KB/s)'
      case '4g':
        return 'Fast (> 1 MB/s)'
      default:
        return 'Unknown'
    }
  })

  // Update connection state handler
  const updateConnection = () => {
    if (import.meta.client) {
      const nav = navigator as any
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection
      connection.value = conn || null
    }
  }

  // Set up connection monitoring
  onMounted(() => {
    if (import.meta.client) {
      const nav = navigator as any
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection

      if (conn) {
        connection.value = conn

        // Listen for connection changes
        conn.addEventListener('change', updateConnection)
      }
    }
  })

  // Clean up event listeners
  onUnmounted(() => {
    if (import.meta.client) {
      const nav = navigator as any
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection

      if (conn) {
        conn.removeEventListener('change', updateConnection)
      }
    }
  })

  return {
    connection,
    isSlowConnection,
    isVerySlowConnection,
    isDataSavingMode,
    connectionQuality
  }
}

/**
 * Default export for backward compatibility
 */
export default useNetworkDetection
