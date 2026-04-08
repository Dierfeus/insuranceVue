<template>
  <div class="container">

    <div class="header">
      <h2 class="main-title">Создание договора</h2>
    </div>

    <!-- Выбор заявки -->
    <div class="form-group">
      <label class="form-label">Выберите одобренную заявку</label>
      <select v-model="selectedClaimId" class="form-select">
        <option disabled value="">-- Выберите заявку --</option>
        <option v-for="claim in approvedClaims" :key="claim._id" :value="claim._id">
          {{ claim._id.slice(-6) }} — {{ claim.propertyData.address || claim.propertyData.carModel }}
        </option>
      </select>
    </div>

    <div v-if="selectedClaimId" class="creation-form-container">

      <h3 class="form-title">Параметры договора</h3>

      <form @submit.prevent="submitContract" class="form-body">

        <div class="form-group">
          <label class="form-label">Дата начала</label>
          <input type="date" v-model="contract.startDate" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Срок действия (дней)</label>
          <input type="number" v-model.number="contract.durationDays" min="1" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Премия (₽)</label>
          <input type="number" v-model.number="contract.premiumAmount" class="form-input text-highlight" required />
        </div>

        <div class="form-group">
          <label class="form-label">Имущество</label>
          <div v-for="prop in selectedProperties" :key="prop._id" class="property-item">
            <input type="checkbox" :value="prop._id" v-model="contract.properties" />
            {{ prop.description }} — {{ prop.value.toLocaleString() }} ₽
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary btn-submit">
            {{ loading ? 'Сохранение...' : 'Создать договор' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const token = localStorage.getItem('token')
const loading = ref(false)

// Заявки со статусом approved
const approvedClaims = ref<any[]>([])
const selectedClaimId = ref('')

// Имущество выбранной заявки
const selectedProperties = ref<any[]>([])

// Данные договора
const contract = ref({
  claimId: '',
  startDate: '',
  durationDays: 365,
  premiumAmount: 0,
  properties: [] as string[]
})

// --- Загрузка одобренных заявок ---
const fetchClaims = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/claims', {
      headers: { Authorization: `Bearer ${token}` }
    })
    approvedClaims.value = res.data.filter((c: any) => c.status === 'approved')
  } catch (err) {
    console.error(err)
    alert('Ошибка загрузки заявок')
  }
}

// --- Подставляем данные из заявки ---
watch(selectedClaimId, (val) => {
  if (!val) return
  const claim = approvedClaims.value.find(c => c._id === val)
  if (!claim) return
  contract.value.claimId = val
  contract.value.durationDays = 365
  contract.value.premiumAmount = claim.propertyData.value || 0
  selectedProperties.value = claim.properties || []
  contract.value.properties = selectedProperties.value.map(p => p._id)
})

// --- Создание договора ---
const submitContract = async () => {
  if (!contract.value.claimId) return alert('Выберите заявку')
  loading.value = true
  try {
    await axios.post('http://localhost:5000/api/contracts', contract.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Договор успешно создан!')
    contract.value = { claimId: '', startDate: '', durationDays: 365, premiumAmount: 0, properties: [] }
    selectedClaimId.value = ''
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка при создании договора')
  } finally {
    loading.value = false
  }
}

onMounted(fetchClaims)
</script>
