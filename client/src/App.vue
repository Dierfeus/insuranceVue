<script setup lang="ts">
import { auth } from './store/auth'
import { useRouter } from 'vue-router'
import { RolesEnum } from './type/RolesEnum.ts'
import { computed } from 'vue'
import { ref } from 'vue'

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

const showError = ref(false)
const errorMessage = ref('')

const openError = (msg: string) => {
  errorMessage.value = msg
  showError.value = true
}

const closeError = () => {
      showError.value = false
      errorMessage.value = ''
    }

// 👇 экспорт через window (быстро и просто для проекта)
;(window as any).$error = openError

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
            Профиль
          </button>

          <button v-if="auth.token" @click="logout" class="btn btn-logout">
            Выйти
          </button>
        </div>

    </header>

    <!-- Основной контент -->
    <main class="main-content">
      <router-view/>
    </main>

  </div>


  <!-- общее -->
  <div v-if="showError" class="modal-overlay">
    <div class="modal-window error-modal">

      <div class="modal-header">
        <h3>Ошибка</h3>
        <button @click="closeError">✕</button>
      </div>

      <div class="modal-body">
        <p class="error-text">
          {{ errorMessage }}
        </p>

        <button class="btn-primary btn-submit" @click="closeError">
          Понятно
        </button>
      </div>

    </div>
  </div>
</template>