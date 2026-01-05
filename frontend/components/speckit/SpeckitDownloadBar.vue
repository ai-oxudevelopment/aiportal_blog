<template>
  <div
    v-if="speckit.file"
    class="fixed bottom-[88px] right-0 left-0 z-40 mx-auto w-[300px] sm:w-[325px] transition-all duration-300 hover:w-[320px] sm:hover:w-[350px] hover:scale-105 translate-y-0 opacity-100 pointer-events-auto"
    role="region"
    aria-label="Панель загрузки Speckit"
  >
    <div class="relative animate-gradient-background rounded-[24px]">
      <div class="shadow-black-4 bg-gradient-animated relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl hover:shadow-iridescent transition-shadow duration-300 items-center justify-between gap-2">

        <!-- Download Button -->
        <button
          @click="handleDownload"
          :disabled="downloadLoading"
          :aria-busy="downloadLoading"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-purple-600/20 hover:bg-purple-600/30 disabled:bg-gray-700 disabled:cursor-not-allowed text-purple-400 hover:text-purple-300 transition-all duration-200 hover:scale-105 group border border-purple-600/30 hover:border-purple-500/50"
          :title="'Скачать конфигурацию'"
          aria-label="Скачать файл конфигурации Speckit"
        >
          <svg v-if="!downloadLoading" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg v-else class="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs font-medium">Скачать</span>
        </button>

        <!-- Help Button -->
        <button
          @click="handleHelp"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-105 group border border-blue-600/30 hover:border-blue-500/50"
          :title="'Инструкция'"
          aria-label="Открыть инструкцию по использованию Speckit"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs font-medium">?</span>
        </button>

      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="downloadError"
      class="fixed bottom-4 right-4 bg-red-900/90 text-white px-4 py-3 rounded-lg shadow-lg border border-red-700 flex items-center gap-3 z-50"
      role="alert"
      aria-live="assertive"
    >
      <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ downloadError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileDownload } from '~/composables/useFileDownload'
import type { SpeckitFull } from '~/types/article'

// Props
const props = defineProps<{
  speckit: SpeckitFull
}>()

// Emits
const emit = defineEmits<{
  help: []
}>()

// Composables
const { downloadFileFromUrl } = useFileDownload()

// State
const downloadLoading = ref(false)
const downloadError = ref<string | null>(null)

// Download handler
const handleDownload = async () => {
  if (!props.speckit.file || downloadLoading.value) return

  downloadLoading.value = true
  downloadError.value = null

  try {
    const fileUrl = props.speckit.file.url.startsWith('http')
      ? props.speckit.file.url
      : `${process.env.STRAPI_URL || 'http://strapi-dsgscsgc8g8gws8gwk4s4s48.coolify.aiworkplace.ru'}${props.speckit.file.url}`

    await downloadFileFromUrl(fileUrl, props.speckit.file.name)
  } catch (err: any) {
    downloadError.value = err.message || 'Не удалось скачать файл. Попробуйте еще раз.'
    console.error('[SpeckitDownloadBar] Download error:', err)
  } finally {
    downloadLoading.value = false
  }
}

// Help handler
const handleHelp = () => {
  emit('help')
}

// Auto-clear error after 5 seconds
watch(downloadError, (newError) => {
  if (newError) {
    setTimeout(() => {
      downloadError.value = null
    }, 5000)
  }
})
</script>

<style scoped>
.bg-gradient-animated {
  background: linear-gradient(45deg,
    rgba(168, 85, 247, 0.1),
    rgba(59, 130, 246, 0.1),
    rgba(168, 85, 247, 0.1)
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
    rgba(168, 85, 247, 0.05),
    rgba(59, 130, 246, 0.05),
    rgba(168, 85, 247, 0.05)
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

/* Enhanced hover effects */
button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Platform-specific glow effects */
button:hover.bg-purple-600\/20 {
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);
}

button:hover.bg-blue-600\/20 {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}
</style>
