<template>
  <div class="fixed bottom-4 left-0 right-0 z-50 mx-auto h-[48px] w-[225px] transition [transition:transform_500ms,opacity_200ms,left_200ms,width_400ms] focus-within:w-[355px] hover:scale-105 focus-within:hover:scale-100 translate-y-0 opacity-100 animate-gradient-background pointer-events-auto">
    <form class="relative" @submit.prevent="handleSubmit">
      <label class="shadow-black-4 bg-gradient-animated relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl hover:shadow-iridescent transition-shadow duration-300 items-center">
        <div
          ref="editorRef"
          class="placeholder:text-primary-60 text-nav-mobile md:text-p2 h-md pl-3 w-full bg-transparent focus:outline-none"
          contenteditable="true"
          role="textbox"
          spellcheck="true"
          :aria-placeholder="displayText || staticText"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @paste="handlePaste"
          style="user-select: text; white-space: pre-wrap; word-break: break-word; min-height: 1.5em;"
        ></div>
        
        <!-- Placeholder -->
        <div v-if="!userInput" class="absolute left-5 pointer-events-none select-none text-primary-60 placeholder-container">
          {{ displayText || staticText }}
        </div>
        
        <button
          class="ml-2 flex-none rounded-full h-10 w-10 bg-offset text-foreground/80 hover:bg-offset-plus hover:text-foreground transition shadow-sm hover:shadow-iridescent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          type="submit"
          aria-label="Send prompt to ChatGPT"
        >
          <svg class="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"></path>
            <path d="M5 12l7-7 7 7"></path>
          </svg>
        </button>
      </label>
      
      <!-- Agent Selection Component -->
      <AgentSelector
        :agents="enhancedAgents"
        :query="agentQuery"
        :visible="showAgentPopup"
        :position="cursorPosition"
        @select="selectAgent"
        @close="showAgentPopup = false"
      />
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AgentSelector from '~/components/ui/AgentSelector.vue'

// Props
const props = defineProps({
  staticText: {
    type: String,
    default: 'Ask ChatGPT'
  },
  previewText: {
    type: String,
    default: 'What can I help you with today?'
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
  }
})

// Router for navigation
const router = useRouter()

// Refs
const editorRef = ref(null)

// State
const userInput = ref('')
const displayText = ref('')
const currentIndex = ref(0)
const isErasing = ref(false)
const animationTimer = ref(null)
const initialDelayTimer = ref(null)

// Agent selection state
const showAgentPopup = ref(false)
const agentQuery = ref('')
const cursorPosition = ref({ x: 0, y: 0 })
const selectedAgents = ref([])

// Animation configuration
const TYPING_SPEED = 100 // milliseconds per character
const ERASING_SPEED = 50 // milliseconds per character
const PAUSE_AFTER_TYPING = 2000 // pause after typing complete
const PAUSE_AFTER_ERASING = 1000 // pause after erasing complete
const INITIAL_DELAY = 5000 // 5 seconds initial delay

// Computed
const enhancedAgents = computed(() => {
  return props.agents.map(agent => ({
    ...agent,
    category: agent.category || 'general'
  }))
})

// Methods
const truncateAgentName = (name, maxLength = 15) => {
  if (name.length <= maxLength) {
    return name
  }
  return name.substring(0, maxLength) + '...'
}

const createAgentSpan = (agent) => {
  const truncatedName = truncateAgentName(agent.name)
  const span = document.createElement('span')
  span.setAttribute('data-lexical-decorator', 'true')
  span.setAttribute('contenteditable', 'false')
  span.setAttribute('data-agent-id', agent.id)
  span.setAttribute('data-agent-name', agent.name)
  
  // Clean, subtle styling similar to the reference screenshot
  span.innerHTML = `
    <span class="agent-mention-span" spellcheck="false" style="display: inline-flex; align-items: center; padding: 1px 6px; margin: 0 1px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 4px; color: rgb(59, 130, 246); font-size: inherit; line-height: inherit; vertical-align: baseline;">
      <span style="margin-right: 2px;">@</span><span>${truncatedName}</span>
    </span>
  `
  
  return span
}

