<template>
  <div class="@container ease-curve-sidebar sticky bottom-4 left-0 right-0 z-50 mx-auto h-[48px] w-[225px] transition [transition:transform_500ms,opacity_200ms,left_200ms,width_400ms] focus-within:w-[355px] hover:scale-105 focus-within:hover:scale-100 translate-y-0 opacity-100">
    <form class="relative" @submit.prevent="handleSubmit">
      <label class="shadow-black-4 bg-tertiary-60 relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl hover:shadow-iridescent transition-shadow duration-300 items-center">
        <input
          ref="inputRef"
          v-model="userInput"
          class="placeholder:text-primary-60 text-nav-mobile md:text-p2 h-md pl-3 w-full bg-transparent focus:outline-none"
          :placeholder="displayText || staticText"
          aria-label="Message ChatGPT"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />
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
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  staticText: {
    type: String,
    default: 'Ask ChatGPT'
  },
  previewText: {
    type: String,
    default: 'What can I help you with today?'
  }
})

// Router for navigation
const router = useRouter()

// Refs
const inputRef = ref(null)

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
const handleSubmit = () => {
  // Navigate to /research page with query if user entered text
  if (userInput.value.trim()) {
    router.push({
      path: '/research',
      query: { q: userInput.value.trim() }
    })
  } else {
    router.push('/research')
  }
}

const handleFocus = () => {
  // Stop animation when user focuses on input
  stopAnimation()
  displayText.value = ''
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
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
/* Component-specific styles if needed */
</style>