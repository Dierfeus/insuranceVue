<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
<div class="bg-white p-8 rounded-2xl shadow-2xl w-96">
<h2 class="text-2xl font-bold mb-6 text-center">Вход</h2>
    <input v-model="username" placeholder="Логин" class="w-full p-3 mb-3 border rounded-lg"/>
<input v-model="password" type="password" placeholder="Пароль" class="w-full p-3 mb-3 border rounded-lg"/>
<button @click="login" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
    Войти
    </button>
    <p class="mt-3 text-sm text-center">Нет аккаунта? <router-link to="/register" class="text-blue-500">Регистрация</router-link></p>
</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

const username = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
    try {
        await auth.login(username.value, password.value)
        router.push('/dashboard')
    } catch (err) {
        alert('Ошибка входа')
    }
}
</script>