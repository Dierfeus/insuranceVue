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

const deleteClient = async (id: string) => {
  if (!confirm('Удалить клиента?')) return

  try {
    await axios.delete(`http://localhost:5000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    clients.value = clients.value.filter(c => c._id !== id)
  } catch {
    alert('Ошибка удаления клиента')
  }
}

onMounted(loadClients)
</script>

<template>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <h2 class="main-title">Управление клиентами</h2>
    </div>

    <!-- СПИСОК КЛИЕНТОВ -->
    <div class="card-grid">

      <div v-for="client in clients" :key="client._id" class="card">

        <span class="badge-type">
          {{ client.role }}
        </span>

        <div class="program-name">
          {{ client.lastName }} {{ client.firstName }}
        </div>

        <div class="program-desc">
          {{ client.middleName || 'Без отчества' }}
        </div>

        <div class="program-footer">
          <span>Email:</span>
          <span class="footer-val">{{ client.email }}</span>
        </div>

        <div class="program-footer">
          <span>Телефон:</span>
          <span class="footer-val">{{ client.phone }}</span>
        </div>

        <div class="card-actions">
          <button
              @click="editClient(client)"
              class="btn-edit"
          >
            Редактировать
          </button>
          <button
              @click="deleteClient(client._id)"
              class="btn-edit"
              style="color:red"
          >
            Удалить
          </button>
        </div>

      </div>

    </div>

    <!-- МОДАЛКА -->
    <div v-if="showModal" class="modal-overlay">

      <div class="modal-window">

        <div class="modal-header">
          <h3>Редактировать клиента</h3>
          <button @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="updateClient" class="modal-body">

          <div class="form-group">
            <label class="form-label">Фамилия</label>
            <input v-model="selectedClient.lastName" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Имя</label>
            <input v-model="selectedClient.firstName" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Отчество</label>
            <input v-model="selectedClient.middleName" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="selectedClient.email" type="email" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input v-model="selectedClient.phone" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Дата рождения</label>
            <input v-model="birthDateString" type="date" class="form-input" />
          </div>

          <button type="submit" :disabled="loading" class="btn-primary btn-submit">
            {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>

        </form>

      </div>

    </div>

  </div>
</template>