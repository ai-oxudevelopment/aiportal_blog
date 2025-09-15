<template>
  <div class="mb-4">
    <div class="relative flex flex-col gap-1 rounded-md border-[0.5px] border-[#2F2F2F] bg-[#141414] p-4 text-white [overflow-wrap:anywhere]">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-medium text-blue-400">{{ title }}</h3>
        <button v-if="onToggle" @click="onToggle" class="text-neutral-400 hover:text-white transition-colors">
          <ChevronRight :class="`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`" />
        </button>
      </div>
      <div v-if="isExpanded" class="prose-custom prose-custom-md prose-custom-gray !max-w-none text-neutral-300 [overflow-wrap:anywhere]">
        <div v-html="content" />
      </div>
    </div>
  </div>
</template>