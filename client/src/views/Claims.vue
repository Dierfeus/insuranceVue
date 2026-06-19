<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import {auth} from "../store/auth"
import { StatusEnum } from '../type/StatusEnum'
import { showSuccess, showError, showInfo, showConfirm } from '../store/Modal'

const role = computed(() => auth.role)

const claims = ref<any[]>([])
const programs = ref<any[]>([])
const showCreateClaim = ref(false)
const searchQuery = ref('')

const token = localStorage.getItem('token')

const errors = reactive({
  phone: '',
  program: '',
  startDate: ""
})

const today = new Date()
const minStartDate = today.toISOString().split('T')[0]

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

const selectedProgramType = computed(() => {
  const program = programs.value.find(
      p => String(p._id) === String(newClaim.programId)
  )
  return program?.type || ''
})

const getStatusText = (status: keyof typeof StatusEnum) => {
  return StatusEnum[status] || status
}

const filteredClaims = computed(() => {
  if (!searchQuery.value) return claims.value
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return claims.value.filter(claim => {
    const idMatch = claim._id.slice(-6).toLowerCase().includes(query)
    const programMatch = claim.programName.toLowerCase().includes(query)
    const clientMatch = claim.userName.toLowerCase().includes(query)
    const creatorMatch = claim.creatorName?.toLowerCase().includes(query) || false
    const propertyMatch = claim.propertyInfo.toLowerCase().includes(query)
    const statusMatch = getStatusText(claim.status).toLowerCase().includes(query)
    
    return idMatch || programMatch || clientMatch || propertyMatch || statusMatch || creatorMatch
  })
})

const canApprove = (status: string) => {
  return status === 'pending' || status === 'evaluated'
}

const canReject = (status: string) => {
  return status === 'pending'
}

const loadPrograms = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/programs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    programs.value = res.data
  } catch (err) {
    showError('Ошибка загрузки программ')
  }
}

const loadClaims = async () => {
  try {
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
      creatorName: c.createdBy
          ? `${c.createdBy.lastName || ''} ${c.createdBy.firstName || ''}`
          : (role.value === 'agent' ? 'Агент' : 'Пользователь'),
      creatorRole: c.createdBy?.role || c.creatorRole || (role.value === 'agent' ? 'agent' : 'user'),
      propertyInfo:
          c.propertyData?.address ||
          c.propertyData?.carModel ||
          '-'
    }))
  } catch (err) {
    showError('Ошибка загрузки заявок')
  }
}

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
    
    showSuccess('Заявка успешно создана')

  } catch (err: any) {
    if (err.response?.status === 404) {
      errors.phone = 'Клиент не найден'
      return
    }
    showError('Ошибка создания заявки')
  }
}

watch(() => newClaim.phone, () => errors.phone = '')
watch(() => newClaim.programId, () => errors.program = '')
watch(() => newClaim.startDate, () => errors.startDate = '')

const deleteClaim = (id: string) => {
  showConfirm({
    title: 'Удаление заявки',
    message: 'Вы действительно хотите удалить эту заявку? Это действие нельзя отменить.',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await axios.delete(`http://localhost:5000/api/claims/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await loadClaims()
        showSuccess('Заявка успешно удалена')
      } catch (err) {
        showError('Ошибка удаления заявки')
      }
    }
  })
}

const changeStatus = (id: string, status: string) => {
  const statusText = status === 'approved' ? 'одобрить' : 'отклонить'
  
  showConfirm({
    title: 'Изменение статуса',
    message: `Вы уверены, что хотите ${statusText} эту заявку?`,
    confirmText: status === 'approved' ? 'Одобрить' : 'Отклонить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await axios.put(
            `http://localhost:5000/api/claims/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        await loadClaims()
        showSuccess(`Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`)
      } catch (err) {
        showError('Ошибка изменения статуса')
      }
    }
  })
}

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

const getCreatorLabel = (role: string) => {
  if (role === 'agent') return 'Создал: Агент'
  return 'Создал: Пользователь'
}

onMounted(async () => {
  await loadPrograms()
  await loadClaims()
})
</script>

<template>
  <div class="container">

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

    <div style="margin-bottom: 24px;">
      <div style="position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск заявок..."
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
        Найдено: {{ filteredClaims.length }} из {{ claims.length }} заявок
      </div>
    </div>

    <div v-if="showCreateClaim" class="creation-form-container">
      <span class="form-title">Создание заявки</span>

      <form @submit.prevent="submitClaim">

        <div v-if="role === 'agent'" class="form-group">
          <label class="form-label">Телефон клиента</label>
          <input
              v-model="newClaim.phone"
              class="form-input"
          />
          <p v-if="errors.phone" style="color: #dc2626; font-size: 0.75rem; margin-top: 4px;">
            {{ errors.phone }}
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Программа</label>

          <select v-model="newClaim.programId" class="form-select">
            <option value="">Выберите программу</option>
            <option v-for="p in programs" :key="p._id" :value="p._id">
              {{ p.name }}
            </option>
          </select>

          <p v-if="errors.program" style="color: #dc2626; font-size: 0.75rem; margin-top: 4px;">
            {{ errors.program }}
          </p>
        </div>

        <div v-if="selectedProgramType === 'home'" class="form-group">
          <label class="form-label">Адрес</label>
          <input v-model="newClaim.propertyData.address" class="form-input" />
        </div>

        <div v-if="selectedProgramType === 'car'" class="form-group">
          <label class="form-label">Модель авто</label>
          <input v-model="newClaim.propertyData.carModel" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Срок (дней)</label>
          <input type="number" v-model.number="newClaim.durationDays" class="form-input"/>
        </div>

        <div class="form-group">
          <label class="form-label">Дата начала</label>

          <input
              type="date"
              v-model="newClaim.startDate"
              :min="minStartDate"
              class="form-input"
          />

          <p v-if="errors.startDate" style="color: #dc2626; font-size: 0.75rem; margin-top: 4px;">
            {{ errors.startDate }}
          </p>
        </div>

        <button class="btn-primary btn-submit">
          Создать заявку
        </button>

      </form>
    </div>

    <div v-if="filteredClaims.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
      По запросу ничего не найдено
    </div>

    <div class="card-grid">

      <div v-for="claim in filteredClaims" :key="claim._id" class="card">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge-type">
            №{{ claim._id.slice(-6) }}
          </span>
          <span style="font-size: 10px; color: #64748b;">
            {{ getCreatorLabel(claim.creatorRole) }}
          </span>
        </div>

        <div class="program-name">
          {{ claim.programName }}
        </div>

        <div class="program-desc">
          <strong>Клиент:</strong> {{ claim.userName }}
        </div>

        <div class="program-desc">
          <strong>Имущество:</strong> {{ claim.propertyInfo }}
        </div>

        <div class="program-footer">
          <span>Срок: <b class="footer-val">{{ claim.durationDays }}</b> дн.</span>
          <span>{{ formatDate(claim.startDate) }}</span>
        </div>

        <div class="program-footer">
          <span class="footer-val">
            {{ getStatusText(claim.status) }}
          </span>
        </div>

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
            <button 
              v-if="canApprove(claim.status)"
              @click="changeStatus(claim._id, 'approved')" 
              class="btn-edit"
              style="background: #d1fae5; color: #059669;"
            >
              Одобрить
            </button>
            <button 
              v-if="canReject(claim.status)"
              @click="changeStatus(claim._id, 'rejected')" 
              class="btn-edit"
              style="background: #fee2e2; color: #dc2626;"
            >
              Отклонить
            </button>
          </template>

        </div>

      </div>

    </div>

  </div>
</template>