<template>
  <div class="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6">

    <!-- Верхняя панель -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blue-600">
        Мои страховые заявки
      </h2>

      <button
          @click="showCreateClaim = !showCreateClaim"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showCreateClaim ? 'Скрыть форму' : '+ Новая заявка' }}
      </button>
    </div>

    <!-- Форма создания заявки -->
    <div v-if="showCreateClaim" class="mb-6 bg-gray-50 p-4 rounded-lg border">
      <h3 class="text-xl font-bold mb-4">Создание новой заявки</h3>
      <form @submit.prevent="submitClaim" class="space-y-4">

        <div>
          <label class="block mb-1 font-semibold">Программа страхования</label>
          <select
              v-model="newClaim.programId"
              class="w-full border rounded-lg p-2"
              required
          >
            <option value="">Выберите программу</option>
            <option v-for="p in programs" :key="p._id" :value="p._id">
              {{ p.name }} ({{ p.type }})
            </option>
          </select>
        </div>

        <div v-if="selectedProgramType==='house' || selectedProgramType==='car'">
          <label class="block mb-1 font-semibold">
            {{ selectedProgramType==='house' ? 'Адрес' : 'Модель автомобиля' }}
          </label>
          <input
              v-model="newClaim.propertyInfo"
              type="text"
              class="w-full border rounded-lg p-2"
              required
          />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Желаемый срок страхования (дней)</label>
          <input
              v-model.number="newClaim.durationDays"
              type="number"
              min="7"
              class="w-full border rounded-lg p-2"
              required
          />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Дата начала страхования</label>
          <input
              v-model="newClaim.startDate"
              type="date"
              :min="minStartDate"
              class="w-full border rounded-lg p-2"
              required
          />
        </div>

        <button
            type="submit"
            class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Создать заявку
        </button>
      </form>
    </div>

    <!-- Список заявок -->
    <div v-if="claims.length === 0" class="text-gray-500">
      У вас пока нет заявок.
    </div>

    <div
        v-for="claim in claims"
        :key="claim._id"
        class="bg-white shadow rounded-xl p-4 mb-4 border"
    >
      <div class="flex justify-between">
        <div>
          <p><strong>Программа:</strong> {{ claim.programName }}</p>
          <p><strong>Адрес/Модель:</strong> {{ claim.propertyInfo || '-' }}</p>
          <p><strong>Срок (дней):</strong> {{ claim.durationDays }}</p>
          <p><strong>Дата начала:</strong> {{ formatDate(claim.startDate) }}</p>
        </div>

        <div class="text-right">
          <p
              :class="{
              'text-yellow-600': claim.status === 'pending',
              'text-green-600': claim.status === 'approved',
              'text-red-600': claim.status === 'rejected'
            }"
              class="font-semibold"
          >
            {{ claim.status }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const claims = ref<any[]>([])
const programs = ref<any[]>([])
const showCreateClaim = ref(false)
const userId = ref<string|null>(null)

const today = new Date()
const minStartDate = today.toISOString().split('T')[0]

const newClaim = reactive({
  programId: '',
  propertyInfo: '',
  durationDays: 7,
  startDate: ''
})

const token = localStorage.getItem('token')

// Загрузка моих заявок
const loadClaims = async () => {
  try {
    if (!token) return
    const res = await axios.get('http://localhost:5000/api/claims/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    claims.value = res.data.map(c => ({
      ...c,
      programName: c.program?.name || '-',
      propertyInfo: c.propertyInfo || ''
    }))
  } catch (err) {
    console.error('Ошибка загрузки заявок', err)
  }
}

// Загрузка программ
const loadPrograms = async () => {
  try {
    if (!token) return
    const res = await axios.get('http://localhost:5000/api/programs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    programs.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки программ', err)
  }
}

// Тип выбранной программы
const selectedProgramType = computed(() => {
  const program = programs.value.find(p => p._id === newClaim.programId)
  return program ? program.type : ''
})

// Создание новой заявки
const submitClaim = async () => {
  try {
    if (!token) return
    await axios.post(
        'http://localhost:5000/api/claims',
        {
          user: userID,
          programId: newClaim.programId,
          propertyInfo: newClaim.propertyInfo,
          durationDays: newClaim.durationDays,
          startDate: newClaim.startDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    // Очистка формы
    Object.assign(newClaim, {
      programId: '',
      propertyInfo: '',
      durationDays: 7,
      startDate: ''
    })
    showCreateClaim.value = false
    await loadClaims()
  } catch (err) {
    console.error(err)
    alert('Ошибка создания заявки')
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString()

onMounted(async () => {
  await loadPrograms()
  await loadClaims()
  userId.value = localStorage.getItem('userId')
})
</script>