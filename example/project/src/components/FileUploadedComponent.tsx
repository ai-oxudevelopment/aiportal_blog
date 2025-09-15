<template>
  <div class="mb-4">
    <div class="relative flex flex-col gap-1 rounded-md border-[0.5px] border-[#2F2F2F] bg-[#141414] p-4 text-white">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-medium text-neutral-400">Attached Files</h3>
        <button v-if="onToggle" @click="onToggle" class="text-neutral-400 hover:text-white transition-colors">
          <ChevronRight :class="`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`" />
        </button>
      </div>
      <div v-if="isExpanded" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="file in files" :key="file.id" class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 transition-colors cursor-pointer border border-neutral-700/50 hover:border-neutral-600">
          <div class="flex-shrink-0">
            <component :is="getFileIcon(file.type)" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-white truncate">
              {{ file.name }}
            </div>
            <div class="flex items-center gap-2 text-xs text-neutral-400">
              <span>{{ getFileExtension(file.name) }}</span>
              <span v-if="file.size">•</span>
              <span v-if="file.size">{{ file.size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>