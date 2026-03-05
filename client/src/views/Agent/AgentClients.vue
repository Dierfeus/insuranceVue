<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'

interface Client {
  _id: string
  username: string
  role: 'user' | 'agent' | 'inspector' | 'expert'
  firstName: string
  lastName: string
  middleName?: string
  email: string
  phone: string
  birthDate: string
}

const clients = ref<Client[]>([])
const showModal = ref(false)
const loading = ref(false)

const selectedClient = reactive<Client>({
  _id: '',
  username: '',
  role: 'user',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  birthDate: ''
})

const birthDateString = ref('')  // для input type=date
const token = localStorage.getItem('token')

// Загрузка списка клиентов
const loadClients = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    clients.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки клиентов', err)
  }
}

// Открытие модального окна для редактирования
const editClient = (client: Client) => {
  Object.assign(selectedClient, client)
  birthDateString.value = client.birthDate ? client.birthDate.split('T')[0] : ''
  showModal.value = true
}

// Синхронизация даты с объектом клиента
watch(birthDateString, (newVal) => {
  if (selectedClient) selectedClient.birthDate = newVal
})

// Сохранение изменений клиента
const updateClient = async () => {
  try {
    loading.value = true
    await axios.put(
        `http://localhost:5000/api/users/${selectedClient._id}`,
        {
          firstName: selectedClient.firstName,
          lastName: selectedClient.lastName,
          middleName: selectedClient.middleName,
          email: selectedClient.email,
          phone: selectedClient.phone,
          birthDate: selectedClient.birthDate,
          role: selectedClient.role
        },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    alert('Клиент обновлён')
    showModal.value = false
    loadClients()
  } catch (err) {
    alert('Ошибка обновления клиента')
  } finally {
    loading.value = false
  }
}

onMounted(loadClients)
</script>

<template>
  <div class="max-w-6xl mx-auto">

    <!-- Заголовок и кнопка назад -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blue-600">Клиенты</h2>
      <router-link
          to="/agent"
          class="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
      >
        ← Назад
      </router-link>
    </div>

    <!-- Список клиентов -->
    <div v-for="client in clients" :key="client._id"
         class="bg-white shadow p-4 mb-3 rounded-xl flex justify-between items-center">
      <div>
        <p><strong>ФИО:</strong> {{ client.lastName }} {{ client.firstName }} {{ client.middleName || '' }}</p>
        <p><strong>Email:</strong> {{ client.email }}</p>
        <p><strong>Телефон:</strong> {{ client.phone }}</p>
        <p><strong>Роль:</strong> {{ client.role }}</p>
      </div>
      <button @click="editClient(client)" class="bg-yellow-500 text-white px-3 py-1 rounded">
        Изменить
      </button>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button @click="showModal = false" class="absolute top-3 right-3 text-gray-500">✕</button>
        <h3 class="text-xl font-bold mb-4 text-blue-600">Редактировать клиента</h3>

        <form @submit.prevent="updateClient" class="space-y-4">

          <div>
            <label class="block text-sm font-semibold">Фамилия</label>
            <input v-model="selectedClient.lastName" class="w-full border rounded-lg p-2" />
          </div>

          <div>
            <label class="block text-sm font-semibold">Имя</label>
            <input v-model="selectedClient.firstName" class="w-full border rounded-lg p-2" />
          </div>

          <div>
            <label class="block text-sm font-semibold">Отчество</label>
            <input v-model="selectedClient.middleName" class="w-full border rounded-lg p-2" />
          </div>

          <div>
            <label class="block text-sm font-semibold">Email</label>
            <input v-model="selectedClient.email" type="email" class="w-full border rounded-lg p-2" />
          </div>

          <div>
            <label class="block text-sm font-semibold">Телефон</label>
            <input v-model="selectedClient.phone" class="w-full border rounded-lg p-2" />
          </div>

          <div>
            <label class="block text-sm font-semibold">Дата рождения</label>
            <input v-model="birthDateString" type="date" class="w-full border rounded-lg p-2" />
          </div>

          <div>
            <label class="block text-sm font-semibold">Роль</label>
            <select v-model="selectedClient.role" class="w-full border rounded-lg p-2">
              <option value="user">Пользователь</option>
              <option value="agent">Агент</option>
              <option value="inspector">Оценщик</option>
              <option value="expert">Эксперт</option>
            </select>
          </div>

          <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  </div>
</template>