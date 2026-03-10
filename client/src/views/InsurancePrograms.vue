<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'

interface Program {
  _id?: string
  name: string
  description: string
  coverage: number
  price: number
}

const programs = ref<Program[]>([])
const showModal = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const role = ref<string | null>(null)

// Для редактирования/создания программы
const selectedProgram = reactive<Program>({
  name: '',
  description: '',
  coverage: 0,
  price: 0
})

// Загрузка программ
const loadPrograms = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/programs')
    programs.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки программ', err)
  }
}

// Открытие модального окна для добавления
const addProgram = () => {
  isEdit.value = false
  Object.assign(selectedProgram, { name: '', description: '', coverage: 0, price: 0 })
  showModal.value = true
}

// Открытие модального окна для редактирования
const editProgram = (program: Program) => {
  isEdit.value = true
  Object.assign(selectedProgram, program)
  showModal.value = true
}

// Сохранение программы (добавление или обновление)
const saveProgram = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (isEdit.value && selectedProgram._id) {
      await axios.put(
          `http://localhost:5000/api/programs/${selectedProgram._id}`,
          selectedProgram,
          { headers: { Authorization: `Bearer ${token}` } }
      )
    } else {
      await axios.post(
          'http://localhost:5000/api/programs',
          selectedProgram,
          { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    showModal.value = false
    await loadPrograms()
  } catch (err) {
    alert('Ошибка сохранения программы')
  } finally {
    loading.value = false
  }
}

// Получаем роль пользователя
onMounted(() => {
  role.value = localStorage.getItem('role')
  loadPrograms()
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-blue-600">
      Страховые программы
    </h2>

    <!-- Кнопка добавления только для эксперта -->
    <div v-if="role === 'expert'" class="mb-4">
      <button
          @click="addProgram"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        + Добавить программу
      </button>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div v-for="program in programs"
           :key="program._id"
           class="bg-white shadow rounded-xl p-6 relative">

        <h3 class="text-lg font-semibold mb-2">
          {{ program.name }}
        </h3>

        <p class="mb-2 text-gray-600">
          {{ program.description }}
        </p>

        <p><strong>Покрытие:</strong> до {{ program.coverage }} ₽</p>
        <p><strong>Стоимость:</strong> {{ program.price }} ₽ / год</p>

        <!-- Кнопка редактирования только для эксперта -->
        <button
            v-if="role === 'expert'"
            @click="editProgram(program)"
            class="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
        >
          Редактировать
        </button>
      </div>
    </div>

    <!-- Модальное окно -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg relative">
        <button @click="showModal = false" class="absolute top-3 right-3 text-gray-500">✕</button>
        <h3 class="text-xl font-bold mb-4 text-blue-600">
          {{ isEdit ? 'Редактировать программу' : 'Новая программа' }}
        </h3>

        <form @submit.prevent="saveProgram" class="space-y-4">

          <div>
            <label class="block text-sm font-semibold">Название</label>
            <input v-model="selectedProgram.name" class="w-full border rounded-lg p-2" required/>
          </div>

          <div>
            <label class="block text-sm font-semibold">Описание</label>
            <textarea v-model="selectedProgram.description" class="w-full border rounded-lg p-2" rows="3" required></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold">Покрытие (₽)</label>
            <input type="number" v-model.number="selectedProgram.coverage" class="w-full border rounded-lg p-2" required/>
          </div>

          <div>
            <label class="block text-sm font-semibold">Стоимость (₽ / год)</label>
            <input type="number" v-model.number="selectedProgram.price" class="w-full border rounded-lg p-2" required/>
          </div>

          <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Сохранить
          </button>
        </form>
      </div>
    </div>
  </div>
</template>