import { useMarkdown } from '~/composables/useMarkdown'

export default defineNuxtPlugin((nuxtApp) => {
  // Create a simple markdown component using our composable
  nuxtApp.vueApp.component('MarkdownRenderer', {
    props: {
      content: {
        type: String,
        default: ''
      }
    },
    setup(props) {
      const { renderMarkdown } = useMarkdown()
      const renderedContent = computed(() => {
        return renderMarkdown(props.content || '')
      })
      
      return {
        renderedContent
      }
    },
    template: '<div v-html="renderedContent"></div>'
  })
})
