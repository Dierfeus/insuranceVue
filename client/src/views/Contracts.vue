<template>

  <!-- Верхняя панель -->
  <div class="flex justify-between items-center mb-6">

    <h2 class="text-2xl font-bold text-blue-600">
      Договоры
    </h2>

    <!-- Кнопка создания -->
    <button
        v-if="userRole === 'agent'"
        @click="openModal"
        class="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
    >
      + Создать договор
    </button>

  </div>


  <!-- Модальное окно -->
  <div
      v-if="showModal && userRole === 'agent'"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
  >

    <div class="bg-white rounded-2xl p-8 w-full max-w-lg relative">

      <button
          @click="closeModal"
          class="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h3 class="text-xl font-bold mb-6 text-blue-600">
        Создание нового договора
      </h3>

      <form @submit.prevent="submitContract" class="space-y-4">

        <!-- Телефон -->
        <div>
          <label class="block mb-1 font-semibold">
            Телефон клиента
          </label>

          <input
              type="text"
              v-model="form.clientPhone"
              placeholder="Введите номер телефона"
              class="w-full border rounded-lg p-2"
              list="clients-list"
              required
          />

          <datalist id="clients-list">

            <option
                v-for="c in clients"
                :key="c._id"
                :value="c.phone"
            >
              {{ c.firstName }} {{ c.lastName }}
            </option>

          </datalist>

        </div>


        <!-- Заявки -->
        <div v-if="claims.length">

          <label class="block mb-1 font-semibold">
            Заявка клиента
          </label>

          <select
              v-model="form.claimId"
              class="w-full border rounded-lg p-2"
              required
          >

            <option value="">
              Выберите заявку
            </option>

            <option
                v-for="c in claims"
                :key="c._id"
                :value="c._id"
            >
              {{ c.type }} — {{ formatDate(c.date) }}
            </option>

          </select>

        </div>


        <!-- Программа -->
        <div>

          <label class="block mb-1 font-semibold">
            Программа страхования
          </label>

          <select
              v-model="form.programId"
              class="w-full border rounded-lg p-2"
              required
          >

            <option value="">
              Выберите программу
            </option>

            <option
                v-for="p in programs"
                :key="p._id"
                :value="p._id"
            >
              {{ p.name }}
            </option>

          </select>

        </div>


        <!-- Сумма -->
        <div>

          <label class="block mb-1 font-semibold">
            Сумма
          </label>

          <input
              type="number"
              v-model.number="form.amount"
              class="w-full border rounded-lg p-2"
              required
          />

        </div>


        <!-- Дата -->
        <div>

          <label class="block mb-1 font-semibold">
            Дата
          </label>

          <input
              type="date"
              v-model="form.date"
              class="w-full border rounded-lg p-2"
              required
          />

        </div>


        <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Создать договор
        </button>

      </form>

    </div>

  </div>

</template>

<script setup lang="ts">

import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'


interface Program {
  _id: string
  name: string
}

interface Client {
  _id: string
  firstName: string
  lastName: string
  phone: string
}

interface Claim {
  _id: string
  type: string
  date: string
  status: string
}


const programs = ref<Program[]>([])
const clients = ref<Client[]>([])
const claims = ref<Claim[]>([])

const showModal = ref(false)
const userRole = ref<string>('user')

const token = localStorage.getItem('token')


const form = reactive({
  clientPhone: '',
  clientId: '',
  claimId: '',
  programId: '',
  amount: 0,
  date: ''
})


const openModal = () => showModal.value = true
const closeModal = () => showModal.value = false


const formatDate = (date: string) =>
    new Date(date).toLocaleDateString()


// программы
const loadPrograms = async () => {

  const res = await axios.get(
      'http://localhost:5000/api/programs'
  )

  programs.value = res.data

}


// клиенты
const loadClients = async () => {

  if (userRole.value !== 'agent') return

  const res = await axios.get(
      'http://localhost:5000/api/users',
      { headers: { Authorization: `Bearer ${token}` } }
  )

  clients.value = res.data

}


// загрузка заявок клиента
watch(() => form.clientPhone, async (phone) => {

  const client = clients.value.find(
      c => c.phone === phone
  )

  if (!client) {

    claims.value = []
    return

  }

  form.clientId = client._id

  try {

    const res = await axios.get(
        `http://localhost:5000/api/claims/client/${client._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    )

    claims.value = res.data

  }

  catch {

    claims.value = []

  }

})


// создание договора
const submitContract = async () => {

  try {

    await axios.post(

        'http://localhost:5000/api/contracts',

        {
          claimId: form.claimId,
          programId: form.programId,
          amount: form.amount,
          date: form.date
        },

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

    )

    closeModal()

  }

  catch {

    alert('Ошибка создания договора')

  }

}


// определяем роль
onMounted(async () => {

  if (!token) return

  const me = await axios.get(
      'http://localhost:5000/api/users/me',
      { headers: { Authorization: `Bearer ${token}` } }
  )

  userRole.value = me.data.role

  await loadPrograms()
  await loadClients()

})

</script>