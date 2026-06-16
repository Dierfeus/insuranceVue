<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { showSuccess, showError, showConfirm } from '../../store/Modal'

const searchQuery = ref('');

const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value;
  
  const query = searchQuery.value.toLowerCase();
  return clients.value.filter(client => 
    client.lastName.toLowerCase().includes(query) ||
    client.firstName.toLowerCase().includes(query) ||
    client.email.toLowerCase().includes(query) ||
    client.phone.includes(query)
  );
});

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
    showError('Ошибка загрузки клиентов')
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
    showSuccess('Клиент успешно обновлён')
    showModal.value = false
    await loadClients()
  } catch (err) {
    showError('Ошибка обновления клиента')
  } finally {
    loading.value = false
  }
}

// Удаление клиента с подтверждением
const deleteClient = (id: string) => {
  showConfirm({
    title: 'Удаление клиента',
    message: 'Вы действительно хотите удалить этого клиента? Это действие нельзя отменить.',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        clients.value = clients.value.filter(c => c._id !== id)
        showSuccess('Клиент успешно удалён')
      } catch (err) {
        showError('Ошибка удаления клиента')
      }
    }
  })
}

onMounted(loadClients)
</script>

<template>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <h2 class="main-title">Управление клиентами</h2>
    </div>

    <!-- ПОИСК -->
    <div style="margin-bottom: 24px;">
      <div style="position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по фамилии, имени, email или телефону..."
          class="form-input"
          style="padding-left: 36px;"
        />
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.6;">🔍</span>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8;"
        >
          ✕
        </button>
      </div>
      <div v-if="searchQuery" style="margin-top: 8px; font-size: 0.8rem; color: #64748b;">
        Найдено: {{ filteredClients.length }} из {{ clients.length }} клиентов
      </div>
    </div>

    <!-- Список клиентов -->
    <div v-if="filteredClients.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
      По запросу ничего не найдено
    </div>

    <div class="card-grid">

      <div v-for="client in filteredClients" :key="client._id" class="card">

        <span class="badge-type">
          {{ client.role === 'user' ? 'Клиент' : client.role }}
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

    <!-- МОДАЛКА РЕДАКТИРОВАНИЯ -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">Редактировать клиента</h3>
          <button 
            @click="showModal = false" 
            style="background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px;"
            @mouseenter="(e) => e.target.style.background = '#f1f5f9'"
            @mouseleave="(e) => e.target.style.background = 'transparent'"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="updateClient">
          <div class="form-group">
            <label class="form-label">Фамилия</label>
            <input v-model="selectedClient.lastName" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Имя</label>
            <input v-model="selectedClient.firstName" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Отчество</label>
            <input v-model="selectedClient.middleName" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="selectedClient.email" type="email" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input v-model="selectedClient.phone" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Дата рождения</label>
            <input v-model="birthDateString" type="date" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Роль</label>
            <select v-model="selectedClient.role" class="form-select">
              <option value="user">Пользователь</option>
              <option value="agent">Агент</option>
              <option value="inspector">Оценщик</option>
              <option value="expert">Эксперт</option>
            </select>
          </div>

          <button type="submit" :disabled="loading" class="btn-primary btn-submit">
            {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </form>

      </div>
    </div>

  </div>
</template>