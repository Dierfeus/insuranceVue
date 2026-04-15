<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Вход</h2>

      <input v-model="username" placeholder="Логин" class="auth-input"/>
      <input v-model="password" type="password" placeholder="Пароль" class="auth-input"/>

      <button @click="login" class="auth-btn auth-btn-primary">
        Войти
      </button>

      <p class="auth-text-link">
        Нет аккаунта? <router-link to="/register">Регистрация</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'
import { showError } from '../store/Modal'

const username = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
    try {
        await auth.login(username.value, password.value)
        router.push('/dashboard')
    } catch (err) {
      showError('Ошибка входа')
    }
}
</script>