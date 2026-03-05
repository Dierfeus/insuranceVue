<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-blue-600">Личный кабинет</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Кнопки для всех пользователей -->
      <router-link
          v-if="role === 'user'"
          :to="`/${role}/profile`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        👤 Профиль
      </router-link>

      <router-link
          v-if="role === 'user' || role === 'agent'"
          :to="`/${role}/programs`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        📑 Программы страхования
      </router-link>

      <router-link
          v-if="role === 'user'"
          :to="`/${role}/claims`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        📑 Создать заявку
      </router-link>

      <!-- Кнопки для агента -->
      <router-link
          v-if="role === 'agent'"
          :to="`/${role}/clients`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        👤 Управление клиентами
      </router-link>

      <router-link
          v-if="role === 'agent'"
          :to="`/${role}/property`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        📑 Перечень имущества от оценщика
      </router-link>

      <router-link
          v-if="role === 'agent'"
          :to="`/${role}/contracts`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        📑 Договоры с клиентами
      </router-link>

      <!-- Кнопки для инспектора -->
      <router-link
          v-if="role === 'inspector'"
          :to="`/${role}/property`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        📑 Оценка имущества
      </router-link>

      <!-- Кнопки для эксперта -->
      <router-link
          v-if="role === 'expert'"
          :to="`/${role}/reports`"
          class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
      >
        📑 Экспертные отчёты
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const role = ref<string | null>(null)

onMounted(() => {
  role.value = localStorage.getItem('role') // роль берём из localStorage
})
</script>