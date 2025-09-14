import MarkdownItVue from 'markdown-it-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('markdown-it-vue', MarkdownItVue)
})
