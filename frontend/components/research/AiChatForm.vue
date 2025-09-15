<template>
    <div class="pointer-events-none fixed bottom-2 left-2 right-2 mt-2 md:bottom-4 md:left-0 md:right-0">
      <div class="z-10 mx-auto max-w-3xl">
        <form
          class="pointer-events-auto z-20 w-full rounded-xl ring-1 ring-indigo-700/10 backdrop-blur-lg shadow-lg bg-gradient-to-tr from-indigo-800/50 via-neutral-900/30 to-indigo-300/20 dark:from-indigo-950/60 dark:to-neutral-900/70 border-2 border-indigo-500/15 hover:border-indigo-400/20 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-400/50"
          @submit.prevent="handleSubmit"
          aria-label="AI чат. Поле ввода и отправки сообщения"
        >
          <div class="relative text-base px-4 pt-4">
            <!-- AI-суггестии (прогноз запроса) -->
            <transition name="fade">
              <div v-if="aiSuggestion" class="absolute right-4 top-[-24px] z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-900/70 bg-blur text-indigo-100 text-sm shadow-lg select-none pointer-events-auto animate-fade-in">
                <span>🤖 Вариант запроса: "{{ aiSuggestion }}"</span>
                <button @click="applyAISuggestion" type="button" class="ml-2 p-1 rounded hover:bg-indigo-200/25 focus:outline-none">Вставить</button>
              </div>
            </transition>
            <!-- Подсказка и Placeholder -->
            <div class="pointer-events-none absolute left-4 right-24 top-4 flex w-full text-base text-indigo-300/70">
              <span class="flex items-center gap-1">
                <svg class="w-5 h-5 text-indigo-400/80" fill="none" stroke="currentColor">
                  <!--? icon --></svg>
                Задайте вопрос, добавьте детали, прикрепите файл или скажите голосом 💡
              </span>
            </div>
            <!-- Drag&Drop Upload/Preview pill -->
            <div v-if="uploadFile" class="absolute right-14 top-4 z-20 flex items-center gap-2 px-2 py-1 rounded bg-indigo-900/30 text-white text-xs shadow">
              <span>📎 {{ uploadFile.name }}</span>
              <button @click="removeUpload" class="ml-2 text-indigo-200 hover:text-rose-400">✕</button>
            </div>
            <!-- Мультимодальный input-ввод -->
            <textarea
              v-model="userInput"
              aria-label="Ваш вопрос или сообщение"
              placeholder="Опишите свой запрос, вопрос или вставьте файл…"
              rows="2"
              :disabled="isLoading"
              class="w-full resize-none rounded-xl bg-transparent pl-0 pr-10 text-lg text-white placeholder:text-indigo-200/70 focus:outline-none focus:bg-indigo-950/10 transition-all duration-200"
              style="height: 53px;"
              @keydown.enter.exact.prevent="handleSubmit"
              @keydown.esc="handleUndo"
              @paste="handlePaste"
              @drop.prevent="handleDrop"
              @dragover.prevent
            ></textarea>
            <!-- Accessibility и emoji -->
            <div class="absolute right-4 top-4 flex flex-col gap-2 pointer-events-auto justify-end">
              <button aria-label="Открыть эмодзи" type="button" class="rounded p-1 text-xl hover:bg-indigo-600/20" @click="toggleEmojiPicker">😊</button>
              <button aria-label="Голосовой ввод" type="button" class="rounded p-1 text-lg hover:bg-indigo-600/20" @click="handleMic">
                <span v-if="isMicActive">🎤</span>
                <span v-else>🎙️</span>
              </button>
            </div>
            <!-- Emoji picker slot -->
            <div v-if="showEmojiPicker" class="absolute right-14 top-8 z-30">
              <!-- Emoji picker компонент -->
              <EmojiPicker @select="insertEmoji" />
            </div>
          </div>
          <!-- Feedback/Undo/loader/submit -->
          <div class="flex h-14 items-center justify-between border-t border-indigo-300/10 px-4 py-2 bg-gradient-to-t from-indigo-950/10 to-transparent">
            <!-- Deep Research и accessibility -->
            <div class="flex items-center gap-5 text-sm">
              <button
                @click="toggleDeepResearch"
                :aria-pressed="isDeepResearch"
                type="button"
                class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition bg-gradient-to-tr from-amber-500/25 via-indigo-700/10 to-rose-400/5 dark:from-amber-400/35 border-0 ring-1 ring-indigo-300/30 hover:ring-2 hover:from-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span>🔍 Deep Research</span>
                <span v-if="isDeepResearch" class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              </button>
              <div class="hidden md:inline-block text-xs text-indigo-400/70 ml-2 animate-fade-in">Powered by LLM, 2025</div>
              <button v-if="showUndo" @click="handleUndo" type="button" class="ml-4 px-2 py-1 text-xs rounded text-rose-400 hover:bg-rose-400/20 transition">↩️ Отменить отправку</button>
            </div>
            <!-- Submit button/loader -->
            <button
              class="relative flex items-center justify-center rounded-full h-11 w-11 bg-indigo-600 hover:bg-indigo-500 shadow-lg text-white transition-all duration-200"
              :disabled="!userInput || isLoading"
              :class="{'opacity-60 cursor-not-allowed': !userInput || isLoading}"
              type="submit"
              aria-label="Отправить сообщение"
            >
              <span v-if="isLoading" class="absolute w-8 h-8 flex items-center justify-center animate-spin">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="w-6 h-6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="4" fill="transparent" /></svg>
              </span>
              <span v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                </svg>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { defineComponent, defineEmits, h, onBeforeUnmount, ref, watch } from 'vue';

