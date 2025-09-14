<template>
  <div class="flex-1 p-8 max-w-6xl">
    <!-- Main Prompt Content -->
    <div class="mb-12">
      <div class="bg-gray-900/50 rounded-2xl border border-gray-800 h-full flex flex-col shadow-2xl backdrop-blur-sm">
        <!-- Header with title and category -->
        <div class="p-6 border-b border-gray-800/50">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-white">{{ promptTitle }}</h1>
            <span class="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full">
              {{ categoryName }}
            </span>
          </div>
        </div>

        <!-- Prompt Content -->
        <div class="flex-1 relative group">
          <pre class="text-sm text-gray-200 p-6 overflow-auto h-full font-mono leading-relaxed bg-gray-950/30 rounded-xl m-4 whitespace-pre-wrap">
            {{ promptContent }}
          </pre>

          <!-- Hover overlay: Try in chat button inside code area -->
          <button
            @click="handlePromptTry?.()"
            class="absolute top-6 right-8 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/80 text-gray-200 border border-gray-700/70 shadow-sm backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-gray-700/80 hover:text-blue-300"
            title="Попробовать в чате"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-xs font-medium">Попробовать</span>
          </button>

          <!-- Action Buttons -->
          <div class="absolute bottom-6 right-6 flex space-x-3">
            <button
              @click="handleCopy"
              class="p-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-700/50"
              :title="copied ? 'Copied!' : 'Copy to clipboard'"
            >
              <!-- Copy Icon -->
              <svg v-if="copied" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              @click="handleShare"
              class="p-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-700/50"
              title="Share prompt"
            >
              <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button
              @click="handleDownload"
              class="p-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl backdrop-blur-sm border border-gray-700/50"
              title="Download prompt"
            >
              <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations Section -->
    <div class="bg-gray-900/50 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-sm">
      <div class="p-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-white tracking-tight">Из этой же категории</h2>
          <span class="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full">
            -- промптов
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
       -
        </div>

        <div class="mt-8 text-center">
          <button class="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg">
            Смотреть все
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-3 text-gray-400">Loading prompt...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-400 text-lg mb-4">Error loading prompt</div>
      <p class="text-gray-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFetchOneArticle } from '~/composables/useFetchOneArticle';

// Get slug from route
const route = useRoute();
const slug = route.params.promptSlug as string;

// Use the composable
const { article, error, loading, fetchArticle } = useFetchOneArticle(slug);

// Computed properties for template
const promptTitle = computed(() => article.value?.title || '');
const promptContent = computed(() => article.value?.body || '');
const categoryName = computed(() => article.value?.categories?.data?.[0]?.attributes?.name || '');

// Fetch article on mount
onMounted(() => {
  fetchArticle();
});

// Copy functionality
const copied = ref(false);
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(promptContent.value);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Share functionality
const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: promptTitle.value,
        text: promptContent.value,
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  } else {
    // Fallback: copy URL to clipboard
    await navigator.clipboard.writeText(window.location.href);
  }
};

// Download functionality
const handleDownload = () => {
  const blob = new Blob([promptContent.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Handle prompt try (placeholder)
const handlePromptTry = () => {
  // Implement your prompt try logic here
  console.log('Try prompt:', promptContent.value);
};
</script>

<style scoped>
/* Additional custom styles if needed */
</style>