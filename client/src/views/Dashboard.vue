<template>
  <div class="max-w-6xl mx-auto p-4">

    <!-- Вкладки -->
    <div class="flex gap-4 mb-6 border-b pb-2 flex-wrap">

      <!-- Пользователь -->
      <button v-if="role==='user'" :class="tab==='myClaims'?activeTabClass:tabClass" @click="tab='myClaims'">
        📑 Мои заявки
      </button>




      <!-- Агент -->
      <button v-if="role==='agent' || role==='expert' || role==='inspector'"
              :class="tab==='claims'?activeTabClass:tabClass"
              @click="tab='claims'">
        📑 Заявки
      </button>
      <button v-if="role==='agent'" :class="tab==='contracts'?activeTabClass:tabClass" @click="tab='contracts'">
        📑 Договоры
      </button>
      <button v-if="role==='agent' || role==='expert' || role==='inspector'" :class="tab==='clients'?activeTabClass:tabClass" @click="tab='clients'">
        👥 Клиенты
      </button>



      <!-- Оценщик -->
      <button v-if="role==='inspector'" :class="tab==='property'?activeTabClass:tabClass" @click="tab='property'">
        🏠 Оценка имущества
      </button>

      <!-- Эксперт -->
      <button v-if="role==='expert'"
              :class="tab==='programs'?activeTabClass:tabClass"
              @click="tab='programs'">
        📑 Программы
      </button>


    </div>

    <!-- Вкладки контента -->
    <div>
      <!-- Мои заявки (пользователя) -->
      <div v-if="tab==='myClaims' && role==='user'">
        <UserClaims />
      </div>

      <div v-if="tab==='clients' && (role==='agent' || role==='expert' || role==='inspector')"  >
        <AgentClients />
      </div>

      <div v-if="tab==='contracts' && role==='agent'">
        <Contracts />
      </div>

      <div v-if="tab==='claims' && (role==='agent' || role==='expert' || role==='inspector')">
        <UserClaims />
      </div>

      <div v-if="tab==='programs' && role==='expert'">
        <InsuranceProgram />
      </div>

      <div v-if="tab==='property' && role==='inspector'">
        <Property />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserClaims from './User/UserClaims.vue'
import AgentClients from "./Agent/AgentClients.vue";
import Contracts from "./Agent/Contracts.vue";
import InsuranceProgram from "./InsurancePrograms.vue";
import Property from "./Property.vue"


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