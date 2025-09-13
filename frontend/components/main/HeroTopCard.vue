<template>
  <a
    class="group block overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] hover:ring-1 hover:ring-white/20"
  >
    <div
      class="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px]"
    >
      <div
        :class="`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} rounded-[28px]`"
      ></div>
      <div
        class="absolute inset-0 rounded-[28px] opacity-70 bg-[radial-gradient(600px_380px_at_80%_-10%,rgba(255,255,255,0.6),transparent_60%)]"
      ></div>

      <div
        class="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6"
      >
        <!-- Text content container with transition -->
        <div
          class="w-full transition-transform duration-300 ease-out group-hover:-translate-y-3"
        >
          <h3
            class="text-white text-lg sm:text-xl md:text-2xl font-semibold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] leading-tight"
          >
            {{ title }}
          </h3>
          <p
            class="mt-2 text-white/90 text-xs sm:text-sm leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] max-w-[90%]"
          >
            {{ description }}
          </p>
        </div>

        <!-- Button that slides up from below -->
        <div
          class="mt-4 flex items-center gap-3 transform translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span
            class="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-colors duration-300 hover:bg-white/95"
          >
            {{ buttonText }}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M13 5l7 7-7 7v-4H4v-6h9V5z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  buttonText: {
    type: String,
    default: "Start building",
  },
  gradientFrom: {
    type: String,
    default: "from-sky-400",
  },
  gradientVia: {
    type: String,
    default: "via-blue-500",
  },
  gradientTo: {
    type: String,
    default: "to-purple-400",
  },
});
</script>
