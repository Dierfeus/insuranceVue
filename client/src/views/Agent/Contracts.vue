<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'

const token = localStorage.getItem('token')

const showCreateForm = ref(false)
const loading = ref(false)

const approvedClaims = ref<any[]>([])
const selectedClaimId = ref('')
const selectedProperties = ref<any[]>([])
const searchQuery = ref('')

const contract = ref({
  claimId: '',
  startDate: '',
  durationDays: 365,
  premiumAmount: 0,
  properties: [] as string[]
})

// --- ПОИСК ДОГОВОРОВ ---
const filteredContracts = computed(() => {
  if (!searchQuery.value) return contracts.value
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return contracts.value.filter(c => {
    const idMatch = c._id.slice(-6).toLowerCase().includes(query)
    const clientMatch = `${c.client?.firstName || ''} ${c.client?.lastName || ''}`.toLowerCase().includes(query)
    const amountMatch = c.premiumAmount.toString().includes(query)
    const statusMatch = c.status?.toLowerCase().includes(query)
    const dateMatch = new Date(c.startDate).toLocaleDateString().includes(query)
    
    return idMatch || clientMatch || amountMatch || statusMatch || dateMatch
  })
})

// --- загрузка заявок ---
const fetchClaims = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/claims', {
      headers: { Authorization: `Bearer ${token}` }
    })

    approvedClaims.value = res.data.filter((c: any) => c.status === 'approved')
  } catch {
    alert('Ошибка загрузки заявок')
  }
}

watch(selectedClaimId, async (val) => {
  if (!val) return

  const claim = approvedClaims.value.find(c => c._id === val)
  if (!claim) return

  contract.value = {
    claimId: val,
    startDate: claim.startDate ? claim.startDate.split('T')[0] : '',
    durationDays: claim.durationDays || 365,
    premiumAmount: 0,
    properties: []
  }

  // ГРУЗИМ ИМУЩЕСТВО КЛИЕНТА
  await fetchPropertiesByClient(claim.user?._id)
})

// --- создание договора ---
const submitContract = async () => {
  if (!contract.value.claimId) {
    return alert('Выберите заявку')
  }

  loading.value = true

  try {
    await axios.post(
        'http://localhost:5000/api/contracts',
        contract.value,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    alert('Договор создан')
    await fetchContracts()

    // сброс
    contract.value = {
      claimId: '',
      startDate: '',
      durationDays: 365,
      premiumAmount: 0,
      properties: []
    }

    selectedClaimId.value = ''
    showCreateForm.value = false

  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка создания договора')
  } finally {
    loading.value = false
  }
}

const fetchPropertiesByClient = async (clientId: string) => {
  try {
    const res = await axios.get(
        `http://localhost:5000/api/property?client=${clientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    selectedProperties.value = res.data
    contract.value.properties = res.data.map((p: any) => p._id)

    // считаем премию
    contract.value.premiumAmount = res.data.reduce(
        (sum: number, p: any) => sum + (p.value || 0),
        0
    )

  } catch {
    alert('Ошибка загрузки имущества')
  }
}

const contracts = ref<any[]>([])

const fetchContracts = async () => {
  try {
    const res = await axios.get(
        'http://localhost:5000/api/contracts',
        { headers: { Authorization: `Bearer ${token}` } }
    )

    contracts.value = res.data
  } catch {
    alert('Ошибка загрузки договоров')
  }
}

onMounted(() => {
  fetchClaims()
  fetchContracts()
})

</script>

<template>
  <div class="container">

    <!-- HEADER -->
    <div class="header">
      <h2 class="main-title">Список договоров</h2>

      <button
          @click="showCreateForm = !showCreateForm"
          class="btn-primary"
          style="width:auto; padding:10px 16px;"
      >
        {{ showCreateForm ? 'Скрыть форму' : '+ Создать договор' }}
      </button>
    </div>

    <!-- ПОИСК -->
    <div style="margin-bottom: 24px;">
      <div style="position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск договоров..."
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
        Найдено: {{ filteredContracts.length }} из {{ contracts.length }} договоров
      </div>
    </div>

    <!-- ФОРМА -->
    <div v-if="showCreateForm" class="creation-form-container">

      <h3 class="form-title">Создание договора</h3>

      <!-- выбор заявки -->
      <div class="form-group">
        <label class="form-label">Одобренная заявка</label>
        <select v-model="selectedClaimId" class="form-select">
          <option disabled value="">-- Выберите заявку --</option>

          <option
              v-for="claim in approvedClaims"
              :key="claim._id"
              :value="claim._id"
          >
            №{{ claim._id.slice(-6) }} —
            {{ claim.propertyData?.address || claim.propertyData?.carModel || 'Имущество' }}
          </option>
        </select>
      </div>

      <!-- если выбрана -->
      <form
          v-if="selectedClaimId"
          @submit.prevent="submitContract"
          class="form-body"
      >

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">

          <div class="form-group">
            <label class="form-label">Дата начала</label>
            <input type="date" v-model="contract.startDate" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Срок (дней)</label>
            <input type="number" v-model.number="contract.durationDays" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Премия (₽)</label>
            <input type="number" v-model.number="contract.premiumAmount" class="form-input" style="font-weight: 600; color: #2563eb;" />
          </div>

        </div>

        <!-- имущество -->
        <div class="form-group">
          <label class="form-label">Имущество клиента</label>

          <div
              v-for="prop in selectedProperties"
              :key="prop._id"
              style="display: flex; align-items: center; gap: 8px; padding: 4px 0;"
          >
            <input
                type="checkbox"
                :value="prop._id"
                v-model="contract.properties"
                style="width: 16px; height: 16px; cursor: pointer;"
            />
            <label style="cursor: pointer;">
              {{ prop.description }} — {{ prop.value.toLocaleString() }} ₽
            </label>
          </div>
          
          <div v-if="selectedProperties.length === 0" style="color: #94a3b8; font-size: 0.85rem; padding: 8px 0;">
            У клиента пока нет оцененного имущества
          </div>
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="btn-primary btn-submit"
        >
          {{ loading ? 'Создание...' : 'Создать договор' }}
        </button>

      </form>
    </div>

    <!-- СПИСОК ДОГОВОРОВ -->
    <div style="margin-top: 24px;">

      <div v-if="filteredContracts.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
        По запросу ничего не найдено
      </div>

      <div v-else-if="contracts.length === 0" style="text-align: center; padding: 40px; color: #94a3b8;">
        Договоров пока нет
      </div>

      <div class="card-grid">
        <div v-for="c in filteredContracts" :key="c._id" class="card">

          <h4 class="program-name" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Договор #{{ c._id.slice(-6) }}</span>
            <span style="font-size: 0.6rem; font-weight: 400; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #64748b;">
              {{ c.status }}
            </span>
          </h4>

          <p class="program-desc">
            <strong>Клиент:</strong> {{ c.client?.firstName }} {{ c.client?.lastName }}
          </p>
          
          <p class="program-desc" style="margin-bottom: 4px;">
            <strong>Телефон:</strong> {{ c.client?.phone || '—' }}
          </p>

          <div class="program-footer">
            <span>Сумма: <strong style="color: #2563eb;">{{ c.premiumAmount.toLocaleString() }} ₽</strong></span>
            <span>Срок: <strong>{{ c.durationDays }} дн.</strong></span>
          </div>

          <div class="program-footer">
            <span>{{ new Date(c.startDate).toLocaleDateString() }}</span>
            <span style="font-weight: 600; color: #475569;">
              {{ c.status === 'active' ? 'Активен' : c.status === 'closed' ? 'Закрыт' : 'Отменён' }}
            </span>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>