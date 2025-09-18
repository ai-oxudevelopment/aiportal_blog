export default defineNuxtConfig({
  ssr: false,
  css: [
    'github-markdown-css/github-markdown-light.css',  // либо github-markdown-dark.css
  ],
  modules: [
    "nuxt-markdown-render",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/strapi",
    "@pinia/nuxt",
  ],
  devtools: {
    enabled: false,
  },
  io: {
    sockets: [
      {
        name: "main",
        url: process.env.STRAPI_URL || "http://127.0.0.1:1337",
      },
    ],
  },
  strapi: {
    url: process.env.STRAPI_URL || "http://127.0.0.1:1337",
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
      url: process.env.STRAPI_URL || "http://127.0.0.1:1337"
    },
    public: {
      strapi: { // nuxt/strapi options available client-side
        url: process.env.STRAPI_URL || "http://127.0.0.1:1337"
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
});
