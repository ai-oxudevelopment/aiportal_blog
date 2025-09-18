<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <!-- Header -->
    <div class="p-4 border-b border-gray-800">
      <h1 class="text-2xl font-bold text-white">SimpleAiChat Test Page</h1>
      <p class="text-gray-400 mt-2">Testing the SimpleAiChat component with gradient background, scrolling behavior, and navigation</p>
    </div>

    <!-- Main Content with lots of content to test scrolling -->
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Instructions -->
        <div class="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <h2 class="text-lg font-semibold mb-4 text-white">Test Instructions</h2>
          <ul class="text-gray-300 space-y-2 text-sm">
            <li>• Watch for the gradient background animation</li>
            <li>• Check that placeholder text doesn't overlap the button during animation</li>
            <li>• Verify that component sticks to bottom and moves with scrolling</li>
            <li>• Try typing text and pressing Enter (should navigate to /research page)</li>
            <li>• Try typing <code class="bg-gray-800 px-1 rounded">@</code> to see agent suggestions</li>
            <li>• Scroll down to see if component stays at bottom</li>
          </ul>
        </div>

        <!-- Test Results -->
        <div v-if="lastSubmission" class="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <h2 class="text-lg font-semibold mb-4 text-white">Last Submission</h2>
          <div class="space-y-2 text-sm">
            <div><span class="font-medium text-white">Input:</span> <span class="text-gray-300">{{ lastSubmission }}</span></div>
            <div><span class="font-medium text-white">Status:</span> <span class="text-gray-300">Should navigate to /research page</span></div>
          </div>
        </div>

        <!-- Long content to test scrolling -->
        <div class="space-y-8">
          <div v-for="i in 10" :key="i" class="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 class="text-xl font-semibold text-white mb-4">Content Section {{ i }}</h3>
            <p class="text-gray-300 mb-4">
              This is a test section with content to make the page scrollable. The SimpleAiChat component should stick to the bottom of the viewport and move with scrolling. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p class="text-gray-300 mb-4">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p class="text-gray-300">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
            </p>
          </div>
        </div>

        <!-- More content -->
        <div class="mt-16 p-8 bg-gray-900 rounded-lg border border-gray-800">
          <h2 class="text-2xl font-bold text-white mb-6">Final Section</h2>
          <p class="text-gray-300 text-lg">
            This is the end of the content. The SimpleAiChat component should remain visible and accessible at the bottom of the screen even when scrolling through all this content.
          </p>
        </div>
      </div>
    </div>

    <!-- SimpleAiChat Component -->
    <SimpleAiChat
      static-text="Попробовать в чате..."
      preview-text="What can I help you with today?"
      :agents="sampleAgents"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SimpleAiChat from '~/components/research/SimpleAiChat.vue'

// State
const lastSubmission = ref(null)

// Sample agents
const sampleAgents = ref([
  { id: 'researcher', name: 'researcher', description: 'Expert in research and analysis', category: 'research' },
  { id: 'analyst', name: 'analyst', description: 'Data analysis and insights specialist', category: 'research' },
  { id: 'coder', name: 'coder', description: 'Programming and development specialist', category: 'development' },
  { id: 'architect', name: 'architect', description: 'System design and architecture expert', category: 'development' },
  { id: 'writer', name: 'writer', description: 'Content creation and writing expert', category: 'writing' },
  { id: 'editor', name: 'editor', description: 'Content editing and proofreading specialist', category: 'writing' },
  { id: 'assistant', name: 'assistant', description: 'General purpose AI assistant', category: 'general' },
  { id: 'helper', name: 'helper', description: 'Multi-purpose helper agent', category: 'general' }
])

// Methods
const handleSubmit = (data) => {
  console.log('SimpleAiChat submitted:', data)
  lastSubmission.value = data || 'Form submitted'
}

// Page meta
definePageMeta({
  layout: false
})
</script>

<style scoped>
code {
  font-family: 'Courier New', monospace;
}
</style>