const insertAgentSpan = (agent) => {
  const selection = window.getSelection()
  if (!selection.rangeCount) return
  
  const text = userInput.value
  const atMatch = text.match(/@\w*$/)
  if (atMatch) {
    const matchStart = text.lastIndexOf(atMatch[0])
    const beforeMatch = text.substring(0, matchStart)
    const afterMatch = text.substring(matchStart + atMatch[0].length)
    
    // Update the editor content
    editorRef.value.innerHTML = ''
    
    // Add text before the agent
    if (beforeMatch) {
      const textNode = document.createTextNode(beforeMatch)
      editorRef.value.appendChild(textNode)
    }
    
    // Add the agent span
    const agentSpan = createAgentSpan(agent)
    editorRef.value.appendChild(agentSpan)
    
    // Add a space after the agent span
    const spaceNode = document.createTextNode(' ')
    editorRef.value.appendChild(spaceNode)
    
    // Add text after (if any)
    if (afterMatch) {
      const afterTextNode = document.createTextNode(afterMatch)
      editorRef.value.appendChild(afterTextNode)
    }
    
    // Update userInput to reflect the new content
    userInput.value = beforeMatch + `@${agent.name} ` + afterMatch
    
    // Track the selected agent
    selectedAgents.value.push({
      id: agent.id,
      name: agent.name,
      element: agentSpan
    })
    
    // Position cursor after the space
    nextTick(() => {
      const newRange = document.createRange()
      const selection = window.getSelection()
      
      // Find the space node after our span
      const spaceNodeAfterSpan = agentSpan.nextSibling
      if (spaceNodeAfterSpan && spaceNodeAfterSpan.nodeType === Node.TEXT_NODE) {
        newRange.setStart(spaceNodeAfterSpan, 1) // After the space
        newRange.setEnd(spaceNodeAfterSpan, 1)
      } else {
        // Fallback: position at the end
        newRange.selectNodeContents(editorRef.value)
        newRange.collapse(false)
      }
      
      selection.removeAllRanges()
      selection.addRange(newRange)
      editorRef.value.focus()
    })
  }
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

  // Clean up any orphaned agent spans (if user deleted part of the text)
  const agentSpans = event.target.querySelectorAll('[data-agent-id]')
  selectedAgents.value = selectedAgents.value.filter(agent => {
    const spanExists = Array.from(agentSpans).some(span =>
      span.getAttribute('data-agent-id') === agent.id
    )
    return spanExists
  })

  // Check for @ mention at the end of text (only for triggering suggestions)
  // Make sure we're not inside an agent span
  const selection = window.getSelection()
  let isInsideAgentSpan = false
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    let node = range.startContainer
    while (node && node !== event.target) {
      if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-agent-id')) {
        isInsideAgentSpan = true
        break
      }
      node = node.parentNode
    }
  }

  if (!isInsideAgentSpan) {
    const atMatch = rawText.match(/@(\w*)$/)
    if (atMatch) {
      agentQuery.value = atMatch[1]
      showAgentPopup.value = true
    } else {
      showAgentPopup.value = false
    }
  } else {
    // Inside agent span, don't show popups
    showAgentPopup.value = false
  }
}

const handleSubmit = () => {
  // Navigate to /research/{randomUUID} page
  const randomUUID = crypto.randomUUID();
  router.push(`/research/${randomUUID}`);
}

const handleFocus = () => {
  // Stop animation when user focuses on input
  stopAnimation()
  displayText.value = ''
}

const selectAgent = (agent) => {
  // Use the new span highlighting system
  insertAgentSpan(agent)
  
  // Close the popup
  showAgentPopup.value = false
}

