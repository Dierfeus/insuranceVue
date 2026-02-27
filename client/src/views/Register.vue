<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Регистрация</h2>
      <input v-model="username" placeholder="Логин" class="w-full p-3 mb-3 border rounded-lg"/>
      <input v-model="password" type="password" placeholder="Пароль" class="w-full p-3 mb-3 border rounded-lg"/>
      <select v-model="role" class="w-full p-3 mb-3 border rounded-lg">
        <option disabled value="">Выберите роль</option>
        <option value="user">Клиент</option>
        <option value="agent">Агент</option>
        <option value="inspector">Осмотрщик</option>
        <option value="expert">Эксперт</option>
      </select>
      <button @click="register" class="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition">
        Зарегистрироваться
      </button>
      <p class="mt-3 text-sm text-center">Есть аккаунт? <router-link to="/" class="text-blue-500">Войти</router-link></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

const username = ref('')
const password = ref('')
const role = ref('')
const router = useRouter()

const register = async () => {
  try {
    await auth.register(username.value, password.value, role.value)
    alert('Аккаунт создан!')
    router.push('/')
  } catch {
    alert('Ошибка регистрации')
  }
}
</script>