type SubmitPayload = {
  message: string;
  isDeepResearch: boolean;
  file?: File | null;
};

type AiResponse = {
  success?: boolean;
  data?: string;
};

const emit = defineEmits<{
  (e: 'submit', payload: SubmitPayload): void;
  (e: 'response', data: AiResponse): void;
  (e: 'error', error: unknown): void;
}>();

// State
const userInput = ref<string>('');
const isLoading = ref<boolean>(false);
const isDeepResearch = ref<boolean>(false);
const showUndo = ref<boolean>(false);
const aiSuggestion = ref<string>('');
const showEmojiPicker = ref<boolean>(false);
const isMicActive = ref<boolean>(false);
const uploadFile = ref<File | null>(null);
const abortController = ref<AbortController | null>(null);

let undoTimer: number | undefined;
let recognition: any | null = null;

// Lightweight local Emoji Picker component
const EmojiPicker = defineComponent({
  name: 'EmojiPicker',
  emits: ['select'],
  setup(_, { emit }) {
    const emojis = ['🙂','😀','😂','🤔','👍','🔥','🚀','💡','✅','❓'];
    const onClick = (emoji: string) => emit('select', emoji);
    return () => h(
      'div',
      { class: 'rounded-lg border border-indigo-700/30 bg-neutral-900/80 p-2 shadow-xl' },
      emojis.map((e) => h('button', { type: 'button', class: 'm-1 p-1 hover:bg-indigo-600/20 rounded', onClick: () => onClick(e) }, e))
    );
  },
});

// Actions
function toggleDeepResearch(): void { isDeepResearch.value = !isDeepResearch.value; }
function toggleEmojiPicker(): void { showEmojiPicker.value = !showEmojiPicker.value; }
function insertEmoji(emoji: string): void { userInput.value += emoji; showEmojiPicker.value = false; }
function removeUpload(): void { uploadFile.value = null; }
function applyAISuggestion(): void { if (aiSuggestion.value) userInput.value = aiSuggestion.value; }

function handlePaste(e: ClipboardEvent): void {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) { uploadFile.value = file; break; }
    }
  }
}

function handleDrop(e: DragEvent): void {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    uploadFile.value = files[0];
  }
}

watch(userInput, (val) => {
  aiSuggestion.value = val && val.length > 8 ? `${val.trim()} — кратко и по делу` : '';
});

function handleMic(): void {
  const w = window as any;
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SR) return;

  if (recognition && isMicActive.value) {
    recognition.stop();
    isMicActive.value = false;
    return;
  }

  recognition = new SR();
  recognition.lang = 'ru-RU';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.onstart = () => { isMicActive.value = true; };
  recognition.onend = () => { isMicActive.value = false; };
  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    userInput.value = (userInput.value ? userInput.value + ' ' : '') + transcript.trim();
  };
  recognition.start();
}

function clearUndoTimer(): void {
  if (undoTimer) {
    window.clearTimeout(undoTimer);
    undoTimer = undefined;
  }
}

async function handleSubmit(): Promise<void> {
  if (!userInput.value || isLoading.value) return;
  isLoading.value = true;
  showUndo.value = true;
  emit('submit', { message: userInput.value, isDeepResearch: isDeepResearch.value, file: uploadFile.value });

  clearUndoTimer();
  abortController.value = new AbortController();

  // Allow a short window to undo
  undoTimer = window.setTimeout(async () => {
    try {
      const res = await fetch('/api/airesponse', { signal: abortController.value?.signal });
      const data: AiResponse = await res.json();
      emit('response', data);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        emit('error', err);
        console.error(err);
      }
    } finally {
      isLoading.value = false;
      showUndo.value = false;
      abortController.value = null;
      clearUndoTimer();
    }
  }, 2000);
}

function handleUndo(): void {
  if (abortController.value) {
    abortController.value.abort();
  }
  isLoading.value = false;
  showUndo.value = false;
  clearUndoTimer();
}

onBeforeUnmount(() => {
  if (recognition && isMicActive.value) recognition.stop();
  if (abortController.value) abortController.value.abort();
  clearUndoTimer();
});
</script>