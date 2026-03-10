<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const properties = ref([])

onMounted(async () => {
  const token = localStorage.getItem('token')
  const res = await axios.get(
      'http://localhost:5000/api/property',
      { headers: { Authorization: `Bearer ${token}` } }
  )
  properties.value = res.data
})
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">
      Оценённое имущество
    </h2>

    <div v-for="item in properties"
         :key="item._id"
         class="bg-white shadow p-6 mb-4 rounded-xl">

      <p><strong>Клиент:</strong> {{ item.clientName }}</p>
      <p><strong>Описание:</strong> {{ item.description }}</p>
      <p><strong>Оценочная стоимость:</strong> {{ item.value }} ₽</p>

    </div>
  </div>
</template>