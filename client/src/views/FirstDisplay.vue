<template>
  <div class="auth-page" style="background: linear-gradient(to right, #bfdbfe, #93c5fd); min-height: 100vh;">
    <div class="auth-card text-center max-w-3xl">

      <!-- Заголовок -->
      <h1 class="auth-title" style="font-size: 2.5rem; color: #2563eb;">
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
            class="auth-btn auth-btn-primary"
            style="width:auto; padding:12px 24px;"
        >
          Войти
        </router-link>

        <router-link
            to="/register"
            class="auth-btn auth-btn-success"
            style="width:auto; padding:12px 24px;"
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