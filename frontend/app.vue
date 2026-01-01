<template>
  <NuxtPage />
</template>

<script setup>
// PWA iOS Meta Tags and Configuration
useHead({
  meta: [
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'AI Portal' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'theme-color', content: '#ff1493' },
    { name: 'application-name', content: 'AI Portal' },
    { name: 'apple-touch-fullscreen', content: 'yes' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover' }
  ],
  link: [
    { rel: 'apple-touch-icon', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ]
})
</script>
