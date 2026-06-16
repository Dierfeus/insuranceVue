<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { auth } from '../store/auth'
import { showSuccess } from '../store/Modal'

const properties = ref([])
const claims = ref([])
const loading = ref(false)
const token = localStorage.getItem('token')
const role = auth.role
const searchQuery = ref('')

// Поля для формы оценки
const selectedClaim = ref<any>(null)
const evaluationValue = ref(0)
const evaluationDescription = ref('')

// --- ПОИСК ДЛЯ ЗАЯВОК НА ОЦЕНКУ ---
const filteredClaims = computed(() => {
  if (!searchQuery.value) return claims.value
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return claims.value.filter((claim: any) => {
    const idMatch = claim._id.slice(-6).toLowerCase().includes(query)
    const propertyMatch = (claim.propertyData?.address || claim.propertyData?.carModel || '')
      .toLowerCase()
      .includes(query)
    const clientMatch = claim.user?.lastName?.toLowerCase().includes(query) || 
                       claim.user?.firstName?.toLowerCase().includes(query) || false
    const statusMatch = claim.status?.toLowerCase().includes(query) || false
    
    return idMatch || propertyMatch || clientMatch || statusMatch
  })
})

// --- ПОИСК ДЛЯ АРХИВА ОЦЕНОК ---
const filteredProperties = computed(() => {
  if (!searchQuery.value) return properties.value
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return properties.value.filter((item: any) => {
    const descMatch = item.description?.toLowerCase().includes(query)
    const valueMatch = item.value?.toString().includes(query)
    const clientMatch = item.client?.lastName?.toLowerCase().includes(query) || 
                       item.client?.firstName?.toLowerCase().includes(query) || false
    
    return descMatch || valueMatch || clientMatch
  })
})

const fetchData = async () => {
  try {
    const headers = { Authorization: `Bearer ${token}` }
    const resProp = await axios.get('http://localhost:5000/api/property',
    { headers:{ Authorization:`Bearer ${token}` }} )
    properties.value = resProp.data
    const resClaims = await axios.get('http://localhost:5000/api/claims',
      { headers:{ Authorization:`Bearer ${token}` }} )
    claims.value = resClaims.data
  } catch (err) {
    console.error('Ошибка загрузки данных', err)
  }
}

const startEvaluation = (claim: any) => {
  selectedClaim.value = claim
  // Предзаполняем описание данными из заявки (адрес или модель авто)
  const data = claim.propertyData
  evaluationDescription.value = `Объект по адресу: ${data.address || ''} ${data.carModel || ''}`.trim()
}

const submitEvaluation = async () => {
  if (evaluationValue.value <= 0) return showSuccess('Введите корректную стоимость')
  
  loading.value = true
  try {
    const payload = {
      client: selectedClaim.value.user, // ID клиента из заявки
      description: evaluationDescription.value,
      value: evaluationValue.value
    }

    await axios.post('http://localhost:5000/api/property', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    showSuccess('Имущество успешно оценено!')
    selectedClaim.value = null
    searchQuery.value = ''
    fetchData() // Обновляем списки
  } catch (err) {
    showSuccess('Ошибка при сохранении оценки')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="container">
    
    <!-- ПОИСК -->
    <div style="margin-bottom: 24px;">
      <div style="position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по заявкам или архиву оценок..."
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
        Найдено заявок: {{ filteredClaims.length }} из {{ claims.length }} | 
        Оценок: {{ filteredProperties.length }} из {{ properties.length }}
      </div>
    </div>

    <!-- заявки на оценку -->
    <section v-if="role==='inspector'">
      <div class="header">
        <h2 class="main-title">Новые заявки на оценку</h2>
     </div>
      
      <div v-if="filteredClaims.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
        По запросу ничего не найдено
      </div>
      
      <div v-else-if="claims.length === 0" style="text-align: center; padding: 40px; color: #94a3b8;">
        Нет новых заявок
      </div>
      
      <div class="card-grid">
        <div v-for="claim in filteredClaims" :key="claim._id" class="card">

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="badge-type">№{{ claim._id.slice(-6) }}</span>
              <span style="font-size: 10px; color: #64748b;">
                {{ claim.status === 'pending' ? 'Ожидает оценки' : claim.status }}
              </span>
            </div>
            
            <div class="program-name">
                {{ claim.propertyData.address || claim.propertyData.carModel || 'Имущество' }}
            </div>
            
            <div class="program-desc">
              <strong>Клиент:</strong> {{ claim.user?.lastName || '' }} {{ claim.user?.firstName || '' }}
            </div>
            
            <div class="program-footer">
              <span>Программа: {{ claim.program?.name || '-' }}</span>
            </div>
            
            <button @click="startEvaluation(claim)" class="btn-primary" style="width:100%; margin-top:12px;">
              Оценить
            </button>

        </div>
      </div>
    </section>

    <!-- МОДАЛЬНОЕ ОКНО / ФОРМА ОЦЕНКИ -->
    <div v-if="selectedClaim" class="modal-overlay" @click.self="selectedClaim = null">
      <div class="modal-card" style="max-width: 500px;">
        <h3 class="modal-title" style="color: #1e293b;">Оценка имущества</h3>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label class="form-label">Описание для протокола</label>
            <textarea v-model="evaluationDescription" class="form-textarea" rows="3" />
          </div>
          
          <div>
            <label class="form-label">Оценочная стоимость (₽)</label>
            <input 
              v-model.number="evaluationValue" 
              type="number" 
              class="form-input" 
              style="font-size: 1.1rem; font-weight: 600; color: #2563eb;"
              placeholder="Введите стоимость"
            />
          </div>

          <div style="display: flex; gap: 12px; padding-top: 8px;">
            <button 
              @click="submitEvaluation" 
              :disabled="loading" 
              class="btn-primary" 
              style="flex: 2;"
            >
              {{ loading ? 'Сохранение...' : 'Подтвердить оценку' }}
            </button>
            <button 
              @click="selectedClaim = null" 
              class="btn-edit" 
              style="flex: 1;"
            > 
              Отмена 
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- СЕКЦИЯ 2: СПИСОК УЖЕ ОЦЕНЕННОГО -->
    <section style="margin-top: 32px;">
      <div class="header">
        <h2 class="main-title">Архив оценок</h2>
     </div>

      <div v-if="filteredProperties.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
        По запросу ничего не найдено
      </div>

      <div v-else-if="properties.length === 0" style="text-align: center; padding: 40px; color: #94a3b8;">
        Нет оценённого имущества
      </div>

      <div class="card-grid">
        <div v-for="item in filteredProperties" :key="item._id" class="card">
          
          <div class="program-name" style="font-size: 0.95rem; margin-bottom: 4px;">
            {{ item.description }}
          </div>
          
          <div class="program-desc" style="margin-bottom: 8px;">
            <strong>Клиент:</strong> {{ item.client?.lastName || '' }} {{ item.client?.firstName || '' }}
          </div>
          
          <div class="program-footer">
            <span class="program-price" style="font-size: 1.25rem;">
              {{ item.value.toLocaleString() }} ₽
            </span>
            <span style="font-size: 0.7rem; color: #94a3b8;">
              {{ new Date(item.createdAt).toLocaleDateString() }}
            </span>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>