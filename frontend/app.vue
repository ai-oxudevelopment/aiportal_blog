<template>
  <div>
    <!-- NuxtLayout renders the default layout which includes Header, Sidebar, and page content -->
    <NuxtLayout>
      <!-- NuxtPage renders the current page in the layout's slot -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// SSR hydration setup
// Nuxt 3 automatically handles SSR hydration
// <NuxtLayout /> renders the default layout (layouts/default.vue)
// <NuxtPage /> renders the current page from pages/ directory

// Defer non-critical CSS for better First Contentful Paint
onMounted(() => {
  // Load animations after 2 seconds to improve initial page load
  setTimeout(() => {
    import('~/assets/css/animations.css').then(() => {
      console.log('Non-critical CSS loaded')
    }).catch(() => {
      console.warn('Failed to load non-critical CSS')
    })
  }, 2000)
})
</script>

<style scoped>
/* Critical CSS - Inlined for fastest First Contentful Paint */
/* These styles are needed immediately for above-the-fold content */

/* App shell */
.v-application {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header/Navigation */
.v-app-bar {
  background-color: #000;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Main content area */
.v-main {
  flex: 1;
}

.v-container {
  max-width: 100%;
  padding-left: 16px;
  padding-right: 16px;
}

/* Hero section - Critical for FCP */
.hero-section {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

/* Typography basics */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.5em;
}

.text-h1 { font-size: 2.5rem; }
.text-h2 { font-size: 2rem; }
.text-h3 { font-size: 1.75rem; }
.text-h4 { font-size: 1.5rem; }
.text-h5 { font-size: 1.25rem; }
.text-h6 { font-size: 1rem; }

/* Loading states - Critical for perceived performance */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Progress indicator */
.v-progress-linear {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

/* Basic spacing */
.pa-2 { padding: 8px; }
.pa-4 { padding: 16px; }
.ma-2 { margin: 8px; }
.ma-4 { margin: 16px; }
.my-4 { margin-top: 16px; margin-bottom: 16px; }
.mb-4 { margin-bottom: 16px; }

/* Flex utilities */
.d-flex { display: flex; }
.flex-column { flex-direction: column; }
.align-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-space-between { justify-content: space-between; }

/* Text utilities */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Basic button styles */
.v-btn {
  text-transform: none;
  letter-spacing: normal;
}

/* Card component */
.v-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Grid system */
.v-row {
  display: flex;
  flex-wrap: wrap;
  margin: -12px;
}

.v-col {
  padding: 12px;
}

/* Mobile-first responsive */
@media (max-width: 768px) {
  .text-h1 { font-size: 2rem; }
  .text-h2 { font-size: 1.75rem; }
  .text-h3 { font-size: 1.5rem; }

  .hero-section {
    min-height: 40vh;
  }
}
</style>
