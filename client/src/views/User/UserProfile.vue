<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref<any>(null)
const editMode = ref(false)
const loading = ref(false)
const birthDateString = ref('')

// Загрузка данных пользователя
const fetchUser = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://localhost:5000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    user.value = res.data

    // Преобразуем дату в формат yyyy-MM-dd для input type="date"
    birthDateString.value = user.value.birthDate
        ? user.value.birthDate.split('T')[0]
        : ''
  } catch (err) {
    alert('Ошибка при загрузке данных')
  }
}

onMounted(fetchUser)

// Синхронизируем изменения даты с объектом user
watch(birthDateString, (newVal) => {
  if (user.value) user.value.birthDate = newVal
})

// Сохранение изменений
const saveProfile = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')

    await axios.put(
        'http://localhost:5000/api/users/me',
        {
          firstName: user.value.firstName,
          lastName: user.value.lastName,
          middleName: user.value.middleName,
          email: user.value.email,
          phone: user.value.phone,
          birthDate: user.value.birthDate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
    )

    editMode.value = false
    alert('Профиль обновлён')
  } catch (err) {
    alert('Ошибка обновления')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto bg-white shadow rounded-2xl p-8">
    <h2 class="text-xl font-bold mb-6 text-blue-600 flex justify-between items-center">
      Мой профиль

      <button
          @click="router.push('/dashboard')"
          class="text-sm bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition"
      >
        ← Назад
      </button>
    </h2>

    <div v-if="user" class="space-y-4">
      <div>
        <label class="block text-sm font-semibold">Фамилия</label>
        <input v-model="user.lastName" :disabled="!editMode" class="w-full p-2 border rounded-lg"/>
      </div>

      <div>
        <label class="block text-sm font-semibold">Имя</label>
        <input v-model="user.firstName" :disabled="!editMode" class="w-full p-2 border rounded-lg"/>
      </div>

      <div>
        <label class="block text-sm font-semibold">Отчество</label>
        <input v-model="user.middleName" :disabled="!editMode" class="w-full p-2 border rounded-lg"/>
      </div>

      <div>
        <label class="block text-sm font-semibold">Email</label>
        <input v-model="user.email" type="email" :disabled="!editMode" class="w-full p-2 border rounded-lg"/>
      </div>

      <div>
        <label class="block text-sm font-semibold">Телефон</label>
        <input v-model="user.phone" :disabled="!editMode" class="w-full p-2 border rounded-lg"/>
      </div>

      <div>
        <label class="block text-sm font-semibold">Дата рождения</label>
        <input v-model="birthDateString" type="date" :disabled="!editMode" class="w-full p-2 border rounded-lg"/>
      </div>

      <div class="flex gap-3 pt-4">
        <button
            v-if="!editMode"
            @click="editMode = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Редактировать
        </button>

        <button
            v-if="editMode"
            @click="saveProfile"
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Сохранить
        </button>

        <button
            v-if="editMode"
            @click="editMode = false; fetchUser()"
            class="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>