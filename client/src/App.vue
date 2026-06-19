<script setup lang="ts">
import { auth } from './store/auth'
import { useRouter } from 'vue-router'
import { RolesEnum } from './type/RolesEnum.ts'
import { computed } from 'vue'
import Modal from "./components/Modal.vue"

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

    <header class="header">
        <div class="logo" @click="router.push('/')">
          <div class="logo-icon">БС</div>
          <span class="logo-text">Безопасное страхование</span>
        </div>
        <div class="header-actions">
          <button v-if="auth.token && auth.role === 'user'" @click="router.push('/profile')" class="btn btn-profile">
            Профиль
          </button>

          <button v-if="auth.token" @click="logout" class="btn btn-logout">
            Выйти
          </button>
        </div>

    </header>

    <main class="main-content">
      <router-view/>
    </main>

  </div>
<Modal />
</template>