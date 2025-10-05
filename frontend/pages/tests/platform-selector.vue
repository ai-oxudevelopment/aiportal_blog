<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">AI Platform Selector Test</h1>
      
      <div class="bg-gray-900/50 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-sm p-8 mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Test Prompt Content</h2>
        <div class="bg-gray-950/30 rounded-xl p-4 mb-6">
          <pre class="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">{{ testPrompt }}</pre>
        </div>
        
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-white">Instructions:</h3>
          <ul class="text-gray-300 space-y-2">
            <li>• The AI Platform Selector should appear at the bottom of the screen</li>
            <li>• It should be positioned above the SimpleAiChat component</li>
            <li>• Click any platform button to open the test prompt in that AI platform</li>
            <li>• The component should have hover effects and smooth animations</li>
            <li>• On mobile, only icons should be visible; on desktop, full labels appear</li>
          </ul>
        </div>
      </div>

      <!-- Sample content to test scrolling -->
      <div class="space-y-6">
        <div v-for="i in 8" :key="i" class="bg-gray-900/30 rounded-lg p-6 border border-gray-800">
          <h3 class="text-xl font-semibold text-white mb-3">Sample Content Block {{ i }}</h3>
          <p class="text-gray-300 mb-3">
            This is sample content to test the fixed positioning of the AI Platform Selector component. 
            The component should remain visible and accessible at the bottom of the screen even when scrolling.
          </p>
          <p class="text-gray-400 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- AI Platform Selector Component -->
  <AiPlatformSelector :prompt-text="testPrompt" />
  
  <!-- SimpleAiChat Component for comparison -->
  <SimpleAiChat
    static-text="Попробовать в чате..."
    preview-text="What can I help you with today?"
  />
</template>

<script setup>
import AiPlatformSelector from '~/components/research/AiPlatformSelector.vue'
import SimpleAiChat from '~/components/research/SimpleAiChat.vue'

// Page meta
definePageMeta({
  title: 'AI Platform Selector Test',
  layout: false
})

// Test prompt content
const testPrompt = `You are a helpful AI assistant specialized in software development and problem-solving.

Your task is to:
1. Analyze the given problem or question
2. Provide clear, actionable solutions
3. Include code examples when relevant
4. Explain your reasoning step by step

Please help me create a responsive navigation component for a Vue.js application that includes:
- Mobile hamburger menu
- Dropdown submenus
- Active state highlighting
- Smooth animations

The component should work well on both desktop and mobile devices.`
</script>

<style scoped>
/* Additional styles for the test page */
.bg-gradient-test {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}
</style>