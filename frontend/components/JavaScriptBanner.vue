<template>
  <!-- Banner shows only when JavaScript is not enabled -->
  <div v-if="!hasJavaScript" class="javascript-banner">
    <div class="javascript-banner__content">
      <p class="javascript-banner__text">
        Включите JavaScript для более быстрой навигации и расширенных функций
      </p>
      <p class="javascript-banner__text-sub">
        Enable JavaScript for faster navigation and enhanced features
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * JavaScriptBanner Component
 *
 * Progressive enhancement banner that shows when JavaScript is disabled or not loaded.
 * This banner demonstrates the site works without JavaScript (SSR content is readable),
 * but encourages users to enable JavaScript for better experience.
 *
 * The component uses onMounted to detect JavaScript availability:
 * - If JS is disabled: Banner remains visible (HTML rendered by SSR)
 * - If JS is enabled: Banner disappears after hydration (hasJavaScript becomes true)
 */

import { ref, onMounted } from 'vue'

// Ref to track if JavaScript is enabled
const hasJavaScript = ref(false)

// When component mounts, JavaScript is working
onMounted(() => {
  hasJavaScript.value = true
})
</script>

<style scoped>
.javascript-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 2px solid #553c9a;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.javascript-banner__content {
  max-width: 1200px;
  margin: 0 auto;
}

.javascript-banner__text {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.javascript-banner__text-sub {
  color: #e0e7ff;
  font-size: 0.875rem;
  margin: 0;
  font-style: italic;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .javascript-banner {
    background: linear-gradient(135deg, #553c9a 0%, #667eea 100%);
    border-bottom-color: #4c1d95;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .javascript-banner {
    padding: 0.75rem;
  }

  .javascript-banner__text {
    font-size: 0.875rem;
  }

  .javascript-banner__text-sub {
    font-size: 0.75rem;
  }
}
</style>
