// composables/useMermaidDiagram.ts
/**
 * Mermaid diagram composable for rendering Mermaid diagrams
 * Handles lazy loading of Mermaid.js and diagram rendering with intersection observer
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'

export interface UseMermaidDiagramReturn {
  renderDiagram: (source: string, elementId: string) => Promise<void>
  observeAndRender: (source: string, elementRef: Ref<HTMLElement | undefined>) => void
  isLoaded: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<string | null>
}

export function useMermaidDiagram(): UseMermaidDiagramReturn {
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let mermaidInstance: any = null
  let observer: IntersectionObserver | null = null

  /**
   * Load Mermaid.js dynamically
   */
  const loadMermaid = async () => {
    if (isLoaded.value || mermaidInstance) {
      return mermaidInstance
    }

    isLoading.value = true
    error.value = null

    try {
      // Dynamic import of Mermaid (lazy loaded)
      const mermaidModule = await import('mermaid')
      mermaidInstance = mermaidModule.default

      // Initialize Mermaid with configuration
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'neutral', // Better for performance
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 14,
        themeVariables: {
          darkMode: true,
          background: '#1f2937',
          primaryColor: '#8b5cf6',
          primaryTextColor: '#f3f4f6',
          primaryBorderColor: '#7c3aed',
          lineColor: '#6b7280',
          secondaryColor: '#3b82f6',
          tertiaryColor: '#1f2937',
          fontSize: '14px'
        }
      })

      isLoaded.value = true
      isLoading.value = false

      console.log('[useMermaidDiagram] Mermaid loaded successfully')
      return mermaidInstance
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = `Не удалось загрузить Mermaid: ${errorMessage}`
      isLoading.value = false
      console.error('[useMermaidDiagram] Load error:', err)
      throw err
    }
  }

  /**
   * Render Mermaid diagram from source code
   */
  const renderDiagram = async (source: string, elementId: string) => {
    if (!source.trim()) {
      error.value = 'Пустой код диаграммы'
      return
    }

    try {
      // Ensure Mermaid is loaded
      if (!isLoaded.value) {
        await loadMermaid()
      }

      // Find the target element
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`)
      }

      // Clear previous content
      element.innerHTML = ''

      // Validate diagram syntax
      const isValid = await mermaidInstance.parse(source)
      if (!isValid) {
        throw new Error('Неверный синтаксис диаграммы')
      }

      // Render the diagram
      const { svg } = await mermaidInstance.render(`mermaid-${elementId}`, source)
      element.innerHTML = svg

      error.value = null
      console.log(`[useMermaidDiagram] Diagram rendered successfully: ${elementId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = `Ошибка рендеринга: ${errorMessage}`
      console.error('[useMermaidDiagram] Render error:', err)

      // Display error in the element
      const element = document.getElementById(elementId)
      if (element) {
        element.innerHTML = `
          <div class="text-red-400 text-sm p-4 bg-red-900/20 rounded-lg border border-red-700">
            <p class="font-semibold mb-1">Ошибка диаграммы</p>
            <p class="text-xs">${errorMessage}</p>
          </div>
        `
      }
    }
  }

  /**
   * Observe element and load/render Mermaid when it enters viewport
   * This prevents loading Mermaid until the diagram is actually visible
   */
  const observeAndRender = (
    source: string,
    elementRef: Ref<HTMLElement | undefined>
  ) => {
    onMounted(() => {
      if (!elementRef.value) return

      // Create Intersection Observer
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded.value) {
              // Element is visible, load and render Mermaid
              const elementId = elementRef.value?.id || `mermaid-${Date.now()}`
              if (elementRef.value) {
                elementRef.value.id = elementId
                renderDiagram(source, elementId)
              }
              // Disconnect after loading (only load once)
              observer?.disconnect()
            }
          })
        },
        {
          // Start loading 200px before element is visible for smoother UX
          rootMargin: '200px',
          threshold: 0.01
        }
      )

      // Start observing the element
      observer.observe(elementRef.value)
    })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    // Disconnect observer
    if (observer) {
      observer.disconnect()
      observer = null
    }

    // Clear Mermaid instance
    if (mermaidInstance) {
      mermaidInstance = null
      isLoaded.value = false
    }
  })

  return {
    renderDiagram,
    observeAndRender,
    isLoaded,
    isLoading,
    error
  }
}
