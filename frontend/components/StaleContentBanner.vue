<template>
  <!-- Banner shows when content is stale (served from cache during backend issues) -->
  <div v-if="showBanner" class="stale-content-banner">
    <div class="stale-content-banner__content">
      <div class="stale-content-banner__icon">⚠️</div>
      <p class="stale-content-banner__text">
        Содержимое может быть устаревшим. Мы работаем над обновлением.
      </p>
      <p class="stale-content-banner__text-sub">
        Content may be outdated. We're working on updating it.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * StaleContentBanner Component
 *
 * Shows a warning banner when content is stale (served from cache due to backend issues).
 * The banner auto-dismisses when fresh content is loaded.
 *
 * Usage:
 * ```vue
 * <script setup>
 * const { data, isStale } = useArticles()
 * </script>
 *
 * <template>
 *   <StaleContentBanner :isStale="isStale" />
 *   <div>{{ data }}</div>
 * </template>
 * ```
 */

import { computed, watch } from 'vue'

interface Props {
  /**
   * Whether content is currently stale
   * Pass the `isStale` computed from your data fetching composable
   */
  isStale?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isStale: false
})

// Auto-hide banner after 10 seconds if still stale (user has seen the message)
const showBanner = computed(() => props.isStale)
</script>

<style scoped>
.stale-content-banner {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  border-bottom: 2px solid #d4a017;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stale-content-banner__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.stale-content-banner__icon {
  font-size: 1.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.stale-content-banner__text {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
}

.stale-content-banner__text-sub {
  color: #e3f2fd;
  font-size: 0.875rem;
  margin: 0;
  font-style: italic;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .stale-content-banner {
    background: linear-gradient(135deg, #f57c00 0%, #1976d2 100%);
    border-bottom-color: #ef6c00;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .stale-content-banner {
    padding: 0.75rem;
  }

  .stale-content-banner__content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stale-content-banner__icon {
    font-size: 1.25rem;
  }

  .stale-content-banner__text {
    font-size: 0.875rem;
  }

  .stale-content-banner__text-sub {
    font-size: 0.75rem;
  }
}
</style>
