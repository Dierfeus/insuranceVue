<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

interface Contract {
  _id: string
  premiumAmount: number
  startDate: string
  durationDays: number
  status: string
  client: any
  agent: any
}

const contracts = ref<Contract[]>([])
const showModal = ref(false)
const loading = ref(false)

const token = localStorage.getItem('token')

const selectedContract = reactive({
  _id: '',
  premiumAmount: 0,
  startDate: '',
  durationDays: 0,
  status: 'active'
})

const startDateString = ref('')

// загрузка договоров
const loadContracts = async () => {
  try {
    const res = await axios.get(
        'http://localhost:5000/api/contracts',
        { headers: { Authorization: `Bearer ${token}` } }
    )

    contracts.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки договоров', err)
  }
}

// открыть редактирование
const editContract = (contract: Contract) => {

  Object.assign(selectedContract, contract)

  startDateString.value = contract.startDate
      ? contract.startDate.split('T')[0]
      : ''

  showModal.value = true
}

// сохранить
const updateContract = async () => {

  try {

    loading.value = true

    await axios.put(
        `http://localhost:5000/api/contracts/${selectedContract._id}`,
        {
          premiumAmount: selectedContract.premiumAmount,
          startDate: startDateString.value,
          durationDays: selectedContract.durationDays,
          status: selectedContract.status
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
    )

    alert('Договор обновлён')

    showModal.value = false

    loadContracts()

  } catch {
    alert('Ошибка обновления договора')
  } finally {
    loading.value = false
  }

}

onMounted(loadContracts)
</script>


<template>

  <div class="max-w-6xl mx-auto">

    <!-- список договоров -->

    <div
        v-for="contract in contracts"
        :key="contract._id"
        class="bg-white shadow p-4 mb-3 rounded-xl flex justify-between items-center"
    >

      <div>

        <p>
          <strong>Клиент:</strong>
          {{ contract.client?.firstName }} {{ contract.client?.lastName }}
        </p>

        <p>
          <strong>Агент:</strong>
          {{ contract.agent?.firstName }} {{ contract.agent?.lastName }}
        </p>

        <p>
          <strong>Стоимость:</strong>
          {{ contract.premiumAmount }}
        </p>

        <p>
          <strong>Дата начала:</strong>
          {{ new Date(contract.startDate).toLocaleDateString() }}
        </p>

        <p>
          <strong>Срок:</strong>
          {{ contract.durationDays }} дней
        </p>

        <p>
          <strong>Статус:</strong>
          {{ contract.status }}
        </p>

      </div>


      <button
          @click="editContract(contract)"
          class="bg-yellow-500 text-white px-3 py-1 rounded"
      >
        Изменить
      </button>

    </div>



    <!-- модальное окно -->

    <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
    >

      <div
          class="bg-white rounded-2xl p-6 w-full max-w-md relative"
      >

        <button
            @click="showModal = false"
            class="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <h3
            class="text-xl font-bold mb-4 text-blue-600"
        >
          Редактировать договор
        </h3>


        <form
            @submit.prevent="updateContract"
            class="space-y-4"
        >

          <div>
            <label class="block text-sm font-semibold">
              Сумма
            </label>

            <input
                v-model.number="selectedContract.premiumAmount"
                type="number"
                class="w-full border rounded-lg p-2"
            />
          </div>


          <div>
            <label class="block text-sm font-semibold">
              Дата начала
            </label>

            <input
                v-model="startDateString"
                type="date"
                class="w-full border rounded-lg p-2"
            />
          </div>


          <div>
            <label class="block text-sm font-semibold">
              Срок (дней)
            </label>

            <input
                v-model.number="selectedContract.durationDays"
                type="number"
                class="w-full border rounded-lg p-2"
            />
          </div>


          <div>
            <label class="block text-sm font-semibold">
              Статус
            </label>

            <select
                v-model="selectedContract.status"
                class="w-full border rounded-lg p-2"
            >
              <option value="active">active</option>
              <option value="closed">closed</option>
            </select>
          </div>


          <button
              type="submit"
              :disabled="loading"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Сохранить
          </button>

        </form>

      </div>

    </div>

  </div>

</template>