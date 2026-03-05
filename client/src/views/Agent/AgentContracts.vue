<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

interface Contract {
  _id?: string
  clientId: string
  programId: string
  startDate: string
  endDate: string
}

const contracts = ref<Contract[]>([])
const showModal = ref(false)
const form = reactive<Contract>({
  clientId: '',
  programId: '',
  startDate: '',
  endDate: ''
})

const token = localStorage.getItem('token')

const loadContracts = async () => {
  const res = await axios.get('http://localhost:5000/api/contracts', {
    headers: { Authorization: `Bearer ${token}` }
  })
  contracts.value = res.data
}

const saveContract = async () => {
  await axios.post('http://localhost:5000/api/contracts', form, {
    headers: { Authorization: `Bearer ${token}` }
  })
  showModal.value = false
  Object.assign(form, { clientId: '', programId: '', startDate: '', endDate: '' })
  loadContracts()
}

onMounted(loadContracts)
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between mb-6">
      <h2 class="text-2xl font-bold text-blue-600">Договоры</h2>
      <button @click="showModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Новый договор</button>
    </div>

    <div v-for="c in contracts" :key="c._id"
         class="bg-white shadow p-4 mb-3 rounded-xl">
      <p><strong>Клиент:</strong> {{ c.clientId }}</p>
      <p><strong>Программа:</strong> {{ c.programId }}</p>
      <p><strong>Срок:</strong> {{ c.startDate }} — {{ c.endDate }}</p>
    </div>

    <!-- Модальное окно создания договора -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button @click="showModal = false" class="absolute top-3 right-3 text-gray-500">✕</button>
        <h3 class="text-xl font-bold mb-4 text-blue-600">Новый договор</h3>

        <form @submit.prevent="saveContract" class="space-y-4">
          <div>
            <label>ID клиента</label>
            <input v-model="form.clientId" class="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label>ID программы</label>
            <input v-model="form.programId" class="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label>Дата начала</label>
            <input type="date" v-model="form.startDate" class="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label>Дата окончания</label>
            <input type="date" v-model="form.endDate" class="w-full border rounded-lg p-2" />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg">Создать</button>
        </form>
      </div>
    </div>
  </div>
</template>