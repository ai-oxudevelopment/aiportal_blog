<template>
  <v-app theme="dark">
    <Header @toggleMenu="toggleMenu" />
    <Sidebar :isMenuOpen="isMenuOpen" />
    <slot />
  </v-app>
</template>

<script setup>
import { ref, provide } from 'vue';
import Header from '@/components/main/Header.vue';
import Sidebar from '@/components/main/Sidebar.vue';

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

provide('isMenuOpen', isMenuOpen);
</script>
