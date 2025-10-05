<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <div class="flex">
      <main class="w-full">

        <!-- Prompt content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
          <div class="text-center py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-lg shadow-xl">
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              {{ promptTitle }}
            </h1>
            <p class="mt-8 text-lg md:text-xl text-gray-400">
              {{ categoryName }}
            </p>
          </div>
          <div class="flex-1 relative group">
            <div class="text-sm text-gray-200 p-2 overflow-auto h-full leading-relaxed bg-gray-950/30 rounded-xl prose prose-invert prose-sm max-w-none">
              <pre class="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                <code>{{ promptContent }}</code>
              </pre>
            </div>
            <button
              @click="handlePromptTry?.()"
              class="prompt-action-btn absolute top-6 right-8 flex items-center gap-2 backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
              title="Попробовать в чате"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="text-xs font-medium">Попробовать</span>
            </button>
            <div class="absolute bottom-6 right-6 flex space-x-3">
              <button
                @click="handleCopy"
                class="prompt-secondary-btn bg-gray-800/80 text-gray-300 hover:text-white transition-all duration-200 group border border-gray-700/50"
                :title="copied ? 'Copied!' : 'Copy to clipboard'"
              >
                <svg v-if="copied" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                @click="handleShare"
                class="prompt-secondary-btn bg-gray-800/80 text-gray-300 hover:text-white transition-all duration-200 group border border-gray-700/50"
                title="Share prompt"
              >
                <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button
                @click="handleDownload"
                class="prompt-secondary-btn bg-gray-800/80 text-gray-300 hover:text-white transition-all duration-200 group border border-gray-700/50"
                title="Download prompt"
              >
                <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Related prompts -->
        <div class=" max-w-7xl bg-gray-900/50 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-sm p-8 mx-auto my">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-white tracking-tight">{{ categoryName }}</h2>
            <span class="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full">
              {{ relevantPrompts.length }} промптов
            </span>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <EnhancedPromptCard 
              v-for="prompt in relevantPrompts.slice(0, 6)" 
              :key="prompt.id" 
              :prompt="prompt" 
              @try="handleViewPrompt"
            />
          </div>

        </div>
      
      </main>

    </div>

</div>

  <!-- AI Platform Selector - positioned above SimpleAiChat -->
  <AiPlatformSelector
    :prompt-text="promptContent"
  />

  <SimpleAiChat
    :static-text="'Попробовать в чате...'"
    :default-text="'Эффективно решаю задачи'"
    />

</template>

<script setup lang="ts">
import SimpleAiChat from '~/components/research/SimpleAiChat.vue'
import AiPlatformSelector from '~/components/research/AiPlatformSelector.vue'
import EnhancedPromptCard from '~/components/prompt/EnhancedPromptCard.vue'
import { useFetchArticles } from '~/composables/useFetchArticles'
import { useFetchOneArticle } from '~/composables/useFetchOneArticle'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { Ref } from 'vue'
import type { PromptPreview } from '~/types/article'

const route = useRoute()
const router = useRouter()

const copied = ref(false)

const slug = computed(() => route.params.promptSlug as string)

const { fetchArticle } = useFetchOneArticle()
const { data: prompt, pending, error } = useAsyncData(
  'article',
  () => fetchArticle(slug.value),
  { watch: [slug] }
)

const promptItem = computed(() => prompt.value?.data?.[0] ?? null)
const promptTitle = computed(() => promptItem.value?.title ?? '')
const promptContent = computed(() => promptItem.value?.body ?? '')
const categoryId = computed(() => promptItem.value?.categories?.[0]?.id ?? null)
const categoryName = computed(() => promptItem.value?.categories?.[0]?.name ?? 'Без категории')

const fetchCtx = useFetchArticles()
const relevantPrompts = fetchCtx.articles as Ref<PromptPreview[]>
const { loading, fetchArticles } = fetchCtx

const filterCategory = () => {
  fetchArticles(
    categoryId.value
      ? { categories: { id: categoryId.value } }
      : { categories: { $null: true } }
  )
}

watch([categoryId, slug], filterCategory, { immediate: true })

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(promptContent.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: promptTitle.value,
        text: promptContent.value,
        url: window.location.href,
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }
}

const handleDownload = () => {
  const blob = new Blob([promptContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `${promptTitle.value || 'prompt'}.txt`,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handlePromptTry = handleCopy

const goToPrompt = (s: string) => {
  if (s) router.push(`/prompts/${encodeURIComponent(s)}`)
}

const handleViewPrompt = (prompt: { slug?: string }) => {
  if (prompt.slug) goToPrompt(prompt.slug)
}

</script>

<style scoped>
/* Custom markdown styling for dark theme */
.prose-invert {
  --tw-prose-body: #e5e7eb;
  --tw-prose-headings: #f9fafb;
  --tw-prose-lead: #d1d5db;
  --tw-prose-links: #60a5fa;
  --tw-prose-bold: #f9fafb;
  --tw-prose-counters: #9ca3af;
  --tw-prose-bullets: #4b5563;
  --tw-prose-hr: #374151;
  --tw-prose-quotes: #f9fafb;
  --tw-prose-quote-borders: #374151;
  --tw-prose-captions: #9ca3af;
  --tw-prose-code: #f9fafb;
  --tw-prose-pre-code: #e5e7eb;
  --tw-prose-pre-bg: #1f2937;
  --tw-prose-th-borders: #374151;
  --tw-prose-td-borders: #374151;
}

.prose-invert h1,
.prose-invert h2,
.prose-invert h3,
.prose-invert h4,
.prose-invert h5,
.prose-invert h6 {
  color: #f9fafb;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose-invert h1 {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.prose-invert h2 {
  font-size: 1.5rem;
  line-height: 2rem;
}

.prose-invert h3 {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.prose-invert p {
  margin-bottom: 1em;
  line-height: 1.7;
}

.prose-invert ul,
.prose-invert ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.prose-invert li {
  margin-bottom: 0.25em;
}

.prose-invert code {
  background-color: #374151;
  color: #f9fafb;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-weight: 500;
}

.prose-invert pre {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1em 0;
}

.prose-invert pre code {
  background-color: transparent;
  padding: 0;
  color: #e5e7eb;
}

.prose-invert blockquote {
  border-left: 4px solid #4b5563;
  padding-left: 1rem;
  margin: 1em 0;
  font-style: italic;
  color: #d1d5db;
}

.prose-invert strong {
  color: #f9fafb;
  font-weight: 600;
}

.prose-invert a {
  color: #60a5fa;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose-invert a:hover {
  color: #93c5fd;
}
</style>