<template>
  <div class="max-w-6xl mx-auto p-4">

    <div class="flex gap-4 mb-6 border-b pb-2 flex-wrap">
      <button 
        v-if="role === 'user'" 
        :class="tab === 'myClaims' ? activeTabClass : tabClass" 
        @click="tab = 'myClaims'"
      >
        Мои заявки
      </button>

      <button 
        v-if="role === 'agent'" 
        :class="tab === 'claims' ? activeTabClass : tabClass" 
        @click="tab = 'claims'"
      >
        Заявки
      </button>
      
      <button 
        v-if="role === 'agent'" 
        :class="tab === 'contracts' ? activeTabClass : tabClass" 
        @click="tab = 'contracts'"
      >
        Договоры
      </button>
      
      <button 
        v-if="role === 'agent'" 
        :class="tab === 'clients' ? activeTabClass : tabClass" 
        @click="tab = 'clients'"
      >
        Клиенты
      </button>
      
      <button 
        v-if="role === 'agent'" 
        :class="tab === 'property' ? activeTabClass : tabClass" 
        @click="tab = 'property'"
      >
        Оценка имущества
      </button>

      <button 
        v-if="role === 'expert'" 
        :class="tab === 'claims' ? activeTabClass : tabClass" 
        @click="tab = 'claims'"
      >
        Заявки
      </button>
      
      <button 
        v-if="role === 'expert'" 
        :class="tab === 'clients' ? activeTabClass : tabClass" 
        @click="tab = 'clients'"
      >
        Клиенты
      </button>
      
      <button 
        v-if="role === 'expert'" 
        :class="tab === 'programs' ? activeTabClass : tabClass" 
        @click="tab = 'programs'"
      >
        Программы
      </button>

      <button 
        v-if="role === 'inspector'" 
        :class="tab === 'claims' ? activeTabClass : tabClass" 
        @click="tab = 'claims'"
      >
        Заявки
      </button>
      
      <button 
        v-if="role === 'inspector'" 
        :class="tab === 'clients' ? activeTabClass : tabClass" 
        @click="tab = 'clients'"
      >
        Клиенты
      </button>
      
      <button 
        v-if="role === 'inspector'" 
        :class="tab === 'property' ? activeTabClass : tabClass" 
        @click="tab = 'property'"
      >
        Оценка имущества
      </button>

      <button 
        v-if="role === 'admin'" 
        :class="tab === 'adminCreateuser' ? activeTabClass : tabClass" 
        @click="tab = 'adminCreateuser'"
      >
        Создание Пользователей
      </button>

    </div>

    <div>
      <!-- заявки юзера -->
      <UserClaims v-if="tab === 'myClaims' && role === 'user'" />

      <!-- просмотр заявок -->
      <Claims v-if="tab === 'claims' && (role === 'agent' || role === 'expert' || role === 'inspector')" />

      <!-- клиента -->
      <AgentClients v-if="tab === 'clients' && (role === 'agent' || role === 'expert' || role === 'inspector')" />

      <!-- договоры -->
      <Contracts v-if="tab === 'contracts' && role === 'agent'" />

      <!-- программы -->
      <InsurancePrograms v-if="tab === 'programs' && role === 'expert'" />

      <!-- имущество -->
      <Property v-if="tab === 'property' && (role === 'inspector' || role === 'agent')" />

      <!-- имущество -->
      <AdminCreateUser v-if="tab === 'adminCreateuser' && (role === 'admin')" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserClaims from './Claims.vue'
import Claims from './Claims.vue'
import AgentClients from "./Agent/AgentClients.vue"
import Contracts from "./Agent/Contracts.vue"
import InsurancePrograms from "./InsurancePrograms.vue"
import Property from "./Property.vue"
import AdminCreateUser from "./AdminCreateUser.vue"

const role = ref<string | null>(null)
const tab = ref<string>('')

const tabClass = 'px-3 py-1 rounded hover:bg-gray-100 cursor-pointer'
const activeTabClass = 'px-3 py-1 rounded bg-blue-600 text-white cursor-pointer'

const getDefaultTab = (userRole: string): string => {
  switch (userRole) {
    case 'user':
      return 'myClaims'
    case 'agent':
      return 'claims'
    case 'expert':
      return 'claims'
    case 'inspector':
      return 'claims'
    case 'admin':
      return 'adminCreateuser'
    default:
      return ''
  }
}

onMounted(() => {
  const userRole = localStorage.getItem('role')
  role.value = userRole
  
  if (userRole) {
    tab.value = getDefaultTab(userRole)
  }
})
</script>

<style scoped>
button { 
  transition: all 0.2s; 
}

.bg-blue-600 {
  background-color: #2563eb;
}

.text-white {
  color: white;
}

.hover\:bg-gray-100:hover {
  background-color: #f1f5f9;
}
</style>