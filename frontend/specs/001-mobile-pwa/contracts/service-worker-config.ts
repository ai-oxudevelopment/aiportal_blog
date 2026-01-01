/**
 * Service Worker Configuration for AI Portal PWA
 *
 * This configuration is used by @vite-pwa/nuxt module
 * File: nuxt.config.ts (pwa.workbox section)
 *
 * Caching Strategy:
 * - App Shell (JS/CSS/HTML): Cache First
 * - API Calls (Strapi): Stale-While-Revalidate
 * - Images/Fonts: Cache First with long expiration
 * - Dynamic Content: Network First with offline fallback
 */

export const serviceWorkerConfig = {
  // Service worker registration type
  registerType: 'autoUpdate' as const, // Automatically update when new version available

  // Disable in development to avoid hydration issues
  disable: process.env.NODE_ENV === 'development',

  // Scope and base
  scope: '/',
  base: '/',

  // Workbox configuration
  workbox: {
    // Glob patterns for precaching (app shell)
    globPatterns: [
      '**/*.{js,css,html,woff2}', // Core application files
    ],

    // Navigation fallback for SPA
    navigateFallback: '/',
    navigateFallbackDenylist: [
      /^\/api/, // Don't cache API routes
    ],

    // Runtime caching strategies
    runtimeCaching: [
      // Strategy 1: Strapi API calls - Stale-While-Revalidate
      {
        urlPattern: /^https:\/\/.*\.strapi\.io\/.*/i, // Adjust to actual Strapi URL
        handler: 'StaleWhileRevalidate' as const,
        options: {
          cacheName: 'strapi-api-cache',
          expiration: {
            maxEntries: 100, // Cache up to 100 API responses
            maxAgeSeconds: 86400, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200], // Cache OK and opaque responses
          },
          networkTimeoutSeconds: 10, // Fall back to cache if network takes >10s
        },
      },

      // Strategy 2: Images - Cache First
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
        handler: 'CacheFirst' as const,
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 200, // Cache up to 200 images
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },

      // Strategy 3: Fonts - Cache First (long expiration)
      {
        urlPattern: /\.(?:woff2?|eot|ttf|otf)$/i,
        handler: 'CacheFirst' as const,
        options: {
          cacheName: 'font-cache',
          expiration: {
            maxEntries: 50, // Cache up to 50 font files
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year (fonts rarely change)
          },
        },
      },

      // Strategy 4: Yandex Metrika / Analytics - Network First
      {
        urlPattern: /^https:\/\/mc\.yandex\.ru\/.*/i,
        handler: 'NetworkFirst' as const,
        options: {
          cacheName: 'analytics-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
    ],
  },

  // Web app manifest configuration
  manifest: {
    name: 'AI Portal - Библиотека AI-инструментов',
    short_name: 'AI Portal',
    description: 'Библиотека промптов и AI-инструментов для операционных команд',
    theme_color: '#ff1493', // Pink from iridescent gradient
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable icons for adaptive Android icons
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'utilities', 'education'],
    shortcuts: [
      {
        name: 'Инструкции',
        short_name: 'Инструкции',
        description: 'Библиотека инструкций и промптов',
        url: '/',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Исследования',
        short_name: 'Исследования',
        description: 'AI-исследования и чат',
        url: '/research',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ],
  },

  // Development options
  devOptions: {
    enabled: false, // Disable service worker in development
    type: 'module',
  },
}

/**
 * Integration Example (nuxt.config.ts):
 *
 * import { serviceWorkerConfig } from './specs/001-mobile-pwa/contracts/service-worker-config'
 *
 * export default defineNuxtConfig({
 *   modules: ['@vite-pwa/nuxt'],
 *   pwa: serviceWorkerConfig,
 * })
 */
