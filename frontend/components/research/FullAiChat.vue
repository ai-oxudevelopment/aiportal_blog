
<template>
  <div class="pointer-events-none fixed bottom-0 left-0 right-0 z-10 p-4"
       :style="{ paddingBottom: 'var(--safe-area-inset-bottom)' }">
    <div class="ai-chat-form mx-auto mb-3">
      <div class="pointer-events-auto">
        <!-- Main Form Container -->
        <div class="relative">
          <div class="bg-base relative rounded-2xl border border-subtlest ring-subtlest divide-subtlest bg-offset hover:shadow-iridescent transition-shadow duration-300">
            
            <!-- Input Container -->
            <div class="bg-raised w-full outline-none flex items-center border rounded-2xl bg-offset 
                        duration-75 transition-all border-subtler shadow-sm shadow-black/10 px-0 pt-3 pb-3 gap-y-4 grid items-center">
              
              <!-- Main Grid Layout -->
              <div class="px-3.5 grid-rows-1fr-auto grid grid-cols-3">
                
                <!-- Text Input Area (spans full width) -->
                <div class="overflow-hidden relative flex h-full w-full col-start-1 col-end-4 pb-3">
                  <div class="w-full" style="min-height: 1.5em;">
                    <div
                      ref="editorRef"
                      class="overflow-auto max-h-[150px] outline-none
                             resize-none caret-super selection:bg-super/30 selection:text-foreground
                             text-foreground bg-transparent placeholder-quieter placeholder:select-none
                             scrollbar-subtle size-full"
                      contenteditable="true"
                      role="textbox"
                      spellcheck="true"
                      :aria-placeholder="placeholder"
                      @input="handleInput"
                      @keydown="handleKeydown"
                      @paste="handlePaste"
                      style="user-select: text; white-space: pre-wrap; word-break: break-word;"
                    ></div>
                    
                    <!-- Placeholder -->
                    <div v-if="!userInput" aria-hidden="true">
                      <div class="absolute inset-0 pointer-events-none select-none text-quieter">
                        {{ placeholder }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mode Selector (left side, row 2) -->
                <div class="gap-sm flex col-start-1 row-start-2 -ml-2">
                  <div class="gap-xs flex items-center">
                    <div role="radiogroup" 
                         aria-required="false" 
                         class="group relative isolate flex h-fit focus:outline-none" 
                         tabindex="0">
                      
                      <!-- Background indicator -->
                      <div class="absolute inset-0 bg-super/10 border border-black/[0.04] rounded-[10px] transition-colors duration-300"></div>
                      
                      <!-- Mode buttons container -->
                      <div class="p-0.5 flex shrink-0 items-center">
                        
                        <!-- Simple Search Mode -->
                        <button
                          type="button"
                          role="radio"
                          :aria-checked="activeMode === 'simple'"
                          :data-state="activeMode === 'simple' ? 'checked' : 'unchecked'"
                          value="simple"
                          aria-label="Simple Search"
                          class="segmented-control group/segmented-control relative focus:outline-none"
                          :tabindex="activeMode === 'simple' ? '0' : '-1'"
                          @click="selectMode('simple')"
                        >
                          <div v-if="activeMode === 'simple'"
                               class="mode-selector-active pointer-events-none absolute inset-0 z-0 block
                                      shadow-iridescent transition-colors duration-300 group-focus-visible/segmented-control:border-dashed"
                               style="transform: none; transform-origin: 50% 50% 0px; opacity: 1;"></div>
                          
                          <div class="relative z-10 flex h-8 min-w-9 items-center justify-center py-1 gap-1 px-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 :class="activeMode === 'simple' ? 'text-iridescent' : 'text-quiet hover:text-foreground'"
                                 fill="currentColor" fill-rule="evenodd">
                              <path d="M11 2.125a8.378 8.378 0 0 1 8.375 8.375c0 .767-.1 1.508-.304 2.22l-.029.085a.875.875 0 0 1-1.653-.566l.054-.206c.12-.486.182-.996.182-1.533A6.628 6.628 0 0 0 11 3.875 6.628 6.628 0 0 0 4.375 10.5a6.628 6.628 0 0 0 10.402 5.445c.943-.654 2.242-.664 3.153.109l.176.165.001.002 4.066 4.184a.875.875 0 0 1-1.256 1.22l-4.064-4.185-.104-.088c-.263-.183-.646-.197-.975.03l-.001.003A8.378 8.378 0 0 1 2.625 10.5 8.378 8.378 0 0 1 11 2.125Zm0 7.09a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"></path>
                            </svg>
                          </div>
                        </button>

                        <!-- Deep Exploration Mode -->
                        <button
                          type="button"
                          role="radio"
                          :aria-checked="activeMode === 'deep'"
                          :data-state="activeMode === 'deep' ? 'checked' : 'unchecked'"
                          value="deep"
                          aria-label="Deep Exploration"
                          class="segmented-control group/segmented-control relative focus:outline-none"
                          :tabindex="activeMode === 'deep' ? '0' : '-1'"
                          @click="selectMode('deep')"
                        >
                          <div v-if="activeMode === 'deep'"
                               class="mode-selector-active pointer-events-none absolute inset-0 z-0 block
                                      shadow-iridescent transition-colors duration-300 group-focus-visible/segmented-control:border-dashed"
                               style="transform: none; transform-origin: 50% 50% 0px; opacity: 1;"></div>
                          
                          <div class="relative z-10 flex h-8 min-w-9 items-center justify-center py-1 gap-1 px-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 :class="activeMode === 'deep' ? 'text-iridescent' : 'text-quiet hover:text-foreground'"
                                 fill="currentColor" fill-rule="evenodd">
                              <path d="M8.175 13.976a.876.876 0 0 1 1.172-.04l.065.061.582.59c.196.194.395.388.596.576l.39.358c1.942 1.753 3.844 2.937 5.357 3.477.81.29 1.444.369 1.884.31.404-.055.61-.216.731-.446.135-.256.209-.678.116-1.31-.08-.546-.275-1.191-.59-1.91l-.141-.313-.034-.083a.875.875 0 0 1 1.575-.741l.042.079.161.353c.36.823.61 1.623.719 2.362.122.836.071 1.675-.3 2.38-.431.818-1.186 1.247-2.044 1.363-.823.111-1.756-.056-2.707-.396-1.912-.681-4.17-2.154-6.357-4.207a30.378 30.378 0 0 1-.63-.61l-.608-.615-.058-.068a.875.875 0 0 1 .079-1.17Zm.624-5.822a.876.876 0 0 1 1.216 1.258c-.396.383-.788.775-1.165 1.178-1.95 2.077-3.26 4.133-3.835 5.747-.29.81-.37 1.444-.31 1.884.055.404.215.61.444.731l.104.048c.261.103.654.149 1.207.068.623-.09 1.378-.333 2.224-.731a.875.875 0 0 1 .745 1.583c-.948.446-1.871.756-2.716.88-.784.114-1.57.078-2.246-.234l-.134-.066c-.817-.431-1.246-1.186-1.362-2.044-.112-.823.056-1.756.395-2.707.64-1.792 1.973-3.889 3.83-5.945l.377-.411c.402-.43.816-.843 1.226-1.239Zm8.5-4.954c.832-.122 1.67-.073 2.372.302h-.001c.814.432 1.243 1.185 1.36 2.042.11.823-.057 1.756-.396 2.707-.682 1.911-2.154 4.17-4.207 6.356h-.001c-.403.429-.818.846-1.236 1.236l-.068.057a.875.875 0 0 1-1.127-1.336l.582-.562c.193-.193.385-.39.573-.592l.359-.39c1.752-1.942 2.937-3.844 3.476-5.357.29-.811.37-1.444.31-1.884-.055-.404-.216-.61-.446-.731l-.003-.002c-.248-.132-.663-.207-1.293-.114-.62.09-1.37.332-2.208.73l-.083.034a.876.876 0 0 1-.667-1.615l.351-.161c.819-.36 1.616-.612 2.353-.72Zm-5.292 7.507a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM5.544 2.971c.823-.112 1.756.056 2.707.395 1.911.682 4.17 2.154 6.356 4.207.214.201.426.406.632.612l.604.625.057.068a.875.875 0 0 1-1.271 1.19l-.065-.063-.562-.582c-.193-.193-.39-.385-.592-.573-2.077-1.95-4.133-3.26-5.747-3.835-.811-.29-1.444-.37-1.884-.31-.404.055-.61.215-.731.444l-.002.004c-.132.248-.207.664-.114 1.294.08.543.275 1.184.588 1.898l.142.31.034.083a.875.875 0 0 1-1.572.746l-.043-.079-.161-.352c-.36-.819-.612-1.615-.72-2.352-.122-.832-.073-1.67.302-2.372.431-.814 1.185-1.242 2.042-1.358Z"></path>
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons (right side, row 2) -->
                <div class="flex items-center justify-self-end col-start-3 row-start-2">
                  
                  <!-- Model Selection Component -->
                  <ModelSelector
                    :models="models"
                    :selected-model="selectedModel"
                    best-model-text="Лучший"
                    @update:selected-model="selectModel"
                    @update:best-model="handleBestModelToggle"
                  />

                  <!-- File Upload Button -->
                  <div class="flex items-center">
                    <button
                      type="button"
                      aria-label="Attach Files"
                      class="focus-visible:bg-offset-plus hover:bg-iridescent-tertiary text-quiet hover:text-foreground
                             font-sans focus:outline-none outline-none outline-transparent transition duration-300
                             ease-out select-none items-center relative group/button font-medium justify-center
                             text-center items-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150
                             whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8] hover:shadow-iridescent"
                      @click="triggerFileUpload"
                    >
                      <div class="flex items-center min-w-0 gap-0.5 justify-center">
                        <div class="flex shrink-0 items-center justify-center size-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5"></path>
                          </svg>
                        </div>
                      </div>
                    </button>
                    <input
                      ref="fileInputRef"
                      type="file"
                      multiple
                      accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      style="display: none;"
                      @change="handleFileSelect"
                    />
                  </div>

                  <!-- Submit Button -->
                  <div class="ml-2">
                    <button
                      type="button"
                      aria-label="Submit"
                      class="chat-submit-btn font-sans focus:outline-none outline-none
                             outline-transparent select-none items-center relative
                             group/button justify-center text-center items-center cursor-pointer
                             whitespace-nowrap inline-flex text-sm"
                      :class="isSubmitDisabled ? ' cursor-not-allowed' : ''"
                      :disabled="isSubmitDisabled"
                      @click="handleSubmit"
                    >
                      <div class="flex items-center min-w-0 gap-0.5 justify-center">
                        <div class="flex shrink-0 items-center justify-center size-4">
                          <svg v-if="isLoading"
                               class="animate-spin"
                               xmlns="http://www.w3.org/2000/svg"
                               width="16" height="16" viewBox="0 0 24 24"
                               fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                          </svg>
                          <svg v-else
                               xmlns="http://www.w3.org/2000/svg"
                               width="16" height="16" viewBox="0 0 24 24"
                               fill="none" stroke="currentColor" stroke-width="2"
                               stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agent Selection Component -->
        <AgentSelector
          :agents="enhancedAgents"
          :query="agentQuery"
          :visible="showAgentPopup"
          :position="cursorPosition"
          :selected-index="selectedAgentIndex"
          @select="selectAgent"
          @close="showAgentPopup = false"
        />

        <!-- Command Selection Popup -->
        <div v-if="showCommandPopup" 
             class="absolute bottom-full left-4 right-4 mb-2 bg-raised border border-subtler rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
          <div class="p-2">
            <div v-for="command in filteredCommands" 
                 :key="command.id"
                 class="px-3 py-2 hover:bg-offset-plus rounded cursor-pointer text-sm"
                 @click="selectCommand(command)">
              <div class="font-medium text-foreground">/{{ command.name }}</div>
              <div v-if="command.description" class="text-xs text-quiet">{{ command.description }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ModelSelector from '~/components/ui/ModelSelector.vue'
import AgentSelector from '~/components/ui/AgentSelector.vue'

// Props
const props = defineProps({
  models: {
    type: Array,
    default: () => [
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
    ]
  },
  agents: {
    type: Array,
    default: () => [
      { id: 'researcher', name: 'researcher', description: 'Expert in research and analysis', category: 'research' },
      { id: 'analyst', name: 'analyst', description: 'Data analysis and insights specialist', category: 'research' },
      { id: 'coder', name: 'coder', description: 'Programming and development specialist', category: 'development' },
      { id: 'architect', name: 'architect', description: 'System design and architecture expert', category: 'development' },
      { id: 'writer', name: 'writer', description: 'Content creation and writing expert', category: 'writing' },
      { id: 'editor', name: 'editor', description: 'Content editing and proofreading specialist', category: 'writing' },
      { id: 'assistant', name: 'assistant', description: 'General purpose AI assistant', category: 'general' },
      { id: 'helper', name: 'helper', description: 'Multi-purpose helper agent', category: 'general' }
    ]
  },
  commands: {
    type: Array,
    default: () => [
      { id: 'clear', name: 'clear', description: 'Clear the current conversation' },
      { id: 'help', name: 'help', description: 'Show available commands' },
      { id: 'summarize', name: 'summarize', description: 'Summarize the conversation' },
      { id: 'export', name: 'export', description: 'Export conversation to file' }
    ]
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Ask a question...'
  }
})

// Emits
const emit = defineEmits(['submit'])

// Refs
const editorRef = ref(null)
const fileInputRef = ref(null)

// State
const userInput = ref('')
const activeMode = ref('simple')
const selectedModel = ref(null)
const attachedFiles = ref([])
const showAgentPopup = ref(false)
const showCommandPopup = ref(false)
const agentQuery = ref('')
const commandQuery = ref('')
const isBestModelEnabled = ref(false)
const cursorPosition = ref({ x: 0, y: 0 })
const selectedAgentIndex = ref(0)

// Computed
const isSubmitDisabled = computed(() => {
  return !userInput.value.trim() || props.isLoading
})

const enhancedAgents = computed(() => {
  return props.agents.map(agent => ({
    ...agent,
    category: agent.category || 'general'
  }))
})

const filteredAgents = computed(() => {
  if (!agentQuery.value) return enhancedAgents.value
  return enhancedAgents.value.filter(agent =>
    agent.name.toLowerCase().includes(agentQuery.value.toLowerCase())
  )
})

const filteredCommands = computed(() => {
  if (!commandQuery.value) return props.commands
  return props.commands.filter(command => 
    command.name.toLowerCase().includes(commandQuery.value.toLowerCase())
  )
})

// Methods
const cleanText = (text) => {
  if (!text) return ''

  let cleaned = text

  // Remove HTML tags but preserve content
  cleaned = cleaned.replace(/<[^>]*>/g, '')

  // Remove markdown formatting while preserving content
  // Remove code blocks (```...```) but keep the content
  cleaned = cleaned.replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
  
  // Remove inline code (`...`) but keep the content
  cleaned = cleaned.replace(/`([^`]*)`/g, '$1')
  
  // Remove bold/italic formatting but keep the text
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2')
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2')
  
  // Remove headers (# ## ### etc.) but keep the text
  cleaned = cleaned.replace(/^#{1,6}\s+(.*)$/gm, '$1')
  
  // Remove links [text](url) and keep only the text
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1')
  // Remove reference links [text][ref]
  cleaned = cleaned.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
  
  // Remove strikethrough (~~text~~) but keep the text
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1')
  
  // Remove blockquotes (> text) but keep the text
  cleaned = cleaned.replace(/^>\s*(.*)$/gm, '$1')
  
  // Remove horizontal rules (--- or ***)
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '')
  
  // Remove list markers (- * + followed by space) but keep the text
  cleaned = cleaned.replace(/^[-*+]\s+(.*)$/gm, '$1')
  // Remove numbered lists (1. 2. etc.) but keep the text
  cleaned = cleaned.replace(/^\d+\.\s+(.*)$/gm, '$1')
  
  // Remove table formatting but preserve content
  cleaned = cleaned.replace(/\|/g, ' ')
  
  // Remove image references ![alt](url) but keep alt text
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1')

  // Clean up whitespace but preserve line breaks for readability
  // Replace multiple consecutive spaces with single space
  cleaned = cleaned.replace(/ +/g, ' ')
  // Replace multiple newlines with double newline (paragraph break)
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n')
  // Trim leading and trailing whitespace
  cleaned = cleaned.trim()

  return cleaned
}

const updateCursorPosition = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    cursorPosition.value = {
      x: rect.left,
      y: rect.top
    }
  }
}

const handleInput = (event) => {
  // Get the raw text directly from the contenteditable element
  const rawText = event.target.innerText || ''
  
  // Update userInput without cleaning - let user type freely
  userInput.value = rawText

  // Update cursor position for popup positioning
  updateCursorPosition()

  // Check for @ mention at the end of text (only for triggering suggestions)
  const atMatch = rawText.match(/@(\w*)$/)
  if (atMatch) {
    agentQuery.value = atMatch[1]
    showAgentPopup.value = true
    showCommandPopup.value = false
    // Reset selected index when popup opens
    selectedAgentIndex.value = 0
  } else {
    showAgentPopup.value = false
  }

  // Check for / command at the end of text
  const slashMatch = rawText.match(/\/(\w*)$/)
  if (slashMatch) {
    commandQuery.value = slashMatch[1]
    showCommandPopup.value = true
    showAgentPopup.value = false
  } else {
    showCommandPopup.value = false
  }
}

const handleKeydown = (event) => {
  // Handle agent/command popup navigation
  if (showAgentPopup.value || showCommandPopup.value) {
    if (event.key === 'Escape') {
      event.preventDefault()
      showAgentPopup.value = false
      showCommandPopup.value = false
      return
    }
    
    // Handle Tab key for agent selection - select currently highlighted agent
    if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      
      if (showAgentPopup.value && filteredAgents.value.length > 0) {
        // Select the currently highlighted agent
        selectAgent(filteredAgents.value[selectedAgentIndex.value])
      }
      return
    }
    
    // Handle Arrow keys for navigation
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      
      if (showAgentPopup.value && filteredAgents.value.length > 0) {
        selectedAgentIndex.value = selectedAgentIndex.value === 0
          ? filteredAgents.value.length - 1
          : selectedAgentIndex.value - 1
      }
      return
    }
    
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      
      if (showAgentPopup.value && filteredAgents.value.length > 0) {
        selectedAgentIndex.value = (selectedAgentIndex.value + 1) % filteredAgents.value.length
      }
      return
    }
    
    // Handle Enter key for selection
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      
      if (showAgentPopup.value && filteredAgents.value.length > 0) {
        selectAgent(filteredAgents.value[selectedAgentIndex.value])
      }
      return
    }
  }
  
  if (event.key === 'Enter' && !event.shiftKey && !showAgentPopup.value && !showCommandPopup.value) {
    event.preventDefault()
    handleSubmit()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  
  // Get the pasted text from clipboard
  const clipboardData = event.clipboardData || window.clipboardData
  const pastedText = clipboardData.getData('text/plain')
  
  // Clean the pasted text
  const cleanedText = cleanText(pastedText)
  
  // Simple approach: just set the cleaned text and update
  if (cleanedText) {
    // Get current content and cursor position
    const currentText = editorRef.value.innerText || ''
    const selection = window.getSelection()
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const startOffset = range.startOffset
      const endOffset = range.endOffset
      
      // Insert cleaned text at cursor position
      const beforeCursor = currentText.substring(0, startOffset)
      const afterCursor = currentText.substring(endOffset)
      const newText = beforeCursor + cleanedText + afterCursor
      
      // Update the editor content
      editorRef.value.innerText = newText
      
      // Set cursor position after inserted text
      nextTick(() => {
        const newCursorPos = startOffset + cleanedText.length
        const newRange = document.createRange()
        const textNode = editorRef.value.firstChild || editorRef.value
        
        if (textNode.nodeType === Node.TEXT_NODE) {
          newRange.setStart(textNode, Math.min(newCursorPos, textNode.textContent.length))
          newRange.setEnd(textNode, Math.min(newCursorPos, textNode.textContent.length))
        } else {
          newRange.selectNodeContents(editorRef.value)
          newRange.collapse(false)
        }
        
        selection.removeAllRanges()
        selection.addRange(newRange)
      })
    } else {
      // No selection, just append to current content
      const newText = currentText + cleanedText
      editorRef.value.innerText = newText
    }
    
    // Update the reactive value
    userInput.value = editorRef.value.innerText
  }
}

const selectMode = (mode) => {
  activeMode.value = mode
}

const selectAgent = (agent) => {
  const text = userInput.value
  const newText = text.replace(/@\w*$/, `@${agent.name} `)
  
  // Update both the reactive value and the DOM element
  userInput.value = newText
  editorRef.value.innerText = newText
  
  // Close the popup
  showAgentPopup.value = false
  
  // Set cursor to end and focus
  nextTick(() => {
    editorRef.value.focus()
    
    // Move cursor to end
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  })
}

const selectCommand = (command) => {
  const text = userInput.value
  const newText = text.replace(/\/\w*$/, `/${command.name} `)
  
  // Update both the reactive value and the DOM element
  userInput.value = newText
  editorRef.value.innerText = newText
  
  // Close the popup
  showCommandPopup.value = false
  
  // Set cursor to end and focus
  nextTick(() => {
    editorRef.value.focus()
    
    // Move cursor to end
    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  })
}

const selectModel = (model) => {
  selectedModel.value = model
}

const handleBestModelToggle = (enabled) => {
  isBestModelEnabled.value = enabled
  // You can add logic here to handle best model selection
  // For example, automatically select the best model when enabled
  if (enabled && props.models.length > 0) {
    // Assuming the first model is the "best" one, or you can implement your own logic
    selectedModel.value = props.models[0]
  }
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  attachedFiles.value = [...attachedFiles.value, ...files]
}

const handleSubmit = () => {
  if (isSubmitDisabled.value) return

  // Clean the text only when submitting, not during typing
  const cleanedText = cleanText(userInput.value)

  emit('submit', {
    userInput: cleanedText,
    mode: activeMode.value,
    model: selectedModel.value,
    files: attachedFiles.value
  })

  // Reset form
  userInput.value = ''
  editorRef.value.innerText = ''
  attachedFiles.value = []
  showAgentPopup.value = false
  showCommandPopup.value = false
}

// Click outside handler
const handleClickOutside = (event) => {
  if (!event.target.closest('.ai-chat-form')) {
    showAgentPopup.value = false
    showCommandPopup.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Set default model if available
  if (props.models.length > 0 && !selectedModel.value) {
    selectedModel.value = props.models[0]
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for external loading state changes
watch(() => props.isLoading, (newVal) => {
  if (!newVal) {
    // Focus back to input when loading is done
    nextTick(() => {
      editorRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.segmented-control {
  transition: all 0.3s ease;
}

.segmented-control:hover {
  background-color: oklch(var(--offset-plus-color));
}

/* Custom scrollbar for popups */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--foreground-color) / .15) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: oklch(var(--foreground-color) / .15);
  border-radius: 3px;
}
</style>