export default defineNuxtConfig({
  ssr: false,
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/strapi",
    "@pinia/nuxt",
    "@nuxt/devtools",
    //"nuxt-socket-io",
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
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
  ],
  build: {
    transpile: ["vuetify", "markdown-it-vue"],
  },
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
    optimizeDeps: {
      include: ["markdown-it-vue"]
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
});
