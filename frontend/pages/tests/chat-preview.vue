<template>
  <div class="min-h-screen bg-base">
    <!-- Header -->
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-foreground mb-8">AiChatForm Component Test</h1>
      
      <!-- View Toggle -->
      <div class="mb-8">
        <div class="flex gap-4 items-center">
          <label class="text-foreground font-medium">Current View:</label>
          <button
            @click="currentView = 'simplified'"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              currentView === 'simplified' 
                ? 'bg-super text-foreground shadow-iridescent' 
                : 'bg-offset text-quiet hover:bg-offset-plus'
            ]"
          >
            Simplified View
          </button>
          <button
            @click="currentView = 'full'"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              currentView === 'full' 
                ? 'bg-super text-foreground shadow-iridescent' 
                : 'bg-offset text-quiet hover:bg-offset-plus'
            ]"
          >
            Full View
          </button>
        </div>
      </div>

      <!-- Preview Text Inputs (for simplified view) -->
      <div v-if="currentView === 'simplified'" class="mb-8 space-y-4">
        <div>
          <label class="block text-foreground font-medium mb-2">Static Text (before animation):</label>
          <input
            v-model="staticText"
            type="text"
            class="w-full max-w-md px-3 py-2 bg-raised border border-subtler rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-super"
            placeholder="Enter static text..."
          />
          <p class="text-quiet text-sm mt-1">This text shows immediately when the component loads</p>
        </div>
        
        <div>
          <label class="block text-foreground font-medium mb-2">Preview Text (for animation):</label>
          <input
            v-model="previewText"
            type="text"
            class="w-full max-w-md px-3 py-2 bg-raised border border-subtler rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-super"
            placeholder="Enter text for animation..."
          />
          <p class="text-quiet text-sm mt-1">This text will be animated after 5 seconds</p>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mb-8 p-4 bg-offset rounded-lg border border-subtler">
        <h2 class="text-lg font-semibold text-foreground mb-2">Instructions:</h2>
        <div v-if="currentView === 'simplified'">
          <ul class="text-quiet space-y-1">
            <li>• The simplified view appears as a small chat input at the bottom</li>
            <li>• After 5 seconds, it will start typing and erasing the preview text as placeholder animation</li>
            <li>• You can type your question into the input field</li>
            <li>• When you focus on the input, the animation stops</li>
            <li>• Press Enter or click the submit button to navigate to /research with your query</li>
            <li>• Hover over it to see the expansion effect</li>
          </ul>
        </div>
        <div v-else>
          <ul class="text-quiet space-y-1">
            <li>• The full view shows the complete interactive chat form</li>
            <li>• You can type, select modes, upload files, and submit</li>
            <li>• This is the original functionality of the component</li>
          </ul>
        </div>
      </div>

      <!-- Component Demo Area -->
      <div class="relative">
        <div class="bg-raised border border-subtler rounded-lg p-8 min-h-[400px]">
          <h3 class="text-xl font-semibold text-foreground mb-4">
            {{ currentView === 'simplified' ? 'Simplified' : 'Full' }} View Demo
          </h3>
          <p class="text-quiet mb-8">
            {{ currentView === 'simplified' 
              ? 'The simplified chat will appear at the bottom of the viewport.' 
              : 'The full chat form will appear at the bottom of the viewport.' 
            }}
          </p>
          
          <!-- Placeholder content to show the chat positioning -->
          <div class="space-y-4 text-quiet">
            <p>This is sample content to demonstrate how the chat component positions itself.</p>
            <p>Scroll down to see more content and observe how the chat stays fixed at the bottom.</p>
            <div class="h-32 bg-offset-plus rounded border border-subtlest flex items-center justify-center">
              <span>Sample content block</span>
            </div>
            <div class="h-32 bg-offset-plus rounded border border-subtlest flex items-center justify-center">
              <span>Another content block</span>
            </div>
            <div class="h-32 bg-offset-plus rounded border border-subtlest flex items-center justify-center">
              <span>More sample content</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- The actual component being tested -->
    <SimpleAiChat
      v-if="currentView === 'simplified'"
      :static-text="staticText"
      :preview-text="previewText"
      @submit="handleSubmit"
    />
    <FullAiChat
      v-else
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SimpleAiChat from '~/components/research/SimpleAiChat.vue'
import FullAiChat from '~/components/research/FullAiChat.vue'

// Page meta
definePageMeta({
  title: 'AiChatForm Test Page'
})

// Reactive state
const currentView = ref('simplified')
const staticText = ref('Ask ChatGPT')
const previewText = ref('What can I help you with today?')

// Methods
const handleSubmit = (data) => {
  console.log('Form submitted:', data)
  // In a real app, this would handle the form submission
  alert(`Form submitted with: ${JSON.stringify(data, null, 2)}`)
}
</script>

<style scoped>
/* Additional styles if needed */
</style>