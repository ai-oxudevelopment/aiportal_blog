<template>
    <div class="pointer-events-none fixed bottom-2 left-2 right-2 mt-2 md:bottom-4 md:left-0 md:right-0">
      <form
        class="pointer-events-auto z-20 mx-auto max-w-3xl w-full rounded-xl ring-1 ring-indigo-700/10 backdrop-blur-lg shadow-lg bg-gradient-to-tr from-indigo-800/50 via-neutral-900/30 to-indigo-300/20 dark:from-indigo-950/60 dark:to-neutral-900/70 border-2 border-indigo-500/15 hover:border-indigo-400/20 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-400/50"
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
              <svg class="w-5 h-5 text-indigo-400/80" fill="none" stroke="currentColor"></svg>
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
  </template>