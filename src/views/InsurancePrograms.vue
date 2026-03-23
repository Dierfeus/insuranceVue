<template>
  <div class="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6">

    <!-- Верхняя панель -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blue-600">
        Страховые заявки
      </h2>

      <button
          @click="showCreateClaim = !showCreateClaim"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showCreateClaim ? 'Скрыть форму' : '+ Новая заявка' }}
      </button>
    </div>

    <!-- Форма создания заявки -->
    <div v-if="showCreateClaim" class="mb-6 bg-gray-50 p-4 rounded-lg border">
      <h3 class="text-xl font-bold mb-4">Создание новой заявки</h3>
      <form @submit.prevent="submitClaim" class="space-y-4">

        <!-- Данные клиента (если создаёт агент) -->
        <div v-if="userRole === 'agent'">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold">Фамилия</label>
              <input v-model="newClaim.lastName" type="text" class="w-full border rounded-lg p-2" required />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Имя</label>
              <input v-model="newClaim.firstName" type="text" class="w-full border rounded-lg p-2" required />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Отчество</label>
              <input v-model="newClaim.middleName" type="text" class="w-full border rounded-lg p-2" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Телефон</label>
              <input v-model="newClaim.phone" type="text" class="w-full border rounded-lg p-2" required />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Email</label>
              <input v-model="newClaim.email" type="email" class="w-full border rounded-lg p-2" required />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Логин</label>
              <input v-model="newClaim.username" type="text" class="w-full border rounded-lg p-2" required />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Пароль</label>
              <input v-model="newClaim.password" type="password" class="w-full border rounded-lg p-2" required />
            </div>
          </div>
        </div>

        <!-- Выбор программы -->
        <div>
          <label class="block mb-1 font-semibold">Программа страхования</label>
          <select
              v-model="newClaim.programId"
              class="w-full border rounded-lg p-2"
              required
          >
            <option value="">Выберите программу</option>
            <option v-for="p in programs" :key="p._id" :value="p._id">
              {{ p.name }}
            </option>
          </select>
        </div>

        <!-- Тип программы -->
        <div>
          <label class="block mb-1 font-semibold">Тип программы</label>
          <select v-model="newClaim.programType" class="w-full border rounded-lg p-2" required>
            <option value="">Выберите тип</option>
            <option value="house">Дом</option>
            <option value="apartment">Квартира</option>
            <option value="car">Авто</option>
            <option value="other">Иное</option>
          </select>
        </div>

        <!-- Динамические поля -->
        <div v-if="newClaim.programType==='house' || newClaim.programType==='apartment'">
          <label class="block mb-1 font-semibold">Адрес</label>
          <input v-model="newClaim.propertyInfo" type="text" class="w-full border rounded-lg p-2" required />
        </div>

        <div v-if="newClaim.programType==='car'">
          <label class="block mb-1 font-semibold">Модель автомобиля</label>
          <input v-model="newClaim.propertyInfo" type="text" class="w-full border rounded-lg p-2" required />
        </div>

        <div v-if="newClaim.programType==='other'">
          <label class="block mb-1 font-semibold">Описание имущества</label>
          <input v-model="newClaim.propertyInfo" type="text" class="w-full border rounded-lg p-2" required />
        </div>

        <!-- Срок и дата -->
        <div>
          <label class="block mb-1 font-semibold">Желаемый срок страхования (дней)</label>
          <input v-model.number="newClaim.durationDays" type="number" min="7" class="w-full border rounded-lg p-2" required />
        </div>

        <div>
          <label class="block mb-1 font-semibold">Дата начала страхования</label>
          <input v-model="newClaim.startDate" type="date" :min="minStartDate" class="w-full border rounded-lg p-2" required />
        </div>

        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          Создать заявку
        </button>
      </form>
    </div>

    <!-- Список заявок -->
    <div v-if="claims.length === 0" class="text-gray-500">
      Заявок пока нет.
    </div>

    <div v-for="claim in claims" :key="claim._id" class="bg-white shadow rounded-xl p-4 mb-4 border">
      <div class="flex justify-between">
        <div>
          <p><strong>Клиент:</strong> {{ claim.user?.lastName }} {{ claim.user?.firstName }}</p>
          <p><strong>Программа:</strong> {{ claim.program?.name }}</p>
          <p><strong>Тип:</strong> {{ claim.programType }}</p>
          <p><strong>Имущество/Адрес:</strong> {{ claim.propertyInfo }}</p>
          <p><strong>Срок (дней):</strong> {{ claim.durationDays }}</p>
          <p><strong>Дата начала:</strong> {{ formatDate(claim.startDate) }}</p>
        </div>

        <div class="text-right">
          <p
              :class="{
                'text-yellow-600': claim.status==='pending',
                'text-green-600': claim.status==='approved',
                'text-red-600': claim.status==='rejected'
              }"
              class="font-semibold"
          >
            {{ claim.status }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const claims = ref<any[]>([])
const programs = ref<any[]>([])
const showCreateClaim = ref(false)
const token = localStorage.getItem('token')
const userRole = ref<string>('user')

const today = new Date()
const minStartDate = today.toISOString().split('T')[0]

const newClaim = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  programId: '',
  programType: '',
  propertyInfo: '',
  durationDays: 7,
  startDate: ''
})

// Загрузка заявок
const loadClaims = async () => {
  if (!token) return
  try {
    const res = await axios.get(
        userRole.value === 'user' ? '/api/claims/my' : '/api/claims',
        { headers: { Authorization: `Bearer ${token}` } }
    )
    // Фильтруем только валидные заявки
    claims.value = res.data
        .filter((c: any) => c._id)
        .map((c: any) => ({
          ...c,
          user: c.user || { firstName: '-', lastName: '-' },
          program: c.program || { name: '-' }
        }))
  } catch (err) {
    console.error('Ошибка загрузки заявок', err)
  }
}

// Загрузка программ
const loadPrograms = async () => {
  if (!token) return
  try {
    const res = await axios.get('/api/programs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    programs.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки программ', err)
  }
}

// Создание заявки
const submitClaim = async () => {
  if (!token) return
  try {
    const payload: any = { ...newClaim }
    await axios.post('/api/claims', payload, { headers: { Authorization: `Bearer ${token}` } })
    showCreateClaim.value = false
    Object.assign(newClaim, {
      lastName: '', firstName: '', middleName: '', phone: '', email: '', username: '', password: '',
      programId: '', programType: '', propertyInfo: '', durationDays: 7, startDate: ''
    })
    await loadClaims()
  } catch (err) {
    console.error(err)
    alert('Ошибка создания заявки')
  }
}

const formatDate = (d: string) => new Date(d).toLocaleDateString()

onMounted(async () => {
  if (token) {
    const me = await axios.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
    userRole.value = me.data.role
    await loadPrograms()
    await loadClaims()
  }
})
</script>