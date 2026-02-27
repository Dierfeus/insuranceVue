<template>
  <!-- Навигация -->
  <div class="min-h-screen bg-gray-50">
    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Insurance System</h1>
      <div v-if="auth.token">
        <span class="mr-4">Роль: {{ auth.role }}</span>
        <button @click="logout" class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">
          Выйти
        </button>
      </div>
    </header>

    <!-- Основной контент через router-view -->
    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { auth } from './store/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style>
/* Можно добавить дополнительные стили если нужно */
</style>