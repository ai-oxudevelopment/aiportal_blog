<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <div class="flex">
      <main class="w-full">
        <!-- 404 Error State -->
        <div v-if="error && error.statusCode === 404" class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
          <div class="text-center py-16">
            <h1 class="text-4xl font-bold text-white mb-4">Speckit не найден</h1>
            <p class="text-gray-400 mb-8">Запрошенный speckit не существует или был удален.</p>
            <NuxtLink
              to="/speckits"
              class="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              ← Вернуться к каталогу
            </NuxtLink>
          </div>
        </div>

        <!-- Speckit content -->
        <div v-else-if="speckit" class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
          <!-- Header with back link -->
          <div class="mb-6">
            <NuxtLink
              to="/speckits"
              class="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Вернуться к каталогу
            </NuxtLink>
          </div>

          <!-- Title section -->
          <div class="text-center py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-lg shadow-xl mb-8">
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
              {{ speckit.title }}
            </h1>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <span
                v-for="category in speckit.categories"
                :key="category.id"
                class="px-3 py-1 bg-pink-500/20 text-pink-300 text-sm rounded-full border border-pink-500/30"
              >
                {{ category.name }}
              </span>
            </div>
          </div>

          <!-- Content preview -->
          <div class="flex-1 relative group">
            <div class="markdown-body p-6 bg-gray-950/30 rounded-xl border border-gray-800">
              <div v-html="renderedMarkdown" class="prose prose-invert prose-sm max-w-none text-gray-200"></div>
            </div>
          </div>

          <!-- Speckit Download Bar -->
          <SpeckitDownloadBar
            v-if="speckit"
            :speckit="speckit"
            @help="showHelpModal = true"
          />

          <!-- Speckit Help Modal -->
          <SpeckitHelpModal
            v-model="showHelpModal"
            :instructions="defaultInstructions"
          />

          <!-- AI Platform Selector -->
          <AiPlatformSelector
            v-if="speckit?.body"
            :prompt-text="speckit.body"
          />
        </div>

        <!-- Loading state -->
        <div v-else-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p class="text-gray-400">Загрузка...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFetchOneSpeckit } from '~/composables/useFetchOneSpeckit'
import SpeckitDownloadBar from '~/components/speckit/SpeckitDownloadBar.vue'
import SpeckitHelpModal from '~/components/speckit/SpeckitHelpModal.vue'
import AiPlatformSelector from '~/components/research/AiPlatformSelector.vue'
import type { SpeckitFull } from '~/types/article'
import type { SpeckitUsageInstructions } from '~/types/article'

const route = useRoute()
const speckitSlug = computed(() => route.params.speckitSlug as string)

// Fetch speckit data
const { speckit, loading, error } = useFetchOneSpeckit(speckitSlug.value)

// Help modal state
const showHelpModal = ref(false)

// Default instructions
const defaultInstructions: SpeckitUsageInstructions = {
  title: 'Как использовать Speckit',
  sections: [
    {
      heading: 'Что такое Speckit?',
      content: 'Speckit - это готовая конфигурация для вашего проекта, которая помогает структурировать работу с AI-ассистентами.'
    },
    {
      heading: 'Скачивание конфигурации',
      content: 'Нажмите кнопку **Скачать** внизу страницы, чтобы загрузить файл конфигурации.'
    },
    {
      heading: 'Интеграция в проект',
      content: '1. Скачайте конфигурационный файл\n2. Разместите его в корне вашего проекта\n3. Следуйте инструкциям в файле для настройки'
    },
    {
      heading: 'Использование с AI-ассистентами',
      content: 'Нажмите на одну из кнопок внизу страницы (ChatGPT, Claude или Perplexity), чтобы открыть этот Speckit в выбранной AI-системе.'
    }
  ]
}

// Render markdown using @nuxtjs/mdc
const renderedMarkdown = computed(() => {
  if (!speckit.value?.body) return ''
  return speckit.value.body
})
</script>

<style scoped>
.markdown-body {
  line-height: 1.7;
}

.markdown-body :deep(h1) {
  @apply text-2xl font-bold text-white mt-6 mb-4;
}

.markdown-body :deep(h2) {
  @apply text-xl font-bold text-white mt-5 mb-3;
}

.markdown-body :deep(h3) {
  @apply text-lg font-semibold text-white mt-4 mb-2;
}

.markdown-body :deep(p) {
  @apply mb-4;
}

.markdown-body :deep(code) {
  @apply bg-gray-800 text-pink-300 px-1.5 py-0.5 rounded text-sm;
}

.markdown-body :deep(pre) {
  @apply bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4;
}

.markdown-body :deep(pre code) {
  @apply bg-transparent text-gray-200 p-0;
}

.markdown-body :deep(ul) {
  @apply list-disc list-inside mb-4 space-y-2;
}

.markdown-body :deep(ol) {
  @apply list-decimal list-inside mb-4 space-y-2;
}

.markdown-body :deep(li) {
  @apply text-gray-200;
}

.markdown-body :deep(a) {
  @apply text-pink-400 hover:text-pink-300 underline;
}

.markdown-body :deep(blockquote) {
  @apply border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4;
}

.markdown-body :deep(table) {
  @apply w-full mb-4 border-collapse;
}

.markdown-body :deep(th) {
  @apply bg-gray-800 text-white font-semibold px-4 py-2 border border-gray-700;
}

.markdown-body :deep(td) {
  @apply bg-gray-900 text-gray-200 px-4 py-2 border border-gray-800;
}
</style>
