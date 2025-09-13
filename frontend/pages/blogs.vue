<template>
  <div class="min-h-screen bg-black text-gray-100">
    <Header
      :is-menu-open="isMenuOpen"
      @toggle-menu="toggleMenu"
    />

    <div class="flex">
      <Sidebar :is-menu-open="isMenuOpen" />

      <main
        :class="`pt-14 w-full transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'md:ml-64' : 'ml-0'
        }`"
      >
        <div
          class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 flex-col justify-between block"
        >
          <!-- Hero Top Books Section -->
          <section id="hero-section">
            <HeroTopCards :docs="keyDocuments" />
          </section>

          <!-- News Section -->
          <section id="news-section" class="mb-8">
            <h1
              class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
            >
              News
            </h1>
            <div
              class="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"
            >
              <Tabs />
              <div
                class="hidden md:flex items-center gap-2 text-xs text-gray-300"
              >
                <button
                  class="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                </button>
                <button
                  class="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  Sort
                </button>
                <button
                  class="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition"
                >
                  <svg
                    class="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 3h6v6H3V3zm0 12h6v6H3v-6zm12-12h6v6h-6V3zm0 12h6v6h-6v-6z"
                    />
                  </svg>
                  Grid
                </button>
              </div>
            </div>
          </section>

          <div>
            <section
              v-for="([sectionTitle, sectionPosts]) in Object.entries(sectionData)"
              :key="sectionTitle"
              :id="`${sectionTitle.toLowerCase()}-section`"
            >
              <Section
                :title="sectionTitle"
                :posts="sectionPosts"
              />
            </section>
          </div>

          <!-- Writer Action Agent Section -->
          <section class="mb-16">
            <WriterActionAgent />
          </section>

          <!-- ChatGPT Business Section -->
          <section class="mb-16">
            <ChatGPTBusinessSection />
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '~/components/main/Header.vue';
import Sidebar from '~/components/main/Sidebar.vue';
import HeroTopCards from '~/components/main/HeroTopCards.vue';
import Tabs from '~/components/main/Tabs.vue';
import Section from '~/components/main/Section.vue';

/*
definePageMeta({
  layout: false, // Using a custom layout structure here
});
*/

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const keyDocuments = [
  {
    id: "key1",
    title: "AI Safety Framework 2025",
    description:
      "Comprehensive guidelines for responsible AI development and deployment across all sectors",
    tag: "Safety",
    date: "Aug 25, 2025",
    tone: "purple",
    href: "#",
    ctaText: "Start building"
  },
  {
    id: "key2",
    title: "GPT-5 Technical Documentation",
    description:
      "Complete technical specifications, API reference, and implementation guide for GPT-5",
    tag: "Product",
    date: "Aug 20, 2025",
    tone: "blue",
    href: "#",
    ctaText: "Explore API"
  },
  {
    id: "key3",
    title: "OpenAI Research Roadmap",
    description:
      "Strategic research directions and upcoming breakthroughs in artificial intelligence",
    tag: "Research",
    date: "Aug 15, 2025",
    tone: "green",
    href: "#",
    ctaText: "Learn more"
  }
];

const sectionData = {
  Product: [
    {
      id: "p1",
      title: "Introducing our latest image generation model in the API",
      tag: "Product",
      date: "Apr 23, 2025",
      tone: "blue",
      category: "product"
    },
    {
      id: "p2",
      title: "Introducing GPT-4.5",
      tag: "Release",
      date: "Feb 27, 2025",
      tone: "green",
      category: "product"
    },
    {
      id: "p4",
      title: "Introducing 23",
      tag: "Release",
      date: "Feb 27, 2025",
      tone: "purple",
      category: "product"
    },
    {
      id: "p3",
      title: "OpenAI o3-mini",
      tag: "Release",
      date: "Jan 31, 2025",
      tone: "orange",
      category: "product"
    }
  ],

  Research: [
    {
      id: "r1",
      title: "Pioneering an AI clinical copilot with Penda Health",
      tag: "Publication",
      date: "Jul 22, 2025",
      tone: "pink",
      category: "research"
    },
    {
      id: "r2",
      title: "Toward understanding and preventing misalignment generalization",
      tag: "Publication",
      date: "Jun 18, 2025",
      tone: "purple",
      category: "research"
    },
    {
      id: "r3",
      title: "Introducing HealthBench",
      tag: "Publication",
      date: "May 12, 2025",
      tone: "teal",
      category: "research"
    }
  ],

  Company: [
    {
      id: "c1",
      title: "OpenAI expands to new markets",
      tag: "Company",
      date: "Aug 15, 2025",
      tone: "blue",
      category: "company"
    },
    {
      id: "c2",
      title: "Partnership with leading healthcare providers",
      tag: "Company",
      date: "Jul 30, 2025",
      tone: "green",
      category: "company"
    },
    {
      id: "c3",
      title: "New office opening in Singapore",
      tag: "Company",
      date: "Jun 25, 2025",
      tone: "orange",
      category: "company"
    }
  ],

  Safety: [
    {
      id: "s1",
      title: "AI Safety research breakthrough",
      tag: "Safety",
      date: "Aug 10, 2025",
      tone: "pink",
      category: "safety"
    },
    {
      id: "s2",
      title: "Red team findings and improvements",
      tag: "Safety",
      date: "Jul 05, 2025",
      tone: "purple",
      category: "safety"
    },
    {
      id: "s3",
      title: "Transparency report Q2 2025",
      tag: "Safety",
      date: "Jun 15, 2025",
      tone: "teal",
      category: "safety"
    }
  ],

  Security: [
    {
      id: "sec1",
      title: "Enhanced security measures for API",
      tag: "Security",
      date: "Aug 20, 2025",
      tone: "blue",
      category: "security"
    },
    {
      id: "sec2",
      title: "Cybersecurity partnership announcement",
      tag: "Security",
      date: "Jul 12, 2025",
      tone: "green",
      category: "security"
    },
    {
      id: "sec3",
      title: "Security audit results published",
      tag: "Security",
      date: "Jun 08, 2025",
      tone: "orange",
      category: "security"
    }
  ]
};
</script>