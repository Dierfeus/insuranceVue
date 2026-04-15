<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Регистрация</h2>

      <input v-model="lastName" placeholder="Фамилия" class="auth-input"/>
      <input v-model="firstName" placeholder="Имя" class="auth-input"/>
      <input v-model="middleName" placeholder="Отчество" class="auth-input"/>

      <input v-model="phone" placeholder="Номер телефона" class="auth-input"/>
      <input v-model="email" type="email" placeholder="Email" class="auth-input"/>
      <input v-model="birthDate" type="date" class="auth-input"/>

      <input v-model="username" placeholder="Логин" class="auth-input"/>
      <input v-model="password" type="password" placeholder="Пароль" class="auth-input"/>

      <button @click="register" class="auth-btn auth-btn-success">
        Зарегистрироваться
      </button>

      <p class="auth-text-link">
        Есть аккаунт? <router-link to="/login">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'
import { showError } from '../store/Modal'

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const phone = ref('')
const email = ref('')
const birthDate = ref('')

const username = ref('')
const password = ref('')

const router = useRouter()

const register = async () => {
  try {
    await auth.register({
      username: username.value,
      password: password.value,
      role: 'user', // роль всегда user
      firstName: firstName.value,
      lastName: lastName.value,
      middleName: middleName.value,
      phone: phone.value,
      email: email.value,
      birthDate: birthDate.value
    })

    alert('Аккаунт создан!')
    router.push('/')
  } catch (e) {
    showError('Ошибка регистрации')
  }
}
</script>