<template>
  <div class="min-h-screen bg-black text-white">
    <div class="container mx-auto px-4 py-8">
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
</template>


<script setup>
import DialogSection from '@/components/research/DialogSection.vue';
import FullAiChat from '@/components/research/FullAiChat.vue';
import { useSamplePrompt, useSampleUploadedFiles, useSampleAdditionalText, useSampleFiles, useSampleAiResponse } from '@/composables/mockApi';
import { ref } from 'vue';

const sampleContent = ref(null);
const samplePrompt = ref(null);
const sampleUploadedFiles = ref(null);
const sampleAdditionalText = ref(null);
const sampleFiles = ref(null);
const isLoading = ref(false);
const return_to = ref('/');


const { samplePrompt: promptData } = useSamplePrompt();
const { sampleUploadedFiles: uploadedFilesData } = useSampleUploadedFiles();
const { sampleAdditionalText: additionalTextData } = useSampleAdditionalText();
const { sampleFiles: filesData } = useSampleFiles();

// Синхронные данные устанавливаем сразу
samplePrompt.value = promptData.value;
sampleUploadedFiles.value = uploadedFilesData.value;
sampleAdditionalText.value = additionalTextData.value;
sampleFiles.value = filesData.value;

// Handle chat form submission
const handleChatSubmit = (data) => {
  console.log('Chat form submitted:', data)
  
  // Simulate loading
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

// Асинхронные данные загружаем отдельно
(async () => {
  const { sampleResponse } = await useSampleAiResponse();
  sampleContent.value = sampleResponse.value?.data || null;
})();
</script>