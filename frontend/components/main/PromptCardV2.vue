<template>
  <div
    class="group relative bg-zinc-900/90 border border-zinc-800/50 rounded-lg overflow-hidden hover:border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-200 h-full flex flex-col cursor-pointer will-change-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
    @click="handleViewFull"
  >
    <!-- Main Content Area -->
    <div class="p-4 flex-grow flex flex-col">
      <!-- Description Text - Monospace like cursor.directory -->
      <div class="text-gray-300 text-[13px] leading-5 mb-3 flex-grow font-mono">
        <p class="line-clamp-3">
          {{ contentText }}
        </p>
      </div>

      <!-- Title and Technologies -->
      <div class="mt-auto">
        <h3 class="text-white font-semibold text-[15px] sm:text-base mb-1.5 line-clamp-2 leading-snug">
          {{ titleText }}
        </h3>

        <!-- Category Name -->
        <div class="relative">
          <div class="flex items-center gap-2 text-[13px] text-gray-300">
            <span v-if="categoryName" class="text-gray-200 font-semibold">
              {{ categoryName }}
            </span>
            <span v-else class="text-gray-500 text-[12px]">No category</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Centered Hover Actions -->
    <div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div class="pointer-events-auto flex items-center gap-3">
        <!-- Share -->
        <button
          @click.stop="handleShare"
          class="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-sm transition-colors"
          title="Share"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
        <!-- Copy -->
        <button
          @click.stop="handleCopy"
          class="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-sm transition-colors"
          :title="copied ? 'Copied!' : 'Copy'"
        >
          <svg v-if="copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <!-- Use (Download style) -->
        <button
          @click.stop="handleUse"
          class="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-sm transition-colors"
          title="Use"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Subtle Action Buttons - Only on hover -->
    <div class="hidden absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div class="flex gap-1">
        <button
          @click.stop="handleCopy"
          :class="[
            'w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-300'
          ]"
          :title="copied ? 'Copied!' : 'Copy'"
        >
          <svg v-if="copied" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          @click.stop="handleShare"
          class="w-7 h-7 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-300 flex items-center justify-center transition-colors"
          title="Share"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Blue Try Button - Bottom Right Corner -->
    <div class="absolute bottom-3 right-3">
      <button
        @click.stop="handleTryPrompt"
        class="w-7 h-7 rounded-md bg-zinc-700/50 hover:bg-zinc-600/70 text-gray-300 hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
        title="Try AI Chat"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Preview Modal -->
  <div v-if="isPreviewOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-zinc-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 class="text-white font-semibold text-lg">{{ titleText }}</h3>
        <button @click="isPreviewOpen = false" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-4 overflow-y-auto max-h-[60vh]">
        <pre class="text-gray-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">{{ contentText }}</pre>
      </div>

      <!-- Modal Actions -->
      <div class="p-4 border-t border-white/10 flex gap-2">
        <button
          @click="handleCopy"
          :class="[
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            copied ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
          ]"
        >
          {{ copied ? 'Copied!' : 'Copy Text' }}
        </button>
        <button @click="handleShare" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 transition-colors">
          Share
        </button>
        <button @click="handleUse" class="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-700/50 hover:bg-zinc-600/70 text-white border border-zinc-600/50 hover:border-zinc-500/70 transition-all duration-200 hover:scale-105 hover:shadow-lg">
          Use
        </button>
      </div>
    </div>
  </div>

  <!-- AI Dialog Modal -->
  <div v-if="isAIDialogOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-zinc-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 class="text-white font-semibold text-lg">Try Prompt</h3>
          <p class="text-gray-400 text-sm mt-1">{{ titleText }}</p>
        </div>
        <button @click="isAIDialogOpen = false" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
        <!-- Prompt Display -->
        <div class="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
          <h4 class="text-white text-sm font-medium mb-2">Prompt:</h4>
          <pre class="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">{{ contentText }}</pre>
        </div>

        <!-- User Input -->
        <div>
          <label class="block text-white text-sm font-medium mb-2">Your Query:</label>
          <textarea
            v-model="userQuery"
            placeholder="Enter your query here..."
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            rows="3"
          />
        </div>

        <!-- AI Response -->
        <div v-if="aiResponse" class="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
          <h4 class="text-white text-sm font-medium mb-2">AI Response:</h4>
          <pre class="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">{{ aiResponse }}</pre>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span class="text-gray-300 text-sm">AI is generating response...</span>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="p-4 border-t border-white/10 flex gap-2">
        <button
          @click="handleSendQuery"
          :disabled="!userQuery.trim() || isLoading"
          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
        >
          {{ isLoading ? 'Sending...' : 'Send Query' }}
        </button>
        <button @click="isAIDialogOpen = false" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 transition-colors">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type Maybe<T> = T | null | undefined;

