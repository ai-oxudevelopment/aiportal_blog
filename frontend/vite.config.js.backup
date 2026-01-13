import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // Bundle analyzer - generates stats.html after build
    visualizer({
      open: false,
      filename: './dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],

  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,

    // Rollup options for bundle optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Vuetify separate chunk
            if (id.includes('vuetify')) {
              return 'vuetify'
            }
            // Mermaid separate chunk (lazy-loaded)
            if (id.includes('mermaid')) {
              return 'mermaid'
            }
            // Vue core libraries
            if (id.includes('vue') || id.includes('@vueuse/core') || id.includes('pinia')) {
              return 'vue-vendor'
            }
          }
        }
      }
    },

    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000
  }
})
