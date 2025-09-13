<template>
  <header
    class="fixed top-0 left-0 right-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40"
  >
    <div
      class="w-full px-4 md:px-8 h-14 flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-white">
          <span class="text-lg font-bold tracking-tight">
            AIWORKPLACE BLOG
          </span>
        </div>
        <button
          class="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Toggle menu"
          @click="$emit('toggleMenu')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              stroke-width="1.5"
            />
            <line
              x1="8"
              y1="6"
              x2="8"
              y2="18"
              stroke-width="1.5"
            />
          </svg>
        </button>
      </div>

      <div
        class="flex items-center gap-3 text-gray-300"
      >
        <button
          class="h-8 px-4 rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-blue-500 hover:from-pink-600 hover:via-orange-600 hover:to-blue-600 border-0 text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-gradient-chaos"
        >
          О продукте
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  isMenuOpen: Boolean,
});

defineEmits(['toggleMenu']);

const navigationItems = [
  { id: "hero-section", label: "Key Documents" },
  { id: "news-section", label: "News" },
  { id: "product-section", label: "Product" },
  { id: "research-section", label: "Research" },
  { id: "company-section", label: "Company" },
  { id: "safety-section", label: "Safety" },
  { id: "security-section", label: "Security" }
];

const activeSection = ref('');

const handleScroll = () => {
  const sections = navigationItems.map((item) =>
    document.getElementById(item.id)
  );
  const scrollPosition = window.scrollY + 100; // Offset for header height

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    if (section && section.offsetTop <= scrollPosition) {
      activeSection.value = navigationItems[i].id;
      break;
    }
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Set initial active section
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerHeight = 56; // Height of fixed header
    const elementPosition = element.offsetTop - headerHeight;

    window.scrollTo({
      top: elementPosition,
      behavior: "smooth"
    });
  }
};
</script>

<style scoped>
/* Custom animation for the gradient button */
@keyframes gradient-chaos {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-chaos {
  background-size: 200% 200%;
  animation: gradient-chaos 5s ease infinite;
}
</style>
