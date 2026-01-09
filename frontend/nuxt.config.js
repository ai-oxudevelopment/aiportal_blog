export default defineNuxtConfig({
  ssr: true, // Keep SSR for SEO

  // Hybrid rendering: pre-render static pages, SPA for others
  routeRules: {
    // Pre-render public pages (no dynamic data)
    '/': { prerender: true },
    '/speckits': { prerender: true },
    '/about': { prerender: true },

    // SPA mode for non-critical routes (future enhancement)
    // '/research/**': { ssr: false },
    // '/admin/**': { ssr: false }
  },

  app: {
    head: {
      title: 'AI PORTAL | библиотека полезных инструментов для работы',
      meta: [
        { name: 'description', content: 'Библиотека полезных инструментов для работы с AI' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'AI Portal' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#ff1493' },
        { name: 'application-name', content: 'AI Portal' },
        { name: 'apple-touch-fullscreen', content: 'yes' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },

        // Preload critical fonts - prevents render-blocking
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: 'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
          crossorigin: 'anonymous'
        }
      ]
    }
  },
  css: [
    'github-markdown-css/github-markdown-light.css',  // либо github-markdown-dark.css
  ],
  modules: [
    "nuxt-markdown-render",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/strapi",
    "@pinia/nuxt",
    "@artmizu/yandex-metrika-nuxt",
    "@vite-pwa/nuxt",
    "@nuxt/image"  // Image optimization for better LCP
  ],
  devtools: {
    enabled: false,
  },
  io: {
    sockets: [
      {
        name: "main",
        url: process.env.STRAPI_URL,
      },
    ],
  },
  strapi: {
    url: process.env.STRAPI_URL,
    prefix: "/api",
    version: "v5",
    cookieName: "strapi_jwt",
    key: "authToken",
    entities: ['categories', 'articles'],
    cookie: {
      maxAge: 7 * 24 * 3600 * 1000,
      sameSite: "lax",
      secure: false,
      path: "/",
      httpOnly: false,
    },
  },
  runtimeConfig: {
    strapi: { // nuxt/strapi options available server-side
      url: process.env.STRAPI_URL
    },
    public: {
      strapi: { // nuxt/strapi options available client-side
        url: process.env.STRAPI_URL
      }
    }
  },
  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate", "storeToRefs"],
  },
  css: [
    // Critical CSS - loads immediately for FCP
    "~/assets/css/critical.css",
    "~/assets/css/fonts.css",  // Font loading with font-display: swap

    // Existing CSS files
    "~/assets/css/tailwind.css",
    "~/assets/css/perplexity-theme.css",
    "~/assets/css/formkit-theme.css",
    "~/assets/css/mobile-responsive.css",
    "vuetify/lib/styles/main.sass",

    // Non-critical CSS - defer for better FCP (loads after 2s)
    { src: "~/assets/css/animations.css", media: "print", onload: "this.media='all'" },
    "~/assets/css/iridescent-accents.css",

    // Fonts
    "@mdi/font/css/materialdesignicons.min.css",
  ],
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
    optimizeDeps: {
      include: []
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      }
    }
  },
  imports: {
    dirs: ["stores", "composables"],
  },

  // Image optimization for better LCP (Largest Contentful Paint)
  image: {
    // Image formats: prioritize WebP for modern browsers
    formats: ['webp', 'jpg'],
    // Allow Strapi-hosted images
    domains: ['portal.aiworkplace.ru', 'localhost'],
    // Image quality presets for different use cases
    presets: {
      thumbnail: {
        modifiers: {
          width: 300,
          height: 300,
          fit: 'cover',
          quality: 75,
          format: 'webp'
        }
      },
      card: {
        modifiers: {
          width: 600,
          height: 400,
          fit: 'cover',
          quality: 80,
          format: 'webp'
        }
      },
      hero: {
        modifiers: {
          width: 1200,
          quality: 85,
          format: 'webp'
        }
      },
      diagram: {
        modifiers: {
          width: 800,
          fit: 'inside',
          quality: 90,
          format: 'webp'
        }
      }
    }
  },

  server: {
    port: 8080 // или process.env.PORT
  },

  pwa: {
    registerType: 'autoUpdate',
    disable: process.env.NODE_ENV === 'development',
    scope: '/',
    base: '/',
    workbox: {
      globPatterns: ['**/*.{js,css,html,woff2}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api/],
      cleanupOutdatedCaches: true, // Remove old caches to free up space
      runtimeCaching: [
        {
          // Local API proxy - StaleWhileRevalidate for fast loads + fresh data
          urlPattern: /^http:\/\/localhost:\d+\/api\//i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'local-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300 // 5 minutes fresh
            }
          }
        },
        {
          // Production Strapi API - StaleWhileRevalidate
          urlPattern: /^https:\/\/.*\.aiworkplace\.ru\/api\//i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'strapi-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300 // 5 minutes fresh, stale allowed after
            }
          }
        },
        {
          // Legacy Strapi.io pattern (if still used)
          urlPattern: /^https:\/\/.*\.strapi\.io\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'strapi-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 86400
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // Images - CacheFirst for fastest loads
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        {
          // Fonts - CacheFirst
          urlPattern: /\.(?:woff2?|eot|ttf|otf)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'font-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
            }
          }
        },
        {
          // Static assets (JS/CSS) - StaleWhileRevalidate
          urlPattern: /\.(?:js|css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          // Analytics - NetworkOnly (don't cache analytics data)
          urlPattern: /^https:\/\/mc\.yandex\.ru\/.*/i,
          handler: 'NetworkOnly'
        }
      ]
    },
    manifest: {
      name: 'AI Portal - Библиотека AI-инструментов',
      short_name: 'AI Portal',
      description: 'Библиотека промптов и AI-инструментов для операционных команд',
      theme_color: '#ff1493',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any'
        }
      ],
      categories: ['productivity', 'utilities', 'education'],
      shortcuts: [
        {
          name: 'Инструкции',
          short_name: 'Инструкции',
          description: 'Библиотека инструкций и промптов',
          url: '/',
          icons: [{ src: '/favicon.svg', sizes: 'any' }]
        },
        {
          name: 'Исследования',
          short_name: 'Исследования',
          description: 'AI-исследования и чат',
          url: '/research',
          icons: [{ src: '/favicon.svg', sizes: 'any' }]
        }
      ]
    },
    devOptions: {
      enabled: false,
      type: 'module'
    }
  }
});
