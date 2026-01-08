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
          <div class="flex-1 relative group pb-32">
            <div class="text-sm text-gray-200 p-4 overflow-auto h-full leading-relaxed bg-gray-900 rounded-xl border border-gray-800 prose prose-invert prose-sm max-w-none">
              <pre class="not-prose text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                <code>{{ speckit.body || '' }}</code>
              </pre>
            </div>
          </div>

          <!-- Diagram View -->
          <SpeckitDiagramView
            v-if="speckit?.diagram"
            :diagram-source="speckit.diagram"
          />

          <!-- FAQ Section -->
          <SpeckitFaqSection />
        </div>

        <!-- Floating Download Bar (Fixed at Bottom) -->
        <div
          v-if="speckit"
          class="fixed bottom-5 left-0 right-0 z-40 mx-auto max-w-[400px] sm:max-w-[500px] transition-all duration-300 hover:scale-105"
          role="region"
          aria-label="Панель загрузки Speckit"
        >
          <div class="relative animate-gradient-background rounded-[24px]">
            <div class="shadow-black-4 bg-gradient-animated relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl hover:shadow-iridescent transition-shadow duration-300 items-center gap-2">

              <!-- Copy Command Display (90%) -->
              <div class="w-[90%]">
                <SpeckitCopyCommand
                  :command="wgetCommand"
                />
              </div>

              <!-- Download Button (10% - icon only) -->
              <button
                @click="handleDirectDownload"
                :disabled="downloadLoading"
                :aria-busy="downloadLoading"
                class="flex-shrink-0 w-[10%] flex items-center justify-center h-8 rounded-[16px] bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-700 disabled:cursor-not-allowed text-green-400 hover:text-green-300 disabled:text-gray-500 transition-all duration-200 hover:scale-105 border border-green-600/30 hover:border-green-500/50"
                title="Скачать Speckit"
                aria-label="Скачать Speckit"
              >
                <svg v-if="!downloadLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>

            </div>
          </div>
        </div>

        <!-- Download Error Toast -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="transform translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-2 opacity-0"
        >
          <div
            v-if="downloadError"
            class="fixed bottom-24 right-4 z-[60] max-w-sm bg-red-900/95 text-white px-4 py-3 rounded-lg shadow-xl border border-red-700 flex items-start gap-3"
            role="alert"
            aria-live="assertive"
          >
            <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium">Ошибка загрузки</p>
              <p class="text-xs text-red-200 mt-1">{{ downloadError }}</p>
            </div>
            <button
              @click="downloadError = null"
              class="flex-shrink-0 text-red-300 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Transition>

        <!-- Help Modal -->
        <SpeckitHelpModal
          v-model="showHelpModal"
          :instructions="defaultInstructions"
        />

        <!-- Loading state -->
        <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p class="text-gray-400">Загрузка...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFetchOneSpeckit } from '~/composables/useFetchOneSpeckit'
import { useFileDownload } from '~/composables/useFileDownload'
import SpeckitHelpModal from '~/components/speckit/SpeckitHelpModal.vue'
import SpeckitCopyCommand from '~/components/speckit/SpeckitCopyCommand.vue'
import SpeckitDiagramView from '~/components/speckit/SpeckitDiagramView.vue'
import SpeckitFaqSection from '~/components/speckit/SpeckitFaqSection.vue'
import type { SpeckitUsageInstructions } from '~/types/article'

const route = useRoute()
const speckitSlug = computed(() => route.params.speckitSlug as string)

// Fetch speckit data
const { speckit, loading, error } = useFetchOneSpeckit(speckitSlug.value)

// Composables
const { downloadFileFromUrl } = useFileDownload()

// Help modal state
const showHelpModal = ref(false)

// Download state for direct download button
const downloadLoading = ref(false)
const downloadError = ref<string | null>(null)

// Generate wget command for copy display
const wgetCommand = computed(() => {
  if (!speckit.value?.slug) return ''
  return `wget https://portal.aiworkplace.ru/speckits/${speckit.value.slug}/download`
})

// Direct download handler
const handleDirectDownload = async () => {
  if (!speckit.value?.file || downloadLoading.value) return

  downloadLoading.value = true
  downloadError.value = null

  try {
    const fileUrl = speckit.value.file.url.startsWith('http')
      ? speckit.value.file.url
      : `${process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'}${speckit.value.file.url}`

    await downloadFileFromUrl(fileUrl, speckit.value.file.name)
  } catch (err: any) {
    downloadError.value = err.message || 'Не удалось скачать файл. Попробуйте еще раз.'
    console.error('[speckitSlug] Download error:', err)
  } finally {
    downloadLoading.value = false
  }
}

// Auto-clear download error after 5 seconds
watch(downloadError, (newError) => {
  if (newError) {
    setTimeout(() => {
      downloadError.value = null
    }, 5000)
  }
})

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
</script>

<style scoped>
/* Gradient background animation - matching AiPlatformSelector */
.bg-gradient-animated {
  background: linear-gradient(45deg,
    rgba(236, 72, 153, 0.1),
    rgba(249, 115, 22, 0.1),
    rgba(59, 130, 246, 0.1),
    rgba(236, 72, 153, 0.1)
  );
  background-size: 300% 300%;
  animation: gradient-shift 6s ease infinite;
}

.animate-gradient-background {
  position: relative;
}

.animate-gradient-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg,
    rgba(236, 72, 153, 0.05),
    rgba(249, 115, 22, 0.05),
    rgba(59, 130, 246, 0.05),
    rgba(236, 72, 153, 0.05)
  );
  background-size: 400% 400%;
  animation: gradient-shift 8s ease infinite;
  border-radius: inherit;
  z-index: -1;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Enhanced hover effects for download button */
button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:hover.bg-green-600\/20 {
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}
</style>
