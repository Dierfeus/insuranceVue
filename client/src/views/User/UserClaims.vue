<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { auth } from '../../store/auth'
import { StatusEnum } from '../../type/StatusEnum'

const role = computed(() => auth.role)

const claims = ref<any[]>([])
const programs = ref<any[]>([])
const showCreateClaim = ref(false)

const token = localStorage.getItem('token')

// --- ошибки ---
const errors = reactive({
  phone: '',
  program: '',
  startDate: ""
})

const today = new Date()
const minStartDate = today.toISOString().split('T')[0]

// --- форма ---
const newClaim = reactive({
  userId: '',
  phone: '',
  programId: '',
  propertyData: {
    address: '',
    carModel: ''
  },
  durationDays: 7,
  startDate: ''
})

// --- тип программы ---
const selectedProgramType = computed(() => {
  const program = programs.value.find(
      p => String(p._id) === String(newClaim.programId)
  )
  return program?.type || ''
})

// --- статус ---
const getStatusText = (status: keyof typeof StatusEnum) => {
  return StatusEnum[status] || status
}

// --- загрузка ---
const loadPrograms = async () => {
  const res = await axios.get('http://localhost:5000/api/programs', {
    headers: { Authorization: `Bearer ${token}` }
  })
  programs.value = res.data
}

const loadClaims = async () => {
  const url =
      role.value === 'user'
          ? 'http://localhost:5000/api/claims/my'
          : 'http://localhost:5000/api/claims'

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  })

  claims.value = res.data.map((c: any) => ({
    ...c,
    programName: c.program?.name || '-',
    userName: c.user
        ? `${c.user.lastName || ''} ${c.user.firstName || ''}`
        : '-',
    propertyInfo:
        c.propertyData?.address ||
        c.propertyData?.carModel ||
        '-'
  }))
}

// --- ВАЛИДАЦИЯ ---
const validate = () => {
  errors.phone = ''
  errors.program = ''
  errors.startDate = ''

  let isValid = true

  if (role.value === 'agent' && !newClaim.phone && !newClaim.userId) {
    errors.phone = 'Введите телефон клиента'
    isValid = false
  }

  if (!newClaim.programId) {
    errors.program = 'Выберите программу'
    isValid = false
  }

  if (!newClaim.startDate) {
    errors.startDate = 'Выберите дату'
    isValid = false
  }

  return isValid
}

