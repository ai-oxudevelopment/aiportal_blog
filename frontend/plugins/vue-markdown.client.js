import VueMarkdown from 'vue-markdown'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('vue-markdown', VueMarkdown)
})
