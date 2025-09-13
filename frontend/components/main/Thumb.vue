<template>
  <div
    :class="`aspect-square w-full rounded-xl border border-white/10 bg-gradient-to-tr ${toneMap[tone]} overflow-hidden relative`"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(300px_200px_at_80%_-20%,rgba(255,255,255,0.6),transparent_60%)]"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tone: String,
});

const toneMap = {
  blue: "from-sky-400 via-sky-500 to-blue-300",
  indigo: "from-indigo-300 via-indigo-400 to-violet-300",
  gray: "from-zinc-300 via-zinc-400 to-slate-300",
  green: "from-emerald-400 via-green-500 to-teal-300",
  orange: "from-orange-400 via-amber-400 to-yellow-300",
  pink: "from-pink-400 via-rose-400 to-red-300",
  purple: "from-purple-400 via-violet-400 to-indigo-300",
  teal: "from-teal-400 via-cyan-400 to-blue-300"
};
</script>