// --- создание ---
const submitClaim = async () => {
  if (!validate()) return

  try {
    await axios.post(
        'http://localhost:5000/api/claims',
        {
          phone: role.value === 'agent' ? newClaim.phone : undefined,
          userId: role.value === 'agent' ? newClaim.userId : undefined,
          program: newClaim.programId,
          propertyData: newClaim.propertyData,
          durationDays: newClaim.durationDays,
          startDate: newClaim.startDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
    )

    // reset
    Object.assign(newClaim, {
      userId: '',
      phone: '',
      programId: '',
      propertyData: { address: '', carModel: '' },
      durationDays: 7,
      startDate: ''
    })

    showCreateClaim.value = false
    await loadClaims()

  } catch (err: any) {

    if (err.response?.status === 404) {
      errors.phone = 'Клиент не найден'
      return
    }

    alert('Ошибка создания заявки')
  }
}

// --- очистка ошибок при вводе ---
watch(() => newClaim.phone, () => errors.phone = '')
watch(() => newClaim.programId, () => errors.program = '')
watch(() => newClaim.startDate, () => errors.startDate = '')

// --- действия ---
const deleteClaim = async (id: string) => {
  if (!confirm('Удалить заявку?')) return

  await axios.delete(`http://localhost:5000/api/claims/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  await loadClaims()
}

const changeStatus = async (id: string, status: string) => {
  await axios.put(
      `http://localhost:5000/api/claims/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
  )

  await loadClaims()
}

const formatDate = (d: string) => new Date(d).toLocaleDateString()

onMounted(async () => {
  await loadPrograms()
  await loadClaims()
})
</script>

<template>
  <div class="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6">

    <!-- Заголовок -->
    <div class="flex justify-between mb-6">
      <h2 class="text-2xl font-bold text-blue-600">
        Страховые заявки
      </h2>

      <button
          v-if="['user','agent'].includes(role)"
          @click="showCreateClaim = !showCreateClaim"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        {{ showCreateClaim ? 'Скрыть' : '+ Новая заявка' }}
      </button>
    </div>

    <!-- Форма -->
    <div v-if="showCreateClaim" class="bg-gray-50 p-4 rounded-lg mb-6">

      <form @submit.prevent="submitClaim" class="space-y-4">

        <!-- телефон -->
        <div v-if="role === 'agent'">
          <label class="font-semibold">Номер телефона клиента</label>

          <input
              v-model="newClaim.phone"
              class="w-full border p-2 rounded-lg"
              :class="{ 'border-red-500': errors.phone }"
          />

          <p v-if="errors.phone" class="text-red-500 text-sm">
            {{ errors.phone }}
          </p>
        </div>

        <!-- программа -->
        <div>
          <label class="font-semibold">Программа</label>

          <select
              v-model="newClaim.programId"
              class="w-full border p-2 rounded-lg"
              :class="{ 'border-red-500': errors.program }"
          >
            <option value="">Выберите программу</option>
            <option v-for="p in programs" :key="p._id" :value="p._id">
              {{ p.name }}
            </option>
          </select>

          <p v-if="errors.program" class="text-red-500 text-sm">
            {{ errors.program }}
          </p>
        </div>

        <!-- дом -->
        <div v-if="selectedProgramType === 'home'">
          <label class="font-semibold">Адрес</label>
          <input v-model="newClaim.propertyData.address" class="w-full border p-2 rounded-lg"/>
        </div>

        <!-- авто -->
        <div v-if="selectedProgramType === 'car'">
          <label class="font-semibold">Модель авто</label>
          <input v-model="newClaim.propertyData.carModel" class="w-full border p-2 rounded-lg"/>
        </div>

        <!-- срок -->
        <div>
          <label class="font-semibold">Срок (дней)</label>
          <input type="number" v-model.number="newClaim.durationDays" class="w-full border p-2 rounded-lg"/>
        </div>

        <!-- дата -->
        <div>
          <label class="font-semibold">Дата начала</label>

          <input
              type="date"
              v-model="newClaim.startDate"
              :min="minStartDate"
              class="w-full border p-2 rounded-lg"
              :class="{ 'border-red-500': errors.startDate }"
          />

          <p v-if="errors.startDate" class="text-red-500 text-sm">
            {{ errors.startDate }}
          </p>
        </div>

        <button class="w-full bg-green-600 text-white py-2 rounded-lg">
          Создать
        </button>

      </form>
    </div>

    <!-- список -->
    <div v-for="claim in claims" :key="claim._id" class="border p-4 mb-4 rounded-lg">

      <p><b>Программа:</b> {{ claim.programName }}</p>

      <p v-if="role !== 'user'">
        <b>Клиент:</b> {{ claim.userName }}
      </p>

      <p><b>Объект:</b> {{ claim.propertyInfo }}</p>
      <p><b>Срок:</b> {{ claim.durationDays }}</p>
      <p><b>Дата:</b> {{ formatDate(claim.startDate) }}</p>

      <div class="flex justify-between mt-2">
        <span>{{ getStatusText(claim.status) }}</span>

        <button
            v-if="role === 'user' && claim.status === 'pending'"
            @click="deleteClaim(claim._id)"
            class="text-red-500"
        >
          Удалить
        </button>

        <div v-if="role === 'agent'">
          <button @click="changeStatus(claim._id,'approved')">✔</button>
          <button @click="changeStatus(claim._id,'rejected')">✖</button>
        </div>
      </div>

    </div>

  </div>
</template>