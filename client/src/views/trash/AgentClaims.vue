<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { auth } from '../../store/auth'
import { showSuccess } from '../../store/Modal'

const token = localStorage.getItem('token')
const role = auth.role

// Состояния
const showCreateClaim = ref(false)
const programs = ref<any[]>([])
const claims = ref<any[]>([])  // <-- ДОБАВЛЕНО: массив для хранения заявок
const loading = ref(false)
const searchQuery = ref('')     // <-- ДЛЯ ПОИСКА

// Текущая дата для валидации
const today = new Date()
const minStartDate = today.toISOString().split('T')[0]

// Форма создания заявки
const form = reactive({
  // клиент
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  
  // заявка
  programId: '',
  durationDays: 7,
  startDate: ''
})

// ========== ФУНКЦИЯ ЗАГРУЗКИ ВСЕХ ЗАЯВОК (ДОБАВЛЕНА) ==========
const loadAllClaims = async () => {
  try {
    const res = await axios.get(
      'http://localhost:5000/api/claims',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    claims.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки заявок', err)
  }
}

// ========== ПОИСК И ФИЛЬТРАЦИЯ ==========
const filteredClaims = computed(() => {
  if (!searchQuery.value) return claims.value
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return claims.value.filter(claim => {
    // Поиск по ID заявки (последние 6 символов)
    const idMatch = claim._id.slice(-6).toLowerCase().includes(query)
    
    // Поиск по программе
    const programMatch = claim.program?.name?.toLowerCase().includes(query) || false
    
    // Поиск по клиенту (ФИО)
    const clientName = claim.user 
      ? `${claim.user.lastName || ''} ${claim.user.firstName || ''} ${claim.user.middleName || ''}`.toLowerCase()
      : ''
    const clientMatch = clientName.includes(query)
    
    // Поиск по телефону
    const phoneMatch = claim.user?.phone?.includes(query) || false
    
    // Поиск по статусу (на русском)
    const statusMap: Record<string, string> = {
      'pending': 'отправлено',
      'approved': 'одобрена',
      'rejected': 'отклонена',
      'evaluated': 'оценена',
      'priced': 'рассчитана',
      'closed': 'закрыта'
    }
    const statusText = statusMap[claim.status] || claim.status
    const statusMatch = statusText.toLowerCase().includes(query)
    
    // Поиск по имуществу
    const propertyMatch = (claim.propertyData?.address || claim.propertyData?.carModel || '')
      .toLowerCase()
      .includes(query)
    
    return idMatch || programMatch || clientMatch || phoneMatch || statusMatch || propertyMatch
  })
})

// Загрузка программ
const loadPrograms = async () => {
  try {
    const res = await axios.get(
      'http://localhost:5000/api/programs',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    programs.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки программ')
  }
}

// Создание заявки
const submitClaim = async () => {
  loading.value = true
  
  try {
    // Подготавливаем данные для отправки
    const claimData = {
      lastName: form.lastName,
      firstName: form.firstName,
      middleName: form.middleName,
      phone: form.phone,
      email: form.email,
      username: form.username,
      password: form.password,
      programId: form.programId,
      durationDays: form.durationDays,
      startDate: form.startDate
    }
    
    await axios.post(
      'http://localhost:5000/api/claims',
      claimData,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
     showSuccess('Заявка создана')
    
    // Сброс формы
    Object.assign(form, {
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      programId: '',
      durationDays: 7,
      startDate: ''
    })
    
    showCreateClaim.value = false
    
    await loadAllClaims()
    
  } catch(err: any) {
    console.error(err)
     showSuccess(err.response?.data?.message || 'Ошибка создания заявки')
  } finally {
    loading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Отправлено',
    'approved': 'Одобрена',
    'rejected': 'Отклонена',
    'evaluated': 'Оценена',
    'priced': 'Рассчитана',
    'closed': 'Закрыта'
  }
  return statusMap[status] || status
}

// Получение цвета статуса
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': 'text-yellow-600 bg-yellow-50',
    'approved': 'text-green-600 bg-green-50',
    'rejected': 'text-red-600 bg-red-50',
    'evaluated': 'text-blue-600 bg-blue-50',
    'priced': 'text-purple-600 bg-purple-50',
    'closed': 'text-gray-600 bg-gray-50'
  }
  return colorMap[status] || 'text-gray-600 bg-gray-50'
}

// Форматирование даты
const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}

