<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { auth } from '../../store/auth'

const token = localStorage.getItem('token')

const showCreateClaim = ref(false)
const programs = ref<any[]>([])
const role = auth.role

const today = new Date()
const minStartDate = today.toISOString().split('T')[0]

const form = reactive({

  // клиент
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  email: '',
  username: '',
  password: '',

  // заявка
  programId: '',
  durationDays: 7,
  startDate: ''

})

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

const submitClaim = async () => {

  try {
    await axios.post(
        'http://localhost:5000/api/claims',
        form,
        { headers:{ Authorization:`Bearer ${token}` }}
    )
    alert('Заявка создана')
    Object.assign(form,{
      lastName:'',
      firstName:'',
      middleName:'',
      phone:'',
      email:'',
      username:'',
      password:'',
      programId:'',
      durationDays:7,
      startDate:''
    })
    showCreateClaim.value=false
  } catch(err){
    alert('Ошибка создания заявки')
  }
}

onMounted(async () => {
  await loadPrograms()
  if (['agent', 'inspector', 'expert'].includes(role.value)) {
    await loadAllClaims()
  }
})
</script>


<template>

  <div v-if="role==='agent'" class="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6">
    <div  class="flex justify-between items-center mb-6">

      <h2 class="text-2xl font-bold text-blue-600">
        Создание страховой заявки
      </h2>

      <button
          @click="showCreateClaim = !showCreateClaim"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showCreateClaim ? 'Скрыть форму' : '+ Новая заявка' }}
      </button>

    </div>

    <div v-if="claims.length" class="mt-6">
      <h3 class="text-xl font-bold mb-4">Все заявки</h3>

      <div
          v-for="claim in claims"
          :key="claim._id"
          class="bg-white shadow rounded-xl p-4 mb-4 border"
      >
        <p><strong>Программа:</strong> {{ claim.program }}</p>
        <p><strong>Клиент:</strong> {{ claim.user }}</p>
        <p><strong>Статус:</strong> {{ claim.status }}</p>
        <p><strong>Дата:</strong> {{ claim.startDate }}</p>
      </div>
    </div>


    <!-- Форма -->

    <div v-if="showCreateClaim" class="mb-6 bg-gray-50 p-4 rounded-lg border">

      <h3 class="text-xl font-bold mb-4">
        Данные клиента
      </h3>

      <form @submit.prevent="submitClaim" class="space-y-4">

        <!-- ФИО -->

        <div class="grid grid-cols-3 gap-3">

          <input
              v-model="form.lastName"
              placeholder="Фамилия"
              class="border rounded-lg p-2"
          />

          <input
              v-model="form.firstName"
              placeholder="Имя"
              class="border rounded-lg p-2"
          />

          <input
              v-model="form.middleName"
              placeholder="Отчество"
              class="border rounded-lg p-2"
          />

        </div>


        <!-- контакты -->

        <input
            v-model="form.phone"
            placeholder="Телефон"
            class="w-full border rounded-lg p-2"
        />

        <input
            v-model="form.email"
            placeholder="Email"
            class="w-full border rounded-lg p-2"
        />


        <!-- аккаунт -->

        <h3 class="text-lg font-semibold pt-2">
          Аккаунт клиента
        </h3>

        <input
            v-model="form.username"
            placeholder="Логин"
            class="w-full border rounded-lg p-2"
        />

        <input
            type="password"
            v-model="form.password"
            placeholder="Пароль"
            class="w-full border rounded-lg p-2"
        />


        <!-- программа -->

        <h3 class="text-lg font-semibold pt-2">
          Параметры страхования
        </h3>

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
              {{p.name}} ({{p.type}})
            </option>

          </select>

        </div>


        <!-- срок -->

        <div>

          <label class="block mb-1 font-semibold">
            Срок страхования (дней)
          </label>

          <input
              v-model.number="form.durationDays"
              type="number"
              min="7"
              class="w-full border rounded-lg p-2"
          />

        </div>


        <!-- дата -->

        <div>

          <label class="block mb-1 font-semibold">
            Дата начала страхования
          </label>

          <input
              v-model="form.startDate"
              type="date"
              :min="minStartDate"
              class="w-full border rounded-lg p-2"
          />

        </div>


        <button
            type="submit"
            class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >

          Создать заявку

        </button>

      </form>

    </div>

  </div>

</template>