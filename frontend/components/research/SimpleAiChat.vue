<template>
  <div class="fixed bottom-10 right-0 left-0 z-50 mx-auto h-[48px] w-[325px] transition [transition:transform_500ms,opacity_200ms,left_200ms,width_400ms] focus-within:w-[400px] hover:scale-105 focus-within:hover:scale-100 translate-y-0 opacity-100 pointer-events-auto">
    <form class="relative animate-gradient-background" @submit.prevent="handleSubmit">
      <label class="shadow-black-4 bg-gradient-animated relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl hover:shadow-iridescent transition-shadow duration-300 items-center">
        <input
          ref="editorRef"
          v-model="userInput"
          class="placeholder:text-primary-60 text-nav-mobile md:text-p2 h-md pl-3 w-full bg-transparent focus:outline-none"
          contenteditable="true"
          role="textbox"
          spellcheck="true"
          :aria-placeholder="displayText || staticText"
          @keydown="handleKeydown"
          @blur="handleBlur"
          @paste="handlePaste"
          @click="handleClick"
          style="user-select: text; white-space: pre-wrap; word-break: break-word; min-height: 1.5em;"
        ></input>
        
        <!-- Placeholder/animation — только если не пишут -->
        <div v-if="!userInput && !editorIsActive"
           class="absolute left-5 pointer-events-none select-none text-primary-60 placeholder-container">
          {{ displayText || staticText }}
        </div>

        <button
          class="ml-2 flex-none rounded-[20px] h-10 w-10 bg-offset text-foreground/80 hover:bg-offset-plus hover:text-foreground transition shadow-sm hover:shadow-iridescent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          type="submit"
          @click="handleSubmit"
          aria-label="Send prompt to Chat"
        >
          <svg class="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"></path>
            <path d="M5 12l7-7 7 7"></path>
          </svg>
        </button>
      </label>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  staticText: {
    type: String,
    default: 'Попробовать в чате'
  },
  previewText: {
    type: String,
    default: 'Создать AI-агента'
  }
})

// Router for navigation
const router = useRouter()

// Refs
const editorRef = ref(null)
const editorIsActive = ref(false)

// State
const userInput = ref('')
const displayText = ref('')
const currentIndex = ref(0)
const isErasing = ref(false)
const animationTimer = ref(null)
const initialDelayTimer = ref(null)

// Animation configuration
const TYPING_SPEED = 100 // milliseconds per character
const ERASING_SPEED = 50 // milliseconds per character
const PAUSE_AFTER_TYPING = 2000 // pause after typing complete
const PAUSE_AFTER_ERASING = 1000 // pause after erasing complete
const INITIAL_DELAY = 5000 // 5 seconds initial delay

// Methods
const handleInput = (event) => {
  stopAnimation()
  displayText.value = ''
  editorIsActive.value = true
}

const handleClick = () => {
  stopAnimation()
  displayText.value = ''
  editorIsActive.value = true

  const rawText = event.target.innerText || ''
  userInput.value = rawText
}

const handleSubmit = () => {
  if (userInput.value.trim().length < 3) {
    return
  }

  const randomUUID = crypto.randomUUID();
  router.push(`/research/${randomUUID}`);
}

const handleKeydown = (event) => {

  if (event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  
  const clipboardData = event.clipboardData || window.clipboardData
  const pastedText = clipboardData.getData('text/plain')
  
  if (pastedText) {
    const currentText = editorRef.value.innerText || ''
    const selection = window.getSelection()
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const startOffset = range.startOffset
      const endOffset = range.endOffset
      
      const beforeCursor = currentText.substring(0, startOffset)
      const afterCursor = currentText.substring(endOffset)
      const newText = beforeCursor + pastedText + afterCursor
      
      editorRef.value.innerText = newText
      
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
      const newText = currentText + pastedText
      editorRef.value.innerText = newText
    }
    
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
        isErasing.value = false
        animationTimer.value = setTimeout(typeText, PAUSE_AFTER_ERASING)
      }
    }
    eraseText()
  }
  
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
  displayText.value = props.staticText
  currentIndex.value = 0
  isErasing.value = false
  
  initialDelayTimer.value = setTimeout(() => {
    startTypingAnimation()
  }, INITIAL_DELAY)
}

// Добавьте состояние "editorIsActive"
const handleBlur = () => {
  editorIsActive.value = True; // Вышли из режима ввода
  initializeAnimation();
}

// Lifecycle
onMounted(() => {
  initializeAnimation()
})

onUnmounted(() => {
  stopAnimation()
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

/* Ensure proper focus styles */
:deep([contenteditable]:focus) {
  outline: none;
}
</style>