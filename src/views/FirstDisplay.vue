<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 px-4">
    <div class="bg-white rounded-2xl shadow-lg max-w-3xl w-full p-10 text-center">

      <!-- Заголовок -->
      <h1 class="text-4xl font-bold text-blue-600 mb-4">
        Добро пожаловать в компанию "SafeInsure"
      </h1>

      <!-- Подзаголовок / Описание -->
      <p class="text-gray-700 mb-8 text-lg">
        Мы помогаем защитить ваше имущество, здоровье и автомобиль. Начните страховать свои ценности уже сегодня!
      </p>

      <!-- Кнопки -->
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <router-link
            to="/login"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Войти
        </router-link>

        <router-link
            to="/register"
            class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Зарегистрироваться
        </router-link>
      </div>

      <!-- Дополнительный текст -->
      <p class="text-gray-500 mt-6 text-sm">
        Регистрация займет всего пару минут. Начните защищать то, что дорого именно вам.
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
// Здесь можно добавить логику, если нужно динамически менять приветствие или показывать уведомления
</script>

<style scoped>
/* Плавные переходы для кнопок уже включены через Tailwind hover: и transition */
</style>