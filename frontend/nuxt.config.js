export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'AI PORTAL | библиотека полезных инструментов для работы',
      meta: [
        { name: 'description', content: 'Библиотека полезных инструментов для работы с AI' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
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
    "@vite-pwa/nuxt"
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
    "~/assets/css/tailwind.css",
    "~/assets/css/perplexity-theme.css",
    "~/assets/css/iridescent-accents.css",
    "~/assets/css/formkit-theme.css",
    "~/assets/css/mobile-responsive.css",
    "vuetify/lib/styles/main.sass",
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
      runtimeCaching: [
        {
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
            },
            networkTimeoutSeconds: 10
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 7 * 24 * 60 * 60
            }
          }
        },
        {
          urlPattern: /\.(?:woff2?|eot|ttf|otf)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'font-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 365 * 24 * 60 * 60
            }
          }
        },
        {
          urlPattern: /^https:\/\/mc\.yandex\.ru\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'analytics-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 24 * 60 * 60
            }
          }
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
