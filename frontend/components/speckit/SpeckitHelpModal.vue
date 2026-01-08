<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleClickOutside"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div
          ref="modalRef"
          class="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          @click.stop
          tabindex="-1"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 :id="modalTitleId" class="text-2xl font-bold text-white">{{ instructions.title }}</h2>
            <button
              ref="closeButtonRef"
              @click="close"
              class="text-gray-400 hover:text-white transition-colors"
              title="Закрыть"
              aria-label="Закрыть окно инструкции"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <div
              v-for="(section, index) in instructions.sections"
              :key="index"
              class="mb-6 last:mb-0"
            >
              <h3 class="text-lg font-semibold text-purple-400 mb-2">{{ section.heading }}</h3>
              <div class="prose prose-invert prose-sm max-w-none text-gray-300">
                <MDC :value="section.content" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { SpeckitUsageInstructions } from '~/types/article'

// Props
const props = defineProps<{
  modelValue: boolean
  instructions: SpeckitUsageInstructions
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Refs
const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previousActiveElement = ref<HTMLElement | null>(null)

// Generate unique ID for modal title
const modalTitleId = `speckit-help-modal-title-${Math.random().toString(36).substr(2, 9)}`

// Focus trap handler
const handleTabKey = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !modalRef.value) return

  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
}

// Close handler
const close = () => {
  emit('update:modelValue', false)
}

// Click outside handler
const handleClickOutside = () => {
  close()
}

// Escape key handler
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('keydown', handleTabKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('keydown', handleTabKey)
  // Restore focus when modal is unmounted
  if (previousActiveElement.value) {
    previousActiveElement.value.focus()
  }
})

// Prevent body scroll when modal is open and manage focus
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    // Save current focused element
    previousActiveElement.value = document.activeElement as HTMLElement
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    // Focus the close button after modal is rendered
    await nextTick()
    closeButtonRef.value?.focus()
  } else {
    // Restore body scroll
    document.body.style.overflow = ''
    // Restore focus to trigger element
    if (previousActiveElement.value) {
      previousActiveElement.value.focus()
    }
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
