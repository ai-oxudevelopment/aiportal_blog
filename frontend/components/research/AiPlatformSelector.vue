<template>
  <div class="fixed bottom-24 right-0 left-0 z-40 mx-auto h-[48px] w-[325px] transition-all duration-300 hover:w-[350px] hover:scale-105 translate-y-0 opacity-100 pointer-events-auto">
    <div class="relative animate-gradient-background">
      <div class="shadow-black-4 bg-gradient-animated relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl hover:shadow-iridescent transition-shadow duration-300 items-center justify-between gap-2">
        
        <!-- ChatGPT Button -->
        <button
          @click="openInChatGPT"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-105 group border border-green-600/30 hover:border-green-500/50"
          title="Open in ChatGPT"
        >
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
          </svg>
          <span class="text-xs font-medium hidden sm:inline">ChatGPT</span>
        </button>

        <!-- Claude Button -->
        <button
          @click="openInClaude"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 hover:text-orange-300 transition-all duration-200 hover:scale-105 group border border-orange-600/30 hover:border-orange-500/50"
          title="Open in Claude"
        >
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1.5 4.5c-.828 0-1.5.672-1.5 1.5v8c0 .828.672 1.5 1.5 1.5h3c.828 0 1.5-.672 1.5-1.5V8c0-.828-.672-1.5-1.5-1.5h-3z"/>
          </svg>
          <span class="text-xs font-medium hidden sm:inline">Claude</span>
        </button>

        <!-- Perplexity Button -->
        <button
          @click="openInPerplexity"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-[16px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 transition-all duration-200 hover:scale-105 group border border-blue-600/30 hover:border-blue-500/50"
          title="Open in Perplexity"
        >
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span class="text-xs font-medium hidden sm:inline">Perplexity</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  promptText: {
    type: String,
    required: true,
    default: ''
  }
})

// Methods to open in different platforms
const openInChatGPT = () => {
  if (!props.promptText?.trim()) return
  
  const url = `https://chat.openai.com/?q=${encodeURIComponent(props.promptText)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openInClaude = () => {
  if (!props.promptText?.trim()) return
  
  const url = `https://claude.ai/new?q=${encodeURIComponent(props.promptText)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openInPerplexity = () => {
  if (!props.promptText?.trim()) return
  
  const url = `https://perplexity.ai/?q=${encodeURIComponent(props.promptText)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
/* Gradient background animation - matching SimpleAiChat */
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

/* Enhanced hover effects */
button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Platform-specific glow effects */
button:hover.bg-green-600\/20 {
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}

button:hover.bg-orange-600\/20 {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
}

button:hover.bg-blue-600\/20 {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}
</style>