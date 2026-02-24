import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'frontend/tests/**/*.{test,spec}.{js,ts}'
    ],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{js,ts}',
        'frontend/src/**/*.{js,ts}',
        'tests/**/*.{js,ts}',
        'frontend/tests/**/*.{js,ts}'
      ]
    }
  }
})
