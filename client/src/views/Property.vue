<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { auth } from '../store/auth'
import { showSuccess, showError, showInfo } from '../store/Modal'

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
    const resProp = await axios.get('http://localhost:5000/api/property', {
      headers: { Authorization: `Bearer ${token}` }
    })
    properties.value = resProp.data
    
    const resClaims = await axios.get('http://localhost:5000/api/claims', {
      headers: { Authorization: `Bearer ${token}` }
    })
    claims.value = resClaims.data
  } catch (err) {
    showError('Ошибка загрузки данных')
    console.error('Ошибка загрузки данных', err)
  }
}

const startEvaluation = (claim: any) => {
  selectedClaim.value = claim
  const data = claim.propertyData
  evaluationDescription.value = `Объект: ${data.address || data.carModel || ''}`.trim()
}

const submitEvaluation = async () => {
  if (evaluationValue.value <= 0) {
    showInfo('Введите корректную стоимость')
    return
  }
  
  loading.value = true
  
  try {
    const payload = {
      client: selectedClaim.value.user,
      description: evaluationDescription.value,
      value: evaluationValue.value
    }

    await axios.post('http://localhost:5000/api/property', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    showSuccess('Имущество успешно оценено!')
    selectedClaim.value = null
    evaluationValue.value = 0
    searchQuery.value = ''
    await fetchData()
  } catch (err) {
    showError('Ошибка при сохранении оценки')
    console.error('Ошибка сохранения оценки', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="container">
    
    <!-- HEADER -->
    <div class="header">
      <h2 class="main-title">Оценка имущества</h2>
    </div>

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
    <section v-if="role === 'inspector'">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin: 0;">
          Новые заявки на оценку
        </h3>
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
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">Оценка имущества</h3>
          <button 
            @click="selectedClaim = null" 
            style="background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px;"
            @mouseenter="(e) => e.target.style.background = '#f1f5f9'"
            @mouseleave="(e) => e.target.style.background = 'transparent'"
          >
            ✕
          </button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Описание для протокола</label>
            <textarea v-model="evaluationDescription" class="form-textarea" rows="3" />
          </div>
          
          <div class="form-group">
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
              @click="selectedClaim = null" 
              class="btn-edit" 
              style="flex: 1; padding: 10px;"
            > 
              Отмена 
            </button>
            <button 
              @click="submitEvaluation" 
              :disabled="loading" 
              class="btn-primary" 
              style="flex: 2;"
            >
              {{ loading ? 'Сохранение...' : 'Подтвердить оценку' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- СЕКЦИЯ 2: СПИСОК УЖЕ ОЦЕНЕННОГО -->
    <section style="margin-top: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin: 0;">
          Архив оценок
        </h3>
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

<style scoped>
/* Дополнительные стили для этого компонента */
.program-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2563eb;
}

.badge-type {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
}

.program-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 12px 0 8px 0;
  color: #1e293b;
}

.program-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.program-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  font-size: 0.75rem;
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: #e2e8f0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #101011;
  margin-bottom: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: pop 0.2s ease-out;
}

@keyframes pop {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-card {
    margin: 10px;
    padding: 20px;
  }
}
</style>