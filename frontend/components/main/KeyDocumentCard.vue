<template>
  <a
    :href="document.href ?? '#'"
    class="group block overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] hover:ring-1 hover:ring-white/20"
  >
    <div
      class="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px]"
    >
      <!-- Background gradient -->
      <div
        :class="`absolute inset-0 bg-gradient-to-br ${toneMap[document.tone]} rounded-[28px]`"
      />

      <!-- Radial highlights -->
      <div
        class="absolute inset-0 rounded-[28px] bg-[radial-gradient(600px_380px_at_80%_-10%,rgba(255,255,255,0.6),transparent_60%)] opacity-70"
      />

      <div
        class="absolute inset-0 rounded-[28px] bg-[radial-gradient(500px_420px_at_-10%_110%,rgba(255,255,255,0.35),transparent_60%)] opacity-60"
      />

      <!-- Optional cover image -->
      <img
        v-if="document.cover"
        :src="document.cover"
        :alt="document.title"
        class="absolute inset-0 h-full w-full object-cover rounded-[28px] opacity-80 mix-blend-screen transition-transform duration-700 ease-out will-change-transform group-hover:-translate-y-1"
      />

      <!-- Content pinned to bottom-left -->
      <div
        class="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 lg:p-10"
      >
        <!-- Text content container with transition -->
        <div
          class="w-full transition-transform duration-300 ease-out group-hover:-translate-y-4"
        >
          <h3
            class="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] leading-tight"
          >
            {{ document.title }}
          </h3>
          <p
            class="mt-2 sm:mt-3 md:mt-4 text-white/90 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] max-w-[95%]"
          >
            {{ document.description }}
          </p>
        </div>

        <!-- Button that slides up from below -->
        <div
          class="mt-3 sm:mt-4 md:mt-6 flex items-center gap-3 md:gap-4 transform translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span
            class="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base font-semibold shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-colors duration-300 hover:bg-white/95"
          >
            {{ document.ctaText ?? "Start building" }}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M13 5l7 7-7 7v-4H4v-6h9V5z"
              />
            </svg>
          </span>
          <time
            class="text-white/80 text-xs sm:text-sm"
          >
            {{ document.date }}
          </time>
        </div>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  document: Object,
});

const toneMap = {
  blue: "from-sky-400 via-sky-500 to-blue-300",
  green: "from-emerald-400 via-green-500 to-teal-300",
  orange: "from-orange-400 via-amber-400 to-yellow-300",
  pink: "from-pink-400 via-rose-400 to-red-300",
  purple: "from-purple-400 via-violet-400 to-indigo-300",
  teal: "from-teal-400 via-cyan-400 to-blue-300"
};
</script>
