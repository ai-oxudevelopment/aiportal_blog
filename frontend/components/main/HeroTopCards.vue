<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    <HeroTopCard
      title="AI-Powered Content Creation"
      description="Generate high-quality content with advanced AI prompts and templates."
      buttonText="Explore Prompts"
      gradientFrom="from-blue-400"
      gradientVia="via-purple-500"
      gradientTo="to-pink-400"
    />
    <HeroTopCard
      title="Business Solutions"
      description="Streamline your workflow with professional AI tools and integrations."
      buttonText="Get Started"
      gradientFrom="from-green-400"
      gradientVia="via-teal-500"
      gradientTo="to-blue-400"
    />
  </div>
</template>

<script setup>
import HeroTopCard from './HeroTopCard.vue';
</script>
