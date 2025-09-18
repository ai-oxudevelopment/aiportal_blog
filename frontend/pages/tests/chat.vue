<template>
  <div class="min-h-screen bg-base text-foreground">
    <!-- Header -->
    <div class="p-4 border-b border-subtlest">
      <h1 class="text-2xl font-bold text-foreground">AiChatForm Test Page</h1>
      <p class="text-quiet mt-2">Testing the redesigned Perplexity-style chat component</p>
    </div>

    <!-- Main Content -->
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Test Controls -->
        <div class="mb-8 p-4 bg-raised rounded-lg border border-subtler">
          <h2 class="text-lg font-semibold mb-4 text-foreground">Test Controls</h2>
          <div class="flex gap-4 flex-wrap">
            <button 
              @click="toggleLoading"
              class="px-4 py-2 bg-super/20 text-super rounded-lg hover:bg-super/30 transition-colors"
            >
              {{ isLoading ? 'Stop Loading' : 'Start Loading' }}
            </button>
            <button 
              @click="toggleTheme"
              class="px-4 py-2 bg-offset-plus text-foreground rounded-lg hover:bg-offset transition-colors"
            >
              Toggle Theme ({{ isDark ? 'Dark' : 'Light' }})
            </button>
          </div>
        </div>

        <!-- Sample Data Display -->
        <div class="mb-8 p-4 bg-raised rounded-lg border border-subtler">
          <h2 class="text-lg font-semibold mb-4 text-foreground">Sample Data</h2>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 class="font-medium text-foreground mb-2">Models ({{ sampleModels.length }})</h3>
              <ul class="text-quiet space-y-1">
                <li v-for="model in sampleModels" :key="model.id">{{ model.name }}</li>
              </ul>
            </div>
            <div>
              <h3 class="font-medium text-foreground mb-2">Agents ({{ sampleAgents.length }})</h3>
              <ul class="text-quiet space-y-1">
                <li v-for="agent in sampleAgents" :key="agent.id">@{{ agent.name }}</li>
              </ul>
            </div>
            <div>
              <h3 class="font-medium text-foreground mb-2">Commands ({{ sampleCommands.length }})</h3>
              <ul class="text-quiet space-y-1">
                <li v-for="command in sampleCommands" :key="command.id">/{{ command.name }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Last Submission Display -->
        <div v-if="lastSubmission" class="mb-8 p-4 bg-raised rounded-lg border border-subtler">
          <h2 class="text-lg font-semibold mb-4 text-foreground">Last Submission</h2>
          <div class="space-y-2 text-sm">
            <div><span class="font-medium text-foreground">Input:</span> <span class="text-quiet">{{ lastSubmission.userInput }}</span></div>
            <div><span class="font-medium text-foreground">Mode:</span> <span class="text-quiet">{{ lastSubmission.mode }}</span></div>
            <div><span class="font-medium text-foreground">Model:</span> <span class="text-quiet">{{ lastSubmission.model?.name || 'None' }}</span></div>
            <div><span class="font-medium text-foreground">Files:</span> <span class="text-quiet">{{ lastSubmission.files.length }} file(s)</span></div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mb-8 p-4 bg-raised rounded-lg border border-subtler">
          <h2 class="text-lg font-semibold mb-4 text-foreground">Test Instructions</h2>
          <ul class="text-quiet space-y-2 text-sm">
            <li>• Type text in the input area below</li>
            <li>• Try typing <code class="bg-offset px-1 rounded">@</code> to see agent suggestions</li>
            <li>• Try typing <code class="bg-offset px-1 rounded">/</code> to see command suggestions</li>
            <li>• Click the mode switcher to toggle between Simple Search and Deep Exploration</li>
            <li>• Click the CPU icon to select a model</li>
            <li>• Click the paperclip icon to attach files</li>
            <li>• Press Enter or click the submit button to submit</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Chat Form Component -->
    <FullAiChat
      :models="sampleModels"
      :agents="sampleAgents"
      :commands="sampleCommands"
      :is-loading="isLoading"
      placeholder="Ask a question or try @agent or /command..."
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FullAiChat from '~/components/research/FullAiChat.vue'

// State
const isLoading = ref(false)
const isDark = ref(true)
const lastSubmission = ref(null)

// Sample data
const sampleModels = ref([
  { id: 'sonar', name: 'Sonar', description: "Perplexity's fast model" },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4.0', description: "Anthropic's advanced model" },
  { id: 'claude-sonnet-4-thinking', name: 'Claude Sonnet 4.0 Thinking', description: "Anthropic's reasoning model" },
  { id: 'claude-opus-4-thinking', name: 'Claude Opus 4.1 Thinking', description: "Anthropic's Opus reasoning model with thinking", badge: 'макс' },
  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', description: "Google's latest model" },
  { id: 'gpt-5', name: 'GPT-5', description: "OpenAI's latest model" },
  { id: 'gpt-5-thinking', name: 'GPT-5 Thinking', description: "OpenAI's latest model with thinking" },
  { id: 'o3', name: 'o3', description: "OpenAI's reasoning model" },
  { id: 'o3-pro', name: 'o3-pro', description: "OpenAI's most powerful reasoning model", badge: 'макс' },
  { id: 'grok-4', name: 'Grok 4', description: "xAI's latest model" }
])

const sampleAgents = ref([
  { id: 'researcher', name: 'researcher', description: 'Expert in research and analysis' },
  { id: 'coder', name: 'coder', description: 'Programming and development specialist' },
  { id: 'writer', name: 'writer', description: 'Content creation and writing expert' },
  { id: 'analyst', name: 'analyst', description: 'Data analysis and insights specialist' }
])

const sampleCommands = ref([
  { id: 'clear', name: 'clear', description: 'Clear the current conversation' },
  { id: 'help', name: 'help', description: 'Show available commands' },
  { id: 'summarize', name: 'summarize', description: 'Summarize the conversation' },
  { id: 'export', name: 'export', description: 'Export conversation to file' }
])

// Methods
const handleSubmit = (data) => {
  console.log('Form submitted:', data)
  lastSubmission.value = data
  
  // Simulate loading
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

const toggleLoading = () => {
  isLoading.value = !isLoading.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
  }
}

// Set initial theme
onMounted(() => {
  if (isDark.value) {
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
  }
})

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