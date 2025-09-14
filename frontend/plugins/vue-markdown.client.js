export default defineNuxtPlugin((nuxtApp) => {
  // Markdownit is automatically available via the module
  // We can create a simple markdown component
  nuxtApp.vueApp.component('MarkdownRenderer', {
    props: {
      content: {
        type: String,
        default: ''
      }
    },
    setup(props) {
      const { $md } = useNuxtApp()
      const renderedContent = computed(() => {
        return $md.render(props.content || '')
      })
      
      return {
        renderedContent
      }
    },
    template: '<div v-html="renderedContent"></div>'
  })
})
