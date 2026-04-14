<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const token = localStorage.getItem('token')

const showCreateForm = ref(false)
const loading = ref(false)

const approvedClaims = ref<any[]>([])
const selectedClaimId = ref('')
const selectedProperties = ref<any[]>([])

const contract = ref({
  claimId: '',
  startDate: '',
  durationDays: 365,
  premiumAmount: 0,
  properties: [] as string[]
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

watch(selectedClaimId, (val) => {
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

  // имущество
  selectedProperties.value = claim.properties || []
  contract.value.properties = selectedProperties.value.map(p => p._id)

  contract.value.premiumAmount = selectedProperties.value.reduce(
      (sum, p) => sum + (p.value || 0),
      0
  )
})

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

  // 🔥 ГРУЗИМ ИМУЩЕСТВО КЛИЕНТА
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
      <h2 class="main-title">Договоры</h2>

      <button
          @click="showCreateForm = !showCreateForm"
          class="btn btn-primary"
          style="width:auto; padding:10px 16px;"
      >
        {{ showCreateForm ? 'Скрыть форму' : '+ Создать договор' }}
      </button>
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
            {{ claim._id.slice(-6) }} —
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

        <div class="form-grid">

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
            <input type="number" v-model.number="contract.premiumAmount" class="form-input text-highlight" />
          </div>

        </div>

        <!-- имущество -->
        <div class="form-group">
          <label class="form-label">Имущество клиента</label>

          <div
              v-for="prop in selectedProperties"
              :key="prop._id"
              class="property-item"
          >
            <input
                type="checkbox"
                :value="prop._id"
                v-model="contract.properties"
            />
            {{ prop.description }} — {{ prop.value.toLocaleString() }} ₽
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


    <div class="section-container">

      <div class="header">
        <h3 class="main-title">Список договоров</h3>
      </div>

      <div v-if="contracts.length === 0" class="empty-text">
        Договоров пока нет
      </div>

      <div class="card-grid">
        <div v-for="c in contracts" :key="c._id" class="card">

          <h4 class="program-name">
            Договор #{{ c._id.slice(-6) }}
          </h4>

          <p class="program-desc">
            Клиент: {{ c.client?.firstName }} {{ c.client?.lastName }}
          </p>

          <div class="program-footer">
            <span>Сумма: <strong>{{ c.premiumAmount }} ₽</strong></span>
            <span>Срок: <strong>{{ c.durationDays }} дн.</strong></span>
          </div>

          <div class="program-footer">
            <span>Дата: {{ new Date(c.startDate).toLocaleDateString() }}</span>
            <span>Статус: {{ c.status }}</span>
          </div>

        </div>
      </div>

    </div>

  </div>
</template>