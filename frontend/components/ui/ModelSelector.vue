<template>
  <Popover
    v-model:open="isOpen"
    side="bottom"
    align="end"
    :side-offset="8"
    mobile-title="Select Model"
    content-class="min-w-48"
  >
    <template #trigger="{ open }">
      <button
        type="button"
        aria-label="Select Model"
        class="focus-visible:bg-offset-plus hover:bg-offset-plus text-quiet hover:text-foreground
               max-w-24 sm:max-w-none font-sans focus:outline-none outline-none outline-transparent
               transition duration-300 ease-out select-none items-center relative group/button
               font-medium justify-center text-center items-center rounded-lg cursor-pointer
               active:scale-[0.97] active:duration-150 whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8]
               hover:shadow-iridescent transition-shadow"
      >
        <div class="flex items-center min-w-0 gap-0.5 justify-center">
          <div class="flex shrink-0 items-center justify-center size-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 5m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"></path>
              <path d="M9 9h6v6h-6z"></path>
              <path d="M3 10h2"></path>
              <path d="M3 14h2"></path>
              <path d="M10 3v2"></path>
              <path d="M14 3v2"></path>
              <path d="M21 10h-2"></path>
              <path d="M21 14h-2"></path>
              <path d="M14 21v-2"></path>
              <path d="M10 21v-2"></path>
            </svg>
          </div>
        </div>
      </button>
    </template>

    <template #content="{ close }">
      <div role="menu" class="p-xs flex flex-col gap-px">
        <!-- Best Model Option with Toggle -->
        <div role="menuitem" class="group/item md:h-full" data-state="closed">
          <div class="relative select-none rounded-lg transition-all duration-300 px-sm py-1.5 md:h-full hover:bg-subtler cursor-pointer">
            <div class="flex gap-sm">
              <div class="flex-1">
                <div class="flex flex-col gap-y-0.5">
                  <div class="flex items-center gap-x-1.5 font-sans text-[13px] text-foreground selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    <span>{{ bestModelText }}</span>
                  </div>
                </div>
              </div>
              <div class="gap-x-sm flex items-start pt-0.5">
                <div class="group/switch gap-sm flex cursor-default items-center cursor-pointer">
                  <button 
                    class="group/switch gap-sm flex items-center flex rounded-full duration-150 shadow-inset-xs w-5 h-3.5 p-0.5 data-[state=checked]:justify-end data-[state=checked]:bg-super dark:data-[state=checked]:bg-super/85 data-[state=unchecked]:bg-inverse/45 dark:data-[state=unchecked]:bg-inverse/20" 
                    type="button" 
                    role="switch" 
                    :aria-checked="isBestModelEnabled"
                    :data-state="isBestModelEnabled ? 'checked' : 'unchecked'"
                    @click="toggleBestModel"
                  >
                    <div 
                      class="rounded-full relative bg-base dark:bg-inverse dark:text-foreground size-2.5 before:content-[''] before:duration-150 dark:before:shadow-md before:absolute before:inset-0 before:rounded-full before:bg-base before:dark:bg-white transition-transform duration-150"
                      :class="isBestModelEnabled ? 'translate-x-1.5' : 'translate-x-0'"
                      :data-state="isBestModelEnabled ? 'checked' : 'unchecked'"
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Separator -->
        <div class="sm:mx-sm my-sm border-b first:hidden border-subtlest ring-subtlest divide-subtlest bg-transparent"></div>

        <!-- Model Options -->
        <div 
          v-for="model in models" 
          :key="model.id"
          role="menuitem" 
          class="group/item md:h-full" 
          data-state="closed"
        >
          <div 
            class="relative select-none rounded-lg transition-all duration-300 px-sm py-1.5 md:h-full hover:bg-subtler cursor-pointer"
            @click="selectModel(model, close)"
          >
            <div class="flex gap-sm">
              <div class="flex-1">
                <div class="flex flex-col gap-y-0.5">
                  <div class="flex items-center gap-x-1.5 font-sans text-[13px] text-foreground selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    <span>{{ model.name }}</span>
                    <div 
                      v-if="model.badge"
                      class="px-xs rounded-badge -mt-px box-border inline-flex border border-max"
                    >
                      <span class="leading-4 font-sans text-xs font-medium text-max selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                        {{ model.badge }}
                      </span>
                    </div>
                  </div>
                  <div 
                    v-if="model.description"
                    class="text-xs text-quieter"
                  >
                    {{ model.description }}
                  </div>
                </div>
              </div>
              <div class="size-5 font-sans text-base text-foreground selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  class="tabler-icon tabler-icon-check transition-opacity duration-150"
                  :class="selectedModel?.id === model.id ? 'opacity-100' : 'opacity-0'"
                >
                  <path d="M5 12l5 5l10 -10"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Popover>
</template>

<script setup>
import { ref, computed } from 'vue'
import Popover from './Popover.vue'

const props = defineProps({
  models: {
    type: Array,
    default: () => []
  },
  selectedModel: {
    type: Object,
    default: null
  },
  bestModelText: {
    type: String,
    default: 'Лучший'
  }
})

const emit = defineEmits(['update:selectedModel', 'update:bestModel'])

const isOpen = ref(false)
const isBestModelEnabled = ref(false)

const selectModel = (model, close) => {
  emit('update:selectedModel', model)
  close()
}

const toggleBestModel = () => {
  isBestModelEnabled.value = !isBestModelEnabled.value
  emit('update:bestModel', isBestModelEnabled.value)
}
</script>

<style scoped>
/* Additional styles if needed */
.shadow-inset-xs {
  box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>