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
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <h2 class="main-title">Страховые заявки</h2>

      <button
          v-if="['user','agent'].includes(role)"
          @click="showCreateClaim = !showCreateClaim"
          class="btn-primary"
          style="width:auto"
      >
        {{ showCreateClaim ? 'Скрыть' : '+ Новая заявка' }}
      </button>
    </div>

    <!-- ФОРМА -->
    <div v-if="showCreateClaim" class="creation-form-container">
      <span class="form-title">Создание заявки</span>

      <form @submit.prevent="submitClaim">

        <!-- телефон -->
        <div v-if="role === 'agent'" class="form-group">
          <label class="form-label">Телефон клиента</label>
          <input
              v-model="newClaim.phone"
              class="form-input"
          />
          <p v-if="errors.phone" class="text-red-500 text-sm">
            {{ errors.phone }}
          </p>
        </div>

        <!-- программа -->
        <div class="form-group">
          <label class="form-label">Программа</label>

          <select v-model="newClaim.programId" class="form-select">
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
        <div v-if="selectedProgramType === 'home'" class="form-group">
          <label class="form-label">Адрес</label>
          <input v-model="newClaim.propertyData.address" class="form-input" />
        </div>

        <!-- авто -->
        <div v-if="selectedProgramType === 'car'" class="form-group">
          <label class="form-label">Модель авто</label>
          <input v-model="newClaim.propertyData.carModel" class="form-input" />
        </div>

        <!-- срок -->
        <div class="form-group">
          <label class="form-label">Срок (дней)</label>
          <input type="number" v-model.number="newClaim.durationDays" class="form-input"/>
        </div>

        <!-- дата -->
        <div class="form-group">
          <label class="form-label">Дата начала</label>

          <input
              type="date"
              v-model="newClaim.startDate"
              :min="minStartDate"
              class="form-input"
          />

          <p v-if="errors.startDate" class="text-red-500 text-sm">
            {{ errors.startDate }}
          </p>
        </div>

        <button class="btn-primary btn-submit">
          Создать заявку
        </button>

      </form>
    </div>

    <!-- СПИСОК ЗАЯВОК -->
    <div class="card-grid">

      <div v-for="claim in claims" :key="claim._id" class="card">

        <span class="badge-type">
          №{{ claim._id.slice(-6) }}
        </span>

        <div class="program-name">
          {{ claim.programName }}
        </div>

        <div class="program-desc">
          {{ claim.propertyInfo }}
        </div>

        <div class="program-footer">
          <span>Срок: <b class="footer-val">{{ claim.durationDays }}</b></span>
          <span>{{ formatDate(claim.startDate) }}</span>
        </div>

        <div class="program-footer">
          <span class="footer-val">
            {{ getStatusText(claim.status) }}
          </span>
        </div>

        <!-- ДЕЙСТВИЯ -->
        <div class="card-actions">

          <button
              v-if="role === 'user' && claim.status === 'pending'"
              @click="deleteClaim(claim._id)"
              class="btn-edit"
              style="color:red"
          >
            Удалить
          </button>

          <template v-if="role === 'agent'">
            <button @click="changeStatus(claim._id,'approved')" class="btn-edit">
              ✔ Одобрить
            </button>
            <button @click="changeStatus(claim._id,'rejected')" class="btn-edit">
              ✖ Отклонить
            </button>
          </template>

        </div>

      </div>

    </div>

  </div>
</template>