import { marked } from 'marked'

export const useMarkdown = () => {
  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
    sanitize: false,
    smartLists: true,
    smartypants: true
  })

  const parseMarkdown = (text) => {
    if (!text) return ''
    return marked.parse(text)
  }

  const parseMarkdownInline = (text) => {
    if (!text) return ''
    return marked.parseInline(text)
  }

  return {
    parseMarkdown,
    parseMarkdownInline
  }
}
