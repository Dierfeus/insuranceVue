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
  <div class="page-wrapper">

    <!-- Хедер -->
    <header class="header">

        <!-- Логотип слева -->
        <div class="logo" @click="router.push('/')">
          <div class="logo-icon">SI</div>
          <span class="logo-text">SafeInsure</span>
        </div>

        <!-- Кнопки справа -->
        <div class="header-actions">
          <button v-if="auth.token && auth.role === 'user'" @click="router.push('/profile')" class="btn btn-profile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5.121 17.804A9 9 0 1118.364 4.56a9 9 0 01-13.243 13.243zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Профиль
          </button>

          <button v-if="auth.token" @click="logout" class="btn btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"/>
            </svg>
            Выйти
          </button>
        </div>

    </header>

    <!-- Основной контент -->
    <main class="main-content">
      <router-view/>
    </main>

  </div>
</template>