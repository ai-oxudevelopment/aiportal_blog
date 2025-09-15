<template>
  <div class="min-h-screen bg-black text-gray-100">

    <div class="flex">
      <main class="pt-14 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">

          <section id="prompts-section" class="mb-8">
            <div class="text-center py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-lg shadow-xl">

              <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                Библиотека агентов
              </h1>
              <p class="mt-8 text-lg md:text-xl text-gray-400">
                Добро пожаловать в aiworkplace — платформу для операционных сотрудников. <br>
                Здесь вы найдете готовые инструкции для AI-моделей и сможете использовать их в своей работе.
              </p>
            </div>
          </section>

          <!-- Prompts Section -->
           <Section />
        
           
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Section from '~/components/main/Section.vue';
</script>

<style scoped>
.container {
  max-width: 800px;
}
.search-bar input {
  transition: border-color 0.3s ease;
}
.search-bar input:focus {
  border-color: #4a5568;
}
.category-item {
  transition: background-color 0.3s ease;
}
.category-item:hover {
  background-color: #2d3748;
}
</style>
