<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible && hasVisibleAgents"
        ref="menuRef"
        aria-label="Agent selection menu"
        role="listbox"
        :style="menuStyle"
        class="fixed z-50 outline-none"
        @keydown="handleKeydown"
        tabindex="-1"
      >
        <!-- Desktop Menu -->
        <div class="hidden md:block">
          <div class="shadow-overlay p-xs scrollable-container scrollbar overflow-y-auto overflow-x-hidden rounded-xl border-subtlest ring-subtlest divide-subtlest bg-base"
               style="width: 240px; min-width: 240px; max-height: 245px;">
            <div role="menu" class="p-xs flex flex-col gap-px">
              
              <!-- Research Section -->
              <template v-if="filteredAgentsByCategory.research.length > 0">
                <div class="sm:mx-sm my-sm border-b first:hidden border-subtlest ring-subtlest divide-subtlest bg-transparent"></div>
                <div class="sm:mx-sm mt-xs mb-sm pr-sm border-subtlest ring-subtlest divide-subtlest bg-base">
                  <div class="w-max font-mono text-2xs md:text-xs text-quiet selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    Research
                  </div>
                </div>
                <AgentItem
                  v-for="(agent, index) in filteredAgentsByCategory.research"
                  :key="agent.id"
                  :agent="agent"
                  :is-selected="props.selectedIndex === getGlobalIndex('research', index)"
                  @select="selectAgent"
                />
              </template>

              <!-- Development Section -->
              <template v-if="filteredAgentsByCategory.development.length > 0">
                <div class="sm:mx-sm my-sm border-b first:hidden border-subtlest ring-subtlest divide-subtlest bg-transparent"></div>
                <div class="sm:mx-sm mt-xs mb-sm pr-sm border-subtlest ring-subtlest divide-subtlest bg-base">
                  <div class="w-max font-mono text-2xs md:text-xs text-quiet selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    Development
                  </div>
                </div>
                <AgentItem
                  v-for="(agent, index) in filteredAgentsByCategory.development"
                  :key="agent.id"
                  :agent="agent"
                  :is-selected="props.selectedIndex === getGlobalIndex('development', index)"
                  @select="selectAgent"
                />
              </template>

              <!-- Writing Section -->
              <template v-if="filteredAgentsByCategory.writing.length > 0">
                <div class="sm:mx-sm my-sm border-b first:hidden border-subtlest ring-subtlest divide-subtlest bg-transparent"></div>
                <div class="sm:mx-sm mt-xs mb-sm pr-sm border-subtlest ring-subtlest divide-subtlest bg-base">
                  <div class="w-max font-mono text-2xs md:text-xs text-quiet selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    Writing
                  </div>
                </div>
                <AgentItem
                  v-for="(agent, index) in filteredAgentsByCategory.writing"
                  :key="agent.id"
                  :agent="agent"
                  :is-selected="props.selectedIndex === getGlobalIndex('writing', index)"
                  @select="selectAgent"
                />
              </template>

              <!-- General Section -->
              <template v-if="filteredAgentsByCategory.general.length > 0">
                <div class="sm:mx-sm my-sm border-b first:hidden border-subtlest ring-subtlest divide-subtlest bg-transparent"></div>
                <div class="sm:mx-sm mt-xs mb-sm pr-sm border-subtlest ring-subtlest divide-subtlest bg-base">
                  <div class="w-max font-mono text-2xs md:text-xs text-quiet selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    General
                  </div>
                </div>
                <AgentItem
                  v-for="(agent, index) in filteredAgentsByCategory.general"
                  :key="agent.id"
                  :agent="agent"
                  :is-selected="props.selectedIndex === getGlobalIndex('general', index)"
                  @select="selectAgent"
                />
              </template>

            </div>
          </div>
        </div>

        <!-- Mobile Bottom Sheet -->
        <div class="md:hidden fixed inset-0 bg-backdrop/70 backdrop-blur-sm" @click="closeMenu">
          <div class="absolute bottom-0 left-0 right-0 bg-base rounded-t-xl border-t border-subtlest max-h-[80vh] overflow-hidden"
               @click.stop>
            <!-- Mobile header -->
            <div class="flex items-center justify-between p-4 border-b border-subtlest">
              <h3 class="text-lg font-medium text-foreground">Select Agent</h3>
              <button
                @click="closeMenu"
                class="p-2 rounded-lg hover:bg-offset-plus text-quiet hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <!-- Mobile content -->
            <div class="overflow-y-auto scrollbar-subtle max-h-[calc(80vh-80px)] p-4">
              <!-- Mobile sections (simplified layout) -->
              <template v-for="category in ['research', 'development', 'writing', 'general']" :key="category">
                <div v-if="filteredAgentsByCategory[category].length > 0" class="mb-6">
                  <h4 class="text-sm font-medium text-quiet mb-3 capitalize">{{ category }}</h4>
                  <div class="space-y-2">
                    <button
                      v-for="agent in filteredAgentsByCategory[category]"
                      :key="agent.id"
                      @click="selectAgent(agent)"
                      class="w-full text-left p-3 rounded-lg hover:bg-offset-plus transition-colors"
                    >
                      <div class="font-medium text-foreground">@{{ agent.name }}</div>
                      <div v-if="agent.description" class="text-sm text-quiet mt-1">{{ agent.description }}</div>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Custom debounce function
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Agent Item Component
const AgentItem = {
  props: {
    agent: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'mouseenter'],
  template: `
    <div 
      role="menuitem" 
      class="group/item md:h-full"
      @mouseenter="$emit('mouseenter')"
    >
      <div 
        :class="[
          'relative select-none rounded-lg transition-all duration-300 px-sm py-1.5 md:h-full cursor-pointer',
          isSelected ? 'bg-subtler' : 'hover:bg-subtler'
        ]"
        @click="$emit('select', agent)"
      >
        <div class="flex gap-sm">
          <div class="flex-1">
            <div class="flex flex-col gap-y-0.5">
              <div class="font-sans text-sm text-foreground selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                <span class="inline-flex min-w-0 items-center align-top max-w-[208px]" spellcheck="false">
                  <span class="inline-block min-w-0 truncate font-sans text-[13px] text-foreground selection:bg-super/50 selection:text-foreground dark:selection:bg-super/10 dark:selection:text-super">
                    @{{ agent.name }}
                  </span>
                </span>
              </div>
              <div v-if="agent.description" class="text-xs text-quiet">{{ agent.description }}</div>
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
              :class="['tabler-icon tabler-icon-check tabler-icon', isSelected ? 'opacity-100' : 'opacity-0']"
            >
              <path d="M5 12l5 5l10 -10"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `
}