interface CategoryAttributes { name?: string }

interface SingleRelation<T> { data?: Maybe<{ attributes?: Maybe<T> }>; }
interface ManyRelation<T> { data?: Maybe<Array<Maybe<{ attributes?: Maybe<T> }>>>; }

interface PromptLike {
  title?: string;
  description?: string;
  content?: string;
  category?: Maybe<{ name?: string }> | Maybe<SingleRelation<CategoryAttributes>>;
  categories?: Maybe<ManyRelation<CategoryAttributes>>;
  attributes?: {
    title?: string;
    description?: string;
    content?: string;
    category?: Maybe<SingleRelation<CategoryAttributes>>;
    categories?: Maybe<ManyRelation<CategoryAttributes>>;
  };
}

const props = defineProps<{ prompt: PromptLike }>();

const emit = defineEmits<{
  (e: 'view-full', prompt: PromptLike): void;
  (e: 'copy', prompt: PromptLike): void;
  (e: 'share', prompt: PromptLike): void;
  (e: 'use', prompt: PromptLike): void;
  (e: 'try', prompt: PromptLike): void;
  (e: 'send-query', payload: { prompt: PromptLike; userQuery: string }): void;
}>();

const titleText = computed(() =>
  props.prompt?.title ?? props.prompt?.attributes?.title ?? ''
);

const contentText = computed(() =>
  props.prompt?.content ?? props.prompt?.description ?? props.prompt?.attributes?.content ?? props.prompt?.attributes?.description ?? ''
);

const categoryName = computed(() => {
  const direct = (props.prompt as any)?.category?.name as Maybe<string>;
  if (direct) return direct;

  const singleRel = props.prompt?.category as Maybe<SingleRelation<CategoryAttributes>>;
  const fromSingle = singleRel?.data?.attributes?.name;
  if (fromSingle) return fromSingle;

  const manyRel = props.prompt?.categories as Maybe<ManyRelation<CategoryAttributes>>;
  const firstName = manyRel?.data?.[0]?.attributes?.name;
  if (firstName) return firstName;

  const singleInAttrs = props.prompt?.attributes?.category as Maybe<SingleRelation<CategoryAttributes>>;
  const fromAttrsSingle = singleInAttrs?.data?.attributes?.name;
  if (fromAttrsSingle) return fromAttrsSingle;

  const manyInAttrs = props.prompt?.attributes?.categories as Maybe<ManyRelation<CategoryAttributes>>;
  const firstAttrsName = manyInAttrs?.data?.[0]?.attributes?.name;
  if (firstAttrsName) return firstAttrsName;

  return '';
});

const isPreviewOpen = ref(false);
const isAIDialogOpen = ref(false);
const copied = ref(false);
const userQuery = ref('');
const aiResponse = ref('');
const isLoading = ref(false);

function handleViewFull() {
  isPreviewOpen.value = true;
  emit('view-full', props.prompt);
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(contentText.value || '');
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
    emit('copy', props.prompt);
  } catch (err) {
    // noop
  }
}

async function handleShare() {
  const shareData: ShareData = {
    title: titleText.value || 'Prompt',
    text: contentText.value || undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text ?? ''}`.trim());
      copied.value = true;
      setTimeout(() => (copied.value = false), 1200);
    }
    emit('share', props.prompt);
  } catch (err) {
    // noop
  }
}

function handleTryPrompt() {
  isAIDialogOpen.value = true;
  emit('try', props.prompt);
}

function handleUse() {
  emit('use', props.prompt);
}

async function handleSendQuery() {
  if (!userQuery.value.trim() || isLoading.value) return;
  isLoading.value = true;
  aiResponse.value = '';
  emit('send-query', { prompt: props.prompt, userQuery: userQuery.value });
  // Placeholder simulated latency
  try {
    await new Promise((r) => setTimeout(r, 600));
    aiResponse.value = 'This is a placeholder AI response. Hook up your backend to replace this.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* No additional styles; using utility classes */
</style>
