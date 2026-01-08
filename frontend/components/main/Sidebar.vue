<template>
  <aside
    :class="`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black z-30 transition-all duration-300 ease-in-out outline-none border-none ${
      isMenuOpen ? 'translate-x-0' : '-translate-x-full'
    }`"
  >
    <nav class="flex flex-col h-full px-6 py-8">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.label">
          <NuxtLink
            :to="item.path"
            :class="`flex items-center px-3 py-2 text-sm transition-colors rounded-md ${
              isActive(item.path)
                ? 'bg-white/10 text-white font-medium'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  isMenuOpen: Boolean,
});

const route = useRoute();

const menuItems = [
  { label: "Для исследований", path: "/" },
  { label: "Для проектирования", path: "/speckits" }
];

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path.startsWith('/prompts');
  }
  return route.path.startsWith(path);
};
</script>