// Props
const props = defineProps({
  agents: {
    type: Array,
    default: () => []
  },
  query: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  selectedIndex: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['select', 'close'])

// Refs
const menuRef = ref(null)

// Computed
const filteredAgentsByCategory = computed(() => {
  const filtered = props.agents.filter(agent => 
    agent.name.toLowerCase().includes(props.query.toLowerCase())
  )
  
  return {
    research: filtered.filter(a => a.category === 'research'),
    development: filtered.filter(a => a.category === 'development'), 
    writing: filtered.filter(a => a.category === 'writing'),
    general: filtered.filter(a => a.category === 'general')
  }
})

const flattenedAgents = computed(() => {
  return [
    ...filteredAgentsByCategory.value.research,
    ...filteredAgentsByCategory.value.development,
    ...filteredAgentsByCategory.value.writing,
    ...filteredAgentsByCategory.value.general
  ]
})

const hasVisibleAgents = computed(() => {
  return flattenedAgents.value.length > 0
})

const menuStyle = computed(() => {
  const { x, y } = props.position
  const offset = 8
  
  return {
    left: `${x}px`,
    top: `${y - offset}px`,
    transform: 'translateY(-100%)'
  }
})

// Methods
const getGlobalIndex = (category, localIndex) => {
  let globalIndex = 0
  
  const categories = ['research', 'development', 'writing', 'general']
  const targetCategoryIndex = categories.indexOf(category)
  
  for (let i = 0; i < targetCategoryIndex; i++) {
    globalIndex += filteredAgentsByCategory.value[categories[i]].length
  }
  
  return globalIndex + localIndex
}

const selectAgent = (agent) => {
  emit('select', agent)
}

const closeMenu = () => {
  emit('close')
}

const handleKeydown = (event) => {
  // Keyboard handling is now done in FullAiChat.vue
  // This component just displays the visual state
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    closeMenu()
  }
}

// Watchers - removed since selectedIndex is now managed by parent

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom scrollbar styles */
.scrollbar {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--foreground-color) / .15) transparent;
}

.scrollbar::-webkit-scrollbar {
  width: 6px;
}

.scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: oklch(var(--foreground-color) / .15);
  border-radius: 3px;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: oklch(var(--foreground-color) / .25);
}

/* Ensure proper z-index layering */
.scrollable-container {
  position: relative;
  z-index: 1;
}
</style>