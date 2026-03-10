<template>
  <div class="max-w-6xl mx-auto p-4">

    <!-- Вкладки -->
    <div class="flex gap-4 mb-6 border-b pb-2 flex-wrap">

      <!-- Пользователь -->
      <button v-if="role==='user'" :class="tab==='myClaims'?activeTabClass:tabClass" @click="tab='myClaims'">
        📑 Мои заявки
      </button>
      <button v-if="role==='user'" :class="tab==='profile'?activeTabClass:tabClass" @click="tab='profile'">
        👤 Профиль
      </button>



      <!-- Агент -->
      <button v-if="role==='agent'" :class="tab==='claims'?activeTabClass:tabClass" @click="tab='claims'">
        📑 Заявки
      </button>
      <button v-if="role==='agent'" :class="tab==='createClaim'?activeTabClass:tabClass" @click="tab='createClaim'">
        ➕ Создать заявку
      </button>
      <button v-if="role==='agent'" :class="tab==='contracts'?activeTabClass:tabClass" @click="tab='contracts'">
        📑 Договоры
      </button>
      <button v-if="role==='agent'" :class="tab==='createContract'?activeTabClass:tabClass" @click="tab='createContract'">
        ➕ Создать договор
      </button>
      <button v-if="role==='agent'" :class="tab==='clients'?activeTabClass:tabClass" @click="tab='clients'">
        👥 Клиенты
      </button>



      <!-- Оценщик -->
      <button v-if="role==='inspector'" :class="tab==='property'?activeTabClass:tabClass" @click="tab='property'">
        🏠 Оценка имущества
      </button>



      <!-- Эксперт -->
      <button v-if="role==='expert' || role==='actuary'" :class="tab==='claims'?activeTabClass:tabClass" @click="tab='claims'">
        📑 Заявки
      </button>
    </div>

    <!-- Вкладки контента -->
    <div>
      <!-- Мои заявки (для пользователя) -->
      <div v-if="tab==='myClaims' && role==='user'">
        <UserClaims />
      </div>

      <!-- Профиль пользователя -->
      <div v-if="tab==='profile' && role==='user'">
        <UserProfile :userId="userId" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserProfile from './User/UserProfile.vue'
import UserClaims from './User/UserClaims.vue'

const role = ref<string|null>(null)
const tab = ref<string>('myClaims') // по умолчанию вкладка "Мои заявки"
const userId = ref<string|null>(null)

onMounted(() => {
  role.value = localStorage.getItem('role')
  userId.value = localStorage.getItem('userId')
})

const tabClass = 'px-3 py-1 rounded hover:bg-gray-100 cursor-pointer'
const activeTabClass = 'px-3 py-1 rounded bg-blue-600 text-white cursor-pointer'
</script>

<style scoped>
button { transition: all 0.2s; }
</style>