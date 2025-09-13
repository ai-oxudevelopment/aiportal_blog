<template>
  <section class="py-6 md:py-10 lg:py-14">
    <div
      class="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pr-0 pl-0"
    >
      <div
        class="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        <HeroTopCard
          title="gpt-oss-120b"
          description="A large open model designed to run in data centers and on high-end desktops and laptops."
          buttonText="Start building"
          gradientFrom="from-sky-400"
          gradientVia="via-blue-500"
          gradientTo="to-purple-400"
        />

        <HeroTopCard
          title="gpt-oss-20b"
          description="A medium-sized open model that can run on most desktops and laptops."
          buttonText="Start building"
          gradientFrom="from-purple-400"
          gradientVia="via-violet-500"
          gradientTo="to-blue-400"
        />

        <HeroTopCard
          title="gpt-oss-2b"
          description="A medium-sized open model that can run on most desktops and laptops."
          buttonText="Start building"
          gradientFrom="from-indigo-200"
          gradientVia="via-violet-300"
          gradientTo="to-purple-200"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import HeroTopCard from './HeroTopCard.vue';

defineProps({
  docs: Array,
});
</script>
