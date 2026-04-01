<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const properties = ref([])
const claims = ref([]) // Список заявок от клиентов
const loading = ref(false)
const token = localStorage.getItem('token')

// Поля для формы оценки
const selectedClaim = ref<any>(null)
const evaluationValue = ref(0)
const evaluationDescription = ref('')

const fetchData = async () => {
  try {
    const headers = { Authorization: `Bearer ${token}` }
    // Загружаем уже оцененное имущество
    const resProp = await axios.get('http://localhost:5000/api/property',
    { headers:{ Authorization:`Bearer ${token}` }} )
    properties.value = resProp.data

    // Загружаем заявки, которые нужно оценить (статус 'pending' или 'approved')
    // Примечание: эндпоинт /api/claims должен быть настроен на бэкенде
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
  if (evaluationValue.value <= 0) return alert('Введите корректную стоимость')
  
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

    alert('Имущество успешно оценено!')
    selectedClaim.value = null
    fetchData() // Обновляем списки
  } catch (err) {
    alert('Ошибка при сохранении оценки')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 space-y-8">
    
    <!-- СЕКЦИЯ 1: ЗАЯВКИ ОТ КЛИЕНТОВ (Ожидают оценки) -->
    <section>
      <h2 class="text-2xl font-bold text-blue-600 mb-6">Новые заявки на оценку</h2>
      <div v-if="claims.length === 0" class="text-gray-400 italic">Нет новых заявок</div>
      
      <div class="grid gap-4 md:grid-cols-2">
        <div v-for="claim in claims" :key="claim._id" class="border rounded-xl p-4 bg-blue-50/50 border-blue-100 shadow-sm">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-gray-700">Заявка №{{ claim._id.slice(-6) }}</p>
              <div class="mt-2 p-2 bg-white rounded border text-sm">
                <strong>Имущество:</strong> 
                {{ claim.propertyData.address || claim.propertyData.carModel }}
              </div>
            </div>
            <button @click="startEvaluation(claim)" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
              Оценить
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- МОДАЛЬНОЕ ОКНО / ФОРМА ОЦЕНКИ -->
    <div v-if="selectedClaim" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-bold mb-4">Оценка имущества</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Описание для протокола</label>
            <textarea v-model="evaluationDescription" class="w-full border rounded-lg p-2 h-24" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Оценочная стоимость (₽)</label>
            <input v-model.number="evaluationValue" type="number" class="w-full border rounded-lg p-2 text-lg font-bold text-blue-600" />
          </div>

          <div class="flex gap-2 pt-2">
            <button @click="submitEvaluation" :disabled="loading" class="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400">
              {{ loading ? 'Сохранение...' : 'Подтвердить оценку' }}
            </button>
            <button @click="selectedClaim = null" class="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"> Отмена </button>
          </div>
        </div>
      </div>
    </div>

    <!-- СЕКЦИЯ 2: СПИСОК УЖЕ ОЦЕНЕННОГО -->
    <section>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Архив оценок</h2>
      <div class="grid gap-4">
        <div v-for="item in properties" :key="item._id" class="bg-white shadow-sm border border-gray-100 p-6 rounded-xl flex justify-between items-center">
          <div>

            <p class="font-medium">{{ item.description }}</p>
          </div>
          <div class="text-right">
            
            <p class="text-xl font-bold text-blue-600">{{ item.value.toLocaleString() }} ₽</p>
            <p class="text-xs text-gray-400 italic">Оценка зафиксирована</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
