<template>
  <div
    v-if="diagramSource"
    class="speckit-diagram-view mt-8 mb-8"
  >
    <!-- Section Header -->
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-200">Процесс</h3>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center p-8 bg-gray-950/30 rounded-xl border border-gray-800"
    >
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        <span class="text-gray-400 text-sm">Загрузка диаграммы...</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-red-900/20 rounded-xl border border-red-800"
      role="alert"
      aria-live="assertive"
    >
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 class="text-red-400 font-semibold mb-1">Ошибка загрузки диаграммы</h4>
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Diagram Container -->
    <div
      v-else
      class="bg-gray-950/30 rounded-xl border border-gray-800 overflow-hidden"
    >
      <div
        :id="elementId"
        class="diagram-container p-6 flex items-center justify-center min-h-[200px]"
        :aria-label="'Mermaid diagram: ' + (diagramType || 'flowchart')"
      >
        <!-- Mermaid SVG will be rendered here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMermaidDiagram } from '~/composables/useMermaidDiagram'

// Props
const props = defineProps<{
  diagramSource: string
}>()

// Generate unique element ID for this instance
const elementId = computed(() => `mermaid-diagram-${Math.random().toString(36).substring(2, 9)}`)

// Composables
const { renderDiagram, isLoading, error } = useMermaidDiagram()

// Detect diagram type
const diagramType = computed(() => {
  if (!props.diagramSource) return null

  const firstLine = props.diagramSource.split('\n')[0].trim()
  const type = firstLine.split(/\s+/)[0]

  const typeLabels: Record<string, string> = {
    'graph': 'Блок-схема',
    'flowchart': 'Блок-схема',
    'sequenceDiagram': 'Последовательность',
    'classDiagram': 'Классы',
    'stateDiagram': 'Состояния',
    'erDiagram': 'ER-диаграмма',
    'gantt': 'Гант',
    'pie': 'Круговая диаграмма',
    'mindmap': 'Интеллект-карта',
    'gitGraph': 'Git-граф'
  }

  return typeLabels[type] || 'Блок-схема'
})

// Render diagram on mount
onMounted(async () => {
  if (props.diagramSource) {
    await renderDiagram(props.diagramSource, elementId.value)
  }
})

// Re-render when diagram source changes
watch(() => props.diagramSource, async (newSource) => {
  if (newSource) {
    await renderDiagram(newSource, elementId.value)
  }
})
</script>

<style scoped>
.diagram-container {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
}

.diagram-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

.diagram-container :deep(.mermaid) {
  background: transparent !important;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .diagram-container {
    padding: 1rem;
    min-height: 150px;
  }

  .diagram-container :deep(svg) {
    font-size: 12px;
  }
}
</style>