// Обработка изменения статуса
const changeStatus = async (claimId: string, newStatus: string) => {
  if (!confirm(`Изменить статус заявки на "${getStatusText(newStatus)}"?`)) return
  
  try {
    await axios.put(
      `http://localhost:5000/api/claims/${claimId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    showSuccess('Статус обновлён')
    await loadAllClaims()
  } catch (err) {
    console.error(err)
    showSuccess('Ошибка обновления статуса')
  }
}

// Загрузка данных при монтировании
onMounted(async () => {
  await loadPrograms()
  if (role === 'agent') {
    await loadAllClaims()
  }
})
</script>

<template>
  <div v-if="role === 'agent'" class="max-w-6xl mx-auto bg-white shadow rounded-2xl p-6">
    
    <!-- Заголовок и кнопка -->
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h2 class="text-2xl font-bold text-blue-600">
        Управление страховыми заявками
      </h2>
      
      <button
        @click="showCreateClaim = !showCreateClaim"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showCreateClaim ? '📋 Скрыть форму' : '+ ✨ Новая заявка' }}
      </button>
    </div>

    <!-- ПОЛЕ ПОИСКА -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Поиск заявок... (по ID, клиенту, телефону, программе, статусу или имуществу)"
          class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span class="absolute left-3 top-3 text-gray-400 text-lg">🔍</span>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <!-- Статистика поиска -->
      <div v-if="searchQuery" class="mt-2 text-sm text-gray-500">
        Найдено заявок: {{ filteredClaims.length }} из {{ claims.length }}
      </div>
    </div>

    <!-- Форма создания заявки -->
    <div v-if="showCreateClaim" class="mb-8 bg-gray-50 p-4 rounded-lg border">
      <h3 class="text-xl font-bold mb-4">📝 Данные клиента</h3>
      
      <form @submit.prevent="submitClaim" class="space-y-4">
        <!-- ФИО -->
        <div class="grid grid-cols-3 gap-3">
          <input
            v-model="form.lastName"
            placeholder="Фамилия *"
            required
            class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            v-model="form.firstName"
            placeholder="Имя *"
            required
            class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            v-model="form.middleName"
            placeholder="Отчество"
            class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Контакты -->
        <input
          v-model="form.phone"
          placeholder="Телефон *"
          required
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="form.email"
          placeholder="Email *"
          type="email"
          required
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <!-- Аккаунт -->
        <h3 class="text-lg font-semibold pt-2">🔐 Аккаунт клиента</h3>
        <input
          v-model="form.username"
          placeholder="Логин *"
          required
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          v-model="form.password"
          placeholder="Пароль *"
          required
          class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <!-- Параметры страхования -->
        <h3 class="text-lg font-semibold pt-2">🏠 Параметры страхования</h3>
        
        <div>
          <label class="block mb-1 font-semibold">Программа страхования *</label>
          <select
            v-model="form.programId"
            class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Выберите программу</option>
            <option
              v-for="p in programs"
              :key="p._id"
              :value="p._id"
            >
              {{ p.name }} ({{ p.type }}) - {{ p.price.toLocaleString() }} ₽
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1 font-semibold">Срок страхования (дней)</label>
          <input
            v-model.number="form.durationDays"
            type="number"
            min="7"
            class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Дата начала страхования *</label>
          <input
            v-model="form.startDate"
            type="date"
            :min="minStartDate"
            required
            class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {{ loading ? '⏳ Создание...' : '✅ Создать заявку' }}
        </button>
      </form>
    </div>

    <div v-if="claims.length" class="mt-6">
      <h3 class="text-xl font-bold mb-4">
        📋 Все заявки 
        <span class="text-sm font-normal text-gray-500">({{ filteredClaims.length }} / {{ claims.length }})</span>
      </h3>

      <div v-if="filteredClaims.length === 0" class="text-center py-8 text-gray-500">
        🔍 Ничего не найдено по запросу "{{ searchQuery }}"
      </div>

      <div
        v-for="claim in filteredClaims"
        :key="claim._id"
        class="bg-white shadow rounded-xl p-4 mb-4 border hover:shadow-lg transition"
      >
        <div class="flex justify-between items-start flex-wrap gap-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                №{{ claim._id.slice(-6) }}
              </span>
              <span 
                :class="['px-2 py-1 rounded-full text-xs font-semibold', getStatusColor(claim.status)]"
              >
                {{ getStatusText(claim.status) }}
              </span>
            </div>
            
            <p><strong>📦 Программа:</strong> {{ claim.program?.name || '—' }}</p>
            <p><strong>👤 Клиент:</strong> 
              {{ claim.user?.lastName || '—' }} 
              {{ claim.user?.firstName || '—' }}
              <span v-if="claim.user?.phone" class="text-gray-500 text-sm">(тел: {{ claim.user.phone }})</span>
            </p>
            <p><strong>🏠 Имущество:</strong> 
              {{ claim.propertyData?.address || claim.propertyData?.carModel || '—' }}
            </p>
            <p><strong>📅 Дата начала:</strong> {{ formatDate(claim.startDate) }}</p>
            <p><strong>⏱ Срок:</strong> {{ claim.durationDays }} дней</p>
            
            <div v-if="claim.agentNotes" class="mt-2 p-2 bg-gray-50 rounded">
              <strong>📝 Заметки агента:</strong> {{ claim.agentNotes }}
            </div>
          </div>
          
          <!-- Действия -->
          <div class="flex gap-2">
            <button 
              v-if="claim.status === 'pending'"
              @click="changeStatus(claim._id, 'approved')" 
              class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              ✅ Одобрить
            </button>
            <button 
              v-if="claim.status === 'pending'"
              @click="changeStatus(claim._id, 'rejected')" 
              class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
            >
              ❌ Отклонить
            </button>
            <button 
              v-if="claim.status === 'evaluated'"
              @click="changeStatus(claim._id, 'approved')" 
              class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              ✅ Одобрить после оценки
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="text-center py-12 text-gray-500">
      📭 Пока нет ни одной заявки
    </div>
  </div>
</template>