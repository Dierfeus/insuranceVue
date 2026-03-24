<script setup lang="ts">
import { auth } from './store/auth'
import { useRouter } from 'vue-router'
import { RolesEnum } from './type/RolesEnum.ts'
import { computed } from 'vue'

const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/')
}

const UserRole = computed((): string => {
  if (!auth.role) return 'Unknown'

  const role = auth.role as keyof typeof RolesEnum
  return RolesEnum[role]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Хедер -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto flex items-center justify-between p-4 md:p-6">

        <!-- Логотип -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
          <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            SI
          </div>
          <span class="text-2xl font-bold text-blue-600">SafeInsure</span>
        </div>

        <!-- Навигация и информация о пользователе -->
        <!-- Навигация и информация о пользователе -->
        <div class="flex items-center gap-4 md:gap-6">

          <button
              v-if="auth.token"
              @click="router.push('/profile')"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5.121 17.804A9 9 0 1118.364 4.56a9 9 0 01-13.243 13.243zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Профиль
          </button>

          <button
              v-if="auth.token"
              @click="logout"
              class="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"/>
            </svg>
            Выйти
          </button>

        </div>

      </div>
    </header>

    <!-- Основной контент -->
    <main class="flex-1 p-6 max-w-6xl mx-auto w-full">
      <router-view />
    </main>

  </div>
</template>

<style scoped>
header {
  transition: all 0.3s ease;
}
header:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
button svg {
  stroke-width: 2;
}
</style>