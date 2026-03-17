
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const programs = ref<any[]>([])
const showCreateProgram = ref(false)
const token = localStorage.getItem('token')
const role = ref<string|null>(null)

const newProgram = ref({
  name: '',
  description: '',
  type: '',
  coverage: '',
  price: 0,
  durationDays: 1,
})

// Загрузка программ
const loadPrograms = async () => {
  try {
    const res = await axios.get(
        'http://localhost:5000/api/programs',
        { headers:{ Authorization:`Bearer ${token}` }}
    )
    programs.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки программ')
  }
}

// Создание новой программы
const submitProgram = async () => {
  if (!token) return
  try {
    await axios.post('http://localhost:5000/api/programs', newProgram.value, { headers: { Authorization: `Bearer ${token}` } })
    showCreateProgram.value = false
    newProgram.value = {
      name: '',
      description: '',
      type: '',
      coverage: '',
      price: 0,
      durationDays: 1,
    }
    await loadPrograms()
  } catch (err) {
    console.error('Ошибка создания программы', err)
    alert('Ошибка при создании программы')
  }
}


onMounted(async () => {
  role.value = localStorage.getItem('role')
  await loadPrograms()
  
})

</script>

<template>
  <div class="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6">

    <!-- Заголовок и кнопка добавления -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blue-600">Программы страхования</h2>
      
      <button
        v-if="role==='expert'" 
        @click="showCreateProgram = !showCreateProgram"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showCreateProgram ? 'Скрыть форму' : '+ Новая программа' }}
      </button>
    </div>
    
    <!-- Форма для создания новой программы -->
    <div v-if="showCreateProgram" class="mb-6 bg-gray-50 p-4 rounded-lg border">
      <h3 class="text-xl font-bold mb-4">Создание новой программы</h3>
      <form @submit.prevent="submitProgram" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold">Название</label>
          <input v-model="newProgram.name" type="text" class="w-full border rounded-lg p-2" required />
        </div>
        <div>
          <label class="block mb-1 font-semibold">Описание</label>
          <textarea v-model="newProgram.description" class="w-full border rounded-lg p-2" required></textarea>
        </div>
        <div>
          <label class="block mb-1 font-semibold">Тип программы</label>
          <select v-model="newProgram.type" class="w-full border rounded-lg p-2" required>
            <option value="">Выберите тип</option>
            <option value="home">Дом</option>
            <option value="apartment">Квартира</option>
            <option value="car">Авто</option>
            <option value="other">Другое</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-semibold">Покрытие</label>
          <input v-model="newProgram.coverage" type="text" class="w-full border rounded-lg p-2" required />
        </div>
        <div>
          <label class="block mb-1 font-semibold">Цена</label>
          <input v-model.number="newProgram.price" type="number" min="0" class="w-full border rounded-lg p-2" required />
        </div>
        <div>
          <label class="block mb-1 font-semibold">Длительность (дней)</label>
          <input v-model.number="newProgram.durationDays" type="number" min="1" class="w-full border rounded-lg p-2" required />
        </div>
        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          Создать программу
        </button>
      </form>
    </div>

    <!-- Список программ -->
    <div>
      <div v-if="programs.length === 0" class="text-gray-500">
        Нет доступных программ.
      </div>
      <div v-for="program in programs" :key="program._id" class="bg-white shadow rounded-xl p-4 mb-4 border">
        <h4 class="text-xl font-semibold mb-2">{{ program.name }}</h4>
        <p><strong>Описание:</strong> {{ program.description }}</p>
        <p><strong>Тип:</strong> {{ program.type }}</p>
        <p><strong>Покрытие:</strong> {{ program.coverage }}</p>
        <p><strong>Цена:</strong> {{ program.price }}</p>
        <p><strong>Длительность (дней):</strong> {{ program.durationDays }}</p>
        <!-- Можно добавить кнопку редактировать/удалить для эксперта -->
      </div>
    </div>
  </div>
</template>
