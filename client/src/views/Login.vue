<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Вход</h2>

      <form @submit.prevent="login">
        <input 
          v-model="username" 
          placeholder="Логин" 
          class="auth-input"
        />
        
        <div class="password-wrapper">
          <input 
            v-model="password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Пароль" 
            class="auth-input"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
          >
            <EyeOffIcon v-if="showPassword" />
            <EyeIcon v-else />
          </button>
        </div>

        <button 
          type="submit" 
          class="auth-btn auth-btn-primary"
        >
          Войти
        </button>
      </form>

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
import { EyeIcon, EyeOffIcon } from '../components/icons/index'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
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

<style scoped>
/* Специфичные стили для страницы входа */
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.auth-card {
  max-width: 400px;
}

.auth-title {
  font-size: 1.75rem;
}

.auth-btn-primary {
  padding: 12px;
  font-size: 1rem;
}

.auth-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
    margin: 0 8px;
  }
  .auth-title {
    font-size: 1.3rem;
  }
  .auth-input {
    font-size: 0.9rem;
    padding: 8px 12px;
  }
}
</style>