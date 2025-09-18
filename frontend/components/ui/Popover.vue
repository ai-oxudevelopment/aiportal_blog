<template>
  <PopoverRoot v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot name="trigger" :open="isOpen" />
    </PopoverTrigger>
    
    <PopoverPortal>
      <PopoverContent
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :align-offset="alignOffset"
        :avoid-collisions="avoidCollisions"
        :collision-padding="collisionPadding"
        :class="[
          'z-50 outline-none',
          // Desktop styles
          'hidden md:block',
          'shadow-overlay flex min-h-0 min-w-0',
          'data-[placement=bottom-end]:origin-top-right data-[placement=bottom-start]:origin-top-left',
          'data-[placement=top-end]:origin-bottom-right data-[placement=top-start]:origin-bottom-left',
          'duration-150 p-xs animate-in fade-in zoom-in-[0.97] ease-out',
          'rounded-xl border-subtlest ring-subtlest divide-subtlest bg-base',
          contentClass
        ]"
        @escape-key-down="handleEscapeKeyDown"
        @pointer-down-outside="handlePointerDownOutside"
      >
        <div class="max-h-[40vh] border-subtlest ring-subtlest divide-subtlest bg-transparent overflow-hidden">
          <div class="flex h-full flex-col max-h-[40vh]">
            <div class="w-full min-h-0 flex-1 overflow-y-auto scrollbar-subtle">
              <div class="min-w-full">
                <slot name="content" :close="closePopover" />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </PopoverPortal>

    <!-- Mobile Bottom Sheet -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="md:hidden fixed inset-0 z-50 bg-backdrop/70 backdrop-blur-sm"
          @click="closePopover"
        >
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-y-full"
            enter-to-class="translate-y-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-y-0"
            leave-to-class="translate-y-full"
          >
            <div
              v-if="isOpen"
              class="absolute bottom-0 left-0 right-0 bg-base rounded-t-xl border-t border-subtlest max-h-[80vh] overflow-hidden"
              @click.stop
            >
              <!-- Mobile header -->
              <div class="flex items-center justify-between p-4 border-b border-subtlest">
                <h3 class="text-lg font-medium text-foreground">{{ mobileTitle || 'Select Option' }}</h3>
                <button
                  @click="closePopover"
                  class="p-2 rounded-lg hover:bg-offset-plus text-quiet hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <!-- Mobile content -->
              <div class="overflow-y-auto scrollbar-subtle max-h-[calc(80vh-80px)]">
                <slot name="content" :close="closePopover" />
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </PopoverRoot>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
} from 'radix-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  side: {
    type: String,
    default: 'bottom'
  },
  align: {
    type: String,
    default: 'end'
  },
  sideOffset: {
    type: Number,
    default: 8
  },
  alignOffset: {
    type: Number,
    default: 0
  },
  avoidCollisions: {
    type: Boolean,
    default: true
  },
  collisionPadding: {
    type: Number,
    default: 8
  },
  contentClass: {
    type: String,
    default: ''
  },
  mobileTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:open', 'close'])

const isOpen = ref(props.open)

watch(() => props.open, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:open', newValue)
  if (!newValue) {
    emit('close')
  }
})

const closePopover = () => {
  isOpen.value = false
}

const handleEscapeKeyDown = () => {
  closePopover()
}

const handlePointerDownOutside = () => {
  closePopover()
}
</script>

<style scoped>
/* Custom scrollbar styles are already defined in perplexity-theme.css */
</style>