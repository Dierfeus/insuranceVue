<template>
  <!-- Модальное окно для добавления договора (только агент) -->
  <div
      v-if="showModal && userRole === 'agent'"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
  >
    <div class="bg-white rounded-2xl p-8 w-full max-w-lg relative">

      <button
          @click="closeModal"
          class="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h3 class="text-xl font-bold mb-6 text-blue-600">
        Создание нового договора
      </h3>

      <form @submit.prevent="submitContract" class="space-y-4">

        <!-- Выбор клиента по телефону -->
        <div>
          <label class="block mb-1 font-semibold">Клиент (по телефону)</label>
          <input
              type="text"
              v-model="form.clientPhone"
              placeholder="Введите номер телефона"
              class="w-full border rounded-lg p-2"
              list="clients-list"
              required
          />
          <datalist id="clients-list">
            <option v-for="c in clients" :key="c._id" :value="c.phone">
              {{ c.firstName }} {{ c.lastName }}
            </option>
          </datalist>
        </div>

        <!-- Выбор программы страхования -->
        <div>
          <label class="block mb-1 font-semibold">Программа страхования</label>
          <select v-model="form.programId" class="w-full border rounded-lg p-2" required>
            <option value="">Выберите программу</option>
            <option v-for="p in programs" :key="p._id" :value="p._id">
              {{ p.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1 font-semibold">Сумма</label>
          <input type="number" v-model.number="form.amount" class="w-full border rounded-lg p-2" required/>
        </div>

        <div>
          <label class="block mb-1 font-semibold">Дата</label>
          <input type="date" v-model="form.date" class="w-full border rounded-lg p-2" required/>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Создать договор
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

interface Contract {
  _id?: string
  clientName: string
  programName: string
  amount: number
  date: string
  status: string
}

interface Program {
  _id: string
  name: string
}

interface Client {
  _id: string
  firstName: string
  lastName: string
}

const contracts = ref<Contract[]>([])
const programs = ref<Program[]>([])
const clients = ref<Client[]>([])
const showModal = ref(false)
const userRole = ref<string>('user') // подтягиваем роль пользователя

const form = reactive({
  clientId: '',
  programId: '',
  amount: 0,
  date: ''
})

const token = localStorage.getItem('token')

// Загрузка договоров
const loadContracts = async () => {
  try {
    let url = userRole.value === 'user'
        ? 'http://localhost:5000/api/contracts/my'
        : 'http://localhost:5000/api/contracts'
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    contracts.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки договоров', err)
  }
}

// Загрузка программ
const loadPrograms = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/programs')
    programs.value = res.data
  } catch {}
}

// Загрузка клиентов (только для агента)
const loadClients = async () => {
  if (userRole.value !== 'agent') return
  try {
    const res = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } })
    clients.value = res.data
  } catch {}
}

const openModal = () => showModal.value = true
const closeModal = () => showModal.value = false

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString()

// Создание нового договора (только агент)
const submitContract = async () => {
  try {
    await axios.post(
        'http://localhost:5000/api/contracts',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    closeModal()
    loadContracts()
  } catch {
    alert('Ошибка создания договора')
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  // Определяем роль пользователя
  const me = await axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
  userRole.value = me.data.role

  await loadContracts()
  await loadPrograms()
  await loadClients()
})
</script>