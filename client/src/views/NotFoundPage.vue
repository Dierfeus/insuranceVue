<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div class="text-center">
      <h1 class="text-8xl font-extrabold text-red-500 mb-4">404</h1>
      <h2 class="text-3xl font-semibold mb-2 text-gray-700">Страница не найдена</h2>
      <p class="text-gray-500 mb-6">К сожалению, такой страницы не существует.</p>
      <router-link
          to="/"
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        На главную
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Можно добавить логику, например, логирование 404
</script>

<style scoped>
/* Плавная анимация кнопки */
.router-link:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}
</style>