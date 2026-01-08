<template>
  <div
    class="speckit-copy-command relative group"
    :class="[copied ? 'copied' : '']"
  >
    <button
      @click="handleCopy"
      :disabled="copied"
      :aria-busy="copied"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 disabled:bg-green-600/30 text-purple-400 hover:text-purple-300 disabled:text-green-400 transition-all duration-200 border border-purple-600/30 hover:border-purple-500/50 disabled:border-green-500/50 w-full"
      :title="copied ? 'Скопировано!' : 'Нажмите, чтобы скопировать команду'"
      :aria-label="copied ? 'Команда скопирована' : 'Скопировать команду wget'"
    >
      <!-- Icon: Copy / Check -->
      <svg v-if="!copied" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>

      <!-- Command text (truncated) -->
      <span class="flex-1 text-xs font-mono truncate text-left">
        {{ copied ? 'Скопировано!' : displayCommand }}
      </span>
    </button>

    <!-- Tooltip with full command (shows on hover) -->
    <div
      v-if="!copied"
      class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900/95 text-gray-100 text-xs rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-max max-w-md"
      role="tooltip"
    >
      <div class="font-mono text-xs">{{ command }}</div>
      <div class="text-gray-400 text-[10px] mt-1">Нажмите, чтобы скопировать</div>
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="absolute bottom-full left-0 mb-2 px-3 py-2 bg-red-900/95 text-white text-xs rounded-lg shadow-xl border border-red-700 z-50"
      role="alert"
      aria-live="assertive"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '~/composables/useClipboard'

// Props
const props = defineProps<{
  command: string
}>()

// Composables
const { copy, copied, error } = useClipboard()

// Display command (truncated)
const displayCommand = computed(() => {
  const maxLength = 40
  if (props.command.length <= maxLength) {
    return props.command
  }
  return `${props.command.substring(0, maxLength)}...`
})

// Copy handler
const handleCopy = async () => {
  if (copied.value) return

  const success = await copy(props.command)
  if (!success) {
    console.error('[SpeckitCopyCommand] Copy failed')
  }
}
</script>

<style scoped>
/* Smooth transitions */
.speckit-copy-command button {
  transition: all 0.2s ease;
}

.speckit-copy-command button:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);
}

.speckit-copy-command.copied button {
  animation: success-pulse 0.3s ease;
}

@keyframes success-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
