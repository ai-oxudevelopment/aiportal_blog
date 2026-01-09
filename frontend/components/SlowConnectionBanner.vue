<template>
  <!-- Banner shows on slow connections during data loading -->
  <div v-if="isSlowConnection && showBanner" class="slow-connection-banner">
    <div class="slow-connection-banner__content">
      <div class="slow-connection-banner__icon">📶</div>
      <p class="slow-connection-banner__text">
        Загрузка на медленном соединении... Пожалуйста, подождите
      </p>
      <p class="slow-connection-banner__text-sub">
        Loading on slow connection... Please wait
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SlowConnectionBanner Component
 *
 * Shows a loading indicator on slow network connections (2G, EDGE).
 * This manages user expectations and prevents confusion when pages take longer to load.
 *
 * Usage:
 * ```vue
 * <script setup>
 * const { data, pending } = await useAsyncData('articles', () => $fetch('/api/articles'))
 * </script>
 *
 * <template>
 *   <SlowConnectionBanner :pending="pending" />
 *   <div v-if="!pending">{{ data }}</div>
 * </template>
 * ```
 */

import { computed } from 'vue'
import { useNetworkDetection } from '~/composables/useNetworkDetection'

interface Props {
  /**
   * Whether data is currently loading
   * Pass the `pending` ref from useAsyncData/useFetch
   */
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pending: false
})

// Get network detection state
const { isSlowConnection } = useNetworkDetection()

// Only show banner when both slow connection AND pending
const showBanner = computed(() => props.pending)
</script>

<style scoped>
.slow-connection-banner {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-bottom: 2px solid #e91e63;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: pulse 2s ease-in-out infinite;
}

.slow-connection-banner__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.slow-connection-banner__icon {
  font-size: 1.5rem;
  line-height: 1;
  animation: signal 1.5s ease-in-out infinite;
}

.slow-connection-banner__text {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
}

.slow-connection-banner__text-sub {
  color: #fce4ec;
  font-size: 0.875rem;
  margin: 0;
  font-style: italic;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes signal {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .slow-connection-banner {
    background: linear-gradient(135deg, #c084fc 0%, #f5576c 100%);
    border-bottom-color: #a855f7;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .slow-connection-banner {
    padding: 0.75rem;
  }

  .slow-connection-banner__content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .slow-connection-banner__icon {
    font-size: 1.25rem;
  }

  .slow-connection-banner__text {
    font-size: 0.875rem;
  }

  .slow-connection-banner__text-sub {
    font-size: 0.75rem;
  }
}
</style>
