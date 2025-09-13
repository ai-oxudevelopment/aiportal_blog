<template>
  <aside
    :class="`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black/80 backdrop-blur-sm z-30 transition-all duration-300 ease-in-out outline-none border-none ${
      isMenuOpen ? 'translate-x-0' : '-translate-x-full'
    }`"
  >
    <nav class="flex flex-col h-full px-6 py-8">
      <ul class="space-y-2">
        <li v-for="(item, idx) in items" :key="item">
          <a
            :href="item === 'News' ? '/prompts/sample-prompt' : '#'"
            :class="`flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md ${
              idx === items.length - 1 ? 'bg-white/10 text-white' : ''
            }`"
          >
            {{ item }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  isMenuOpen: Boolean,
});

const items = [
  "Research",
  "Safety",
  "For Business",
  "For Developers",
  "Stories",
  "Company",
  "News"
];
</script>