const handleKeydown = (event) => {
  // Handle agent popup navigation
  if (showAgentPopup.value) {
    if (event.key === 'Escape') {
      event.preventDefault()
      showAgentPopup.value = false
      return
    }
    
    // Handle Tab key for agent selection
    if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      // The AgentSelector will handle the Tab key and call selectAgent
      return
    }
    
    // Handle Arrow keys and Enter - let them bubble up to AgentSelector
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
  }
  
  if (event.key === 'Enter' && !showAgentPopup.value) {
    event.preventDefault()
    handleSubmit()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  
  // Get the pasted text from clipboard
  const clipboardData = event.clipboardData || window.clipboardData
  const pastedText = clipboardData.getData('text/plain')
  
  // Simple approach: just insert the plain text
  if (pastedText) {
    // Get current content and cursor position
    const currentText = editorRef.value.innerText || ''
    const selection = window.getSelection()
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const startOffset = range.startOffset
      const endOffset = range.endOffset
      
      // Insert text at cursor position
      const beforeCursor = currentText.substring(0, startOffset)
      const afterCursor = currentText.substring(endOffset)
      const newText = beforeCursor + pastedText + afterCursor
      
      // Update the editor content
      editorRef.value.innerText = newText
      
      // Set cursor position after inserted text
      nextTick(() => {
        const newCursorPos = startOffset + pastedText.length
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
      const newText = currentText + pastedText
      editorRef.value.innerText = newText
    }
    
    // Update the reactive value
    userInput.value = editorRef.value.innerText
  }
}

const startTypingAnimation = () => {
  if (!props.previewText) return
  
  const typeText = () => {
    if (currentIndex.value < props.previewText.length) {
      displayText.value = props.previewText.substring(0, currentIndex.value + 1)
      currentIndex.value++
      animationTimer.value = setTimeout(typeText, TYPING_SPEED)
    } else {
      // Finished typing, pause then start erasing
      animationTimer.value = setTimeout(startErasing, PAUSE_AFTER_TYPING)
    }
  }
  
  const startErasing = () => {
    isErasing.value = true
    const eraseText = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        displayText.value = props.previewText.substring(0, currentIndex.value)
        animationTimer.value = setTimeout(eraseText, ERASING_SPEED)
      } else {
        // Finished erasing, pause then start typing again
        isErasing.value = false
        animationTimer.value = setTimeout(typeText, PAUSE_AFTER_ERASING)
      }
    }
    eraseText()
  }
  
  // Start the animation
  typeText()
}

const stopAnimation = () => {
  if (animationTimer.value) {
    clearTimeout(animationTimer.value)
    animationTimer.value = null
  }
  if (initialDelayTimer.value) {
    clearTimeout(initialDelayTimer.value)
    initialDelayTimer.value = null
  }
}

const initializeAnimation = () => {
  // Reset animation state and show static text initially
  displayText.value = props.staticText
  currentIndex.value = 0
  isErasing.value = false
  
  // Start animation after initial delay
  initialDelayTimer.value = setTimeout(() => {
    startTypingAnimation()
  }, INITIAL_DELAY)
}

// Click outside handler
const handleClickOutside = (event) => {
  if (!event.target.closest('form')) {
    showAgentPopup.value = false
  }
}

// Lifecycle
onMounted(() => {
  initializeAnimation()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopAnimation()
  document.removeEventListener('click', handleClickOutside)
})

// Watch for previewText changes
watch(() => props.previewText, () => {
  stopAnimation()
  initializeAnimation()
})
</script>

<style scoped>
/* Gradient background animation */
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

/* Ensure placeholder text doesn't overflow */
.placeholder-container {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: calc(100% - 60px); /* Account for button width */
  transition: max-width 400ms ease;
}

/* Expand placeholder area when focused */
.placeholder-container:focus-within {
  max-width: calc(100% - 60px);
}

/* Clean, subtle agent mention styling */
:deep(.agent-mention-span) {
  transition: all 0.2s ease;
  user-select: all;
  -webkit-user-select: all;
  -moz-user-select: all;
  -ms-user-select: all;
}

:deep(.agent-mention-span:hover) {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
}

/* Prevent text selection within the span content */
:deep(.agent-mention-span *) {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Ensure proper focus styles */
:deep([contenteditable]:focus) {
  outline: none;
}
</style>