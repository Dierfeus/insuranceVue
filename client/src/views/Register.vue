<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Регистрация</h2>

      <input v-model="lastName" placeholder="Фамилия" class="w-full p-3 mb-3 border rounded-lg"/>
      <input v-model="firstName" placeholder="Имя" class="w-full p-3 mb-3 border rounded-lg"/>
      <input v-model="middleName" placeholder="Отчество" class="w-full p-3 mb-3 border rounded-lg"/>

      <input v-model="phone" placeholder="Номер телефона" class="w-full p-3 mb-3 border rounded-lg"/>
      <input v-model="email" type="email" placeholder="Email" class="w-full p-3 mb-3 border rounded-lg"/>
      <input v-model="birthDate" type="date" class="w-full p-3 mb-3 border rounded-lg"/>

      <input v-model="username" placeholder="Логин" class="w-full p-3 mb-3 border rounded-lg"/>
      <input v-model="password" type="password" placeholder="Пароль" class="w-full p-3 mb-3 border rounded-lg"/>

      <button
          @click="register"
          class="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition">
        Зарегистрироваться
      </button>

      <p class="mt-3 text-sm text-center">
        Есть аккаунт?
        <router-link to="/" class="text-blue-500">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

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
    alert('Ошибка регистрации')
  }
}
</script>