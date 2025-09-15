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
      />

      <DialogSection
        query="Captain and AI Modules in project"
        repository="chatwoot/chatwoot"
        :content="sampleContent"
        thoughtProcess="First, I need to understand the structure of Captain AI in Chatwoot. Looking at the codebase, I can see it's an enterprise feature with two main components: Assistants and Copilot. I'll examine the configuration files, models, and services to provide a comprehensive overview."
        :files="sampleFiles"
      />
    </div>
  </div>
</template>


<script setup>
import DialogSection from '@/components/main/research/DialogSection.vue';
import { useSamplePrompt, useSampleUploadedFiles, useSampleAdditionalText, useSampleFiles, useSampleAiResponse } from '@/composables/mockApi';
import { ref } from 'vue';

const sampleContent = ref(null);
const samplePrompt = ref(null);
const sampleUploadedFiles = ref(null);
const sampleAdditionalText = ref(null);
const sampleFiles = ref(null);

(async () => {
  const { sampleResponse } = await useSampleAiResponse();
  const { samplePrompt: promptData } = useSamplePrompt();
  const { sampleUploadedFiles: uploadedFilesData } = useSampleUploadedFiles();
  const { sampleAdditionalText: additionalTextData } = useSampleAdditionalText();
  const { sampleFiles: filesData } = useSampleFiles();
  
  sampleContent.value = sampleResponse.value.data;
  samplePrompt.value = promptData.value;
  sampleUploadedFiles.value = uploadedFilesData.value;
  sampleAdditionalText.value = additionalTextData.value;
  sampleFiles.value = filesData.value;
  
  console.log(sampleContent.value);
})();
</script>