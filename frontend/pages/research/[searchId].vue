<template>
  <div class="min-h-screen bg-black text-white relative">
    <!-- Main Content -->
    <div :class="mainContentClasses">
      <div class="container mx-auto px-4 py-8">
        <!-- Header with Sidebar Toggle -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">Research Session</h1>
            <div class="text-sm text-gray-400">
              ID: {{ searchId }}
            </div>
          </div>
          <button
            @click="toggleSidebar"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Configure Research
          </button>
        </div>

        <DialogSection
          query="Captain and AI Modules in project"
          repository="chatwoot/chatwoot"
          :content="sampleContent"
          thoughtProcess="First, I need to understand the structure of Captain AI in Chatwoot. Looking at the codebase, I can see it's an enterprise feature with two main components: Assistants and Copilot. I'll examine the configuration files, models, and services to provide a comprehensive overview."
          :prompt="samplePrompt"
          :uploadedFiles="sampleUploadedFiles"
          :additionalText="sampleAdditionalText"
          :files="sampleFiles"
          return_to="/"
        />

        <DialogSection
          query="Captain and AI Modules in project"
          repository="chatwoot/chatwoot"
          :content="sampleContent"
          thoughtProcess="First, I need to understand the structure of Captain AI in Chatwoot. Looking at the codebase, I can see it's an enterprise feature with two main components: Assistants and Copilot. I'll examine the configuration files, models, and services to provide a comprehensive overview."
          :prompt="samplePrompt"
          :uploadedFiles="sampleUploadedFiles"
          :additionalText="sampleAdditionalText"
          :files="sampleFiles"
          return_to="/"
        />

        <FullAiChat
          :is-loading="isLoading"
          placeholder="Попробуйте в действии"
          @submit="handleChatSubmit"
        />
      </div>
    </div>

    <!-- Dynamic Form Sidebar Component -->
    <DynamicFormSidebar
      v-model:isOpen="isSidebarOpen"
      v-model:formData="formData"
      :fetchUrl="`/api/${searchId}/form`"
      :submitUrl="`/api/${searchId}/submit`"
      :autoCloseOnSuccess="true"
      title="Research Configuration"
      description="Configure your research parameters and preferences"
      @close="handleSidebarClose"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
      @submit-success="handleSubmitSuccess"
      @submit-error="handleSubmitError"
    />
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DialogSection from '@/components/research/DialogSection.vue'
import FullAiChat from '@/components/research/FullAiChat.vue'
import DynamicFormSidebar from '@/components/ui/DynamicFormSidebar.vue'
import { useSamplePrompt, useSampleUploadedFiles, useSampleAdditionalText, useSampleFiles, useSampleAiResponse } from '@/composables/mockApi'

const route = useRoute()
const searchId = computed(() => route.params.searchId)

// Original sample data
const sampleContent = ref(null)
const samplePrompt = ref(null)
const sampleUploadedFiles = ref(null)
const sampleAdditionalText = ref(null)
const sampleFiles = ref(null)
const isLoading = ref(false)
const return_to = ref('/')

// Sidebar state
const isSidebarOpen = ref(false)
const formData = ref({})

// Computed properties for responsive layout
const mainContentClasses = computed(() => [
  'transition-all duration-300 ease-in-out',
  isSidebarOpen.value ? 'md:mr-80 lg:mr-96' : 'mr-0'
])

// Sample data setup
const { samplePrompt: promptData } = useSamplePrompt()
const { sampleUploadedFiles: uploadedFilesData } = useSampleUploadedFiles()
const { sampleAdditionalText: additionalTextData } = useSampleAdditionalText()
const { sampleFiles: filesData } = useSampleFiles()

// Синхронные данные устанавливаем сразу
samplePrompt.value = promptData.value
sampleUploadedFiles.value = uploadedFilesData.value
sampleAdditionalText.value = additionalTextData.value
sampleFiles.value = filesData.value

// Sidebar Methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Event Handlers for DynamicFormSidebar
const handleSidebarClose = () => {
  isSidebarOpen.value = false
}

const handleFormSubmit = (data) => {
  console.log('Research form submitted with data:', data)
  formData.value = { ...data }
}

const handleFormReset = () => {
  console.log('Research form reset requested')
}

const handleSubmitSuccess = (result) => {
  console.log('Research form submission successful:', result)
  // You could show a success notification here
}

const handleSubmitError = (error) => {
  console.error('Research form submission failed:', error)
  // You could show an error notification here
}

// Handle chat form submission
const handleChatSubmit = (data) => {
  console.log('Chat form submitted:', data)
  
  // Simulate loading
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

// Lifecycle - Auto-open sidebar when page loads
onMounted(() => {
  // Auto-open sidebar after a short delay for better UX
  setTimeout(() => {
    isSidebarOpen.value = true
  }, 1000)
})

// Асинхронные данные загружаем отдельно
;(async () => {
  const { sampleResponse } = await useSampleAiResponse()
  sampleContent.value = sampleResponse.value?.data || null
})()
</script>