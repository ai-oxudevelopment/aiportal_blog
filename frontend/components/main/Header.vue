<template>
  <header class="fixed top-0 left-0 right-0 z-20 bg-black">
    <div class="w-full px-4 md:px-8 h-14 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-white">
          <span class="text-lg font-bold tracking-tight">AIWORKPLACE BLOG</span>
        </div>
        <button
          class="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Toggle menu"
          @click="$emit('toggleMenu')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke-width="1.5" />
            <line x1="8" y1="6" x2="8" y2="18" stroke-width="1.5" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="h-8 px-4 rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-red-500 border-0 text-white text-xs font-medium shadow-lg transition-all duration-300 transform hover:scale-105 animate-gradient-chaos"
        >
          О продукте
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isMenuOpen: Boolean,
});

defineEmits(['toggleMenu']);
</script>

<style scoped>
/* Custom animation for the gradient button */
@keyframes gradient-chaos {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.animate-gradient-chaos {
  background-size: 200% 200%;
  animation: gradient-chaos 5s ease infinite;
}
</style>