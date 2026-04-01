<template>
  <div class="max-w-5xl mx-auto bg-white shadow rounded-2xl p-6">
    
    <!-- Верхняя панель -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blue-600">Управление программами</h2>
      <button 
        @click="showCreateForm = !showCreateForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ showCreateForm ? 'Скрыть форму' : '+ Новая программа' }}
      </button>
    </div>

    <!-- Форма создания программы (только для экспертов) -->
    <div v-if="showCreateForm" class="mb-8 bg-gray-50 p-6 rounded-xl border-2 border-blue-100">
      <h3 class="text-xl font-bold mb-4 text-gray-700">Параметры новой программы</h3>
      
      <form @submit.prevent="submitProgram" class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Название -->
          <div class="md:col-span-2">
            <label class="block mb-1 font-semibold text-sm">Название программы</label>
            <input v-model="newProgram.name" type="text" class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Например: КАСКО Премиум" required />
          </div>

          <!-- Тип -->
          <div>
            <label class="block mb-1 font-semibold text-sm">Тип объекта</label>
            <select v-model="newProgram.type" class="w-full border rounded-lg p-2 outline-none" required>
              <option value="home">Дом</option>
              <option value="apartment">Квартира</option>
              <option value="car">Автомобиль</option>
              <option value="other">Иное</option>
            </select>
          </div>

          <!-- Срок -->
          <div>
            <label class="block mb-1 font-semibold text-sm">Рекомендуемый срок (дней)</label>
            <input v-model.number="newProgram.durationDays" type="number" min="1" class="w-full border rounded-lg p-2" required />
          </div>

          <!-- Страховая сумма -->
          <div>
            <label class="block mb-1 font-semibold text-sm">Страховое покрытие (₽)</label>
            <input v-model.number="newProgram.coverage" type="number" min="0" class="w-full border rounded-lg p-2" placeholder="Сумма выплаты" required />
          </div>

          <!-- Цена -->
          <div>
            <label class="block mb-1 font-semibold text-sm">Стоимость полиса (₽)</label>
            <input v-model.number="newProgram.price" type="number" min="0" class="w-full border rounded-lg p-2" placeholder="Цена для клиента" required />
          </div>
        </div>

        <!-- Описание -->
        <div>
          <label class="block mb-1 font-semibold text-sm">Описание условий</label>
          <textarea v-model="newProgram.description" rows="3" class="w-full border rounded-lg p-2" placeholder="Подробности страхового случая..." required></textarea>
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400">
          {{ loading ? 'Сохранение...' : 'Опубликовать программу' }}
        </button>
      </form>
    </div>

    <!-- Список существующих программ -->
    <h3 class="text-lg font-semibold mb-4">Действующие программы</h3>
    <div v-if="!programs || programs.length === 0" class="text-gray-400 italic">
      Список программ пуст.
    </div>

    <div class="grid gap-4 md:grid-cols-2">
  <div v-for="prog in programs" :key="prog._id" class="border rounded-xl p-4 bg-white hover:shadow-md transition border-gray-100">
    <div class="flex justify-between items-start mb-2">
      <span class="text-xs font-bold uppercase px-2 py-1 rounded bg-blue-50 text-blue-600">
        {{ prog.type }}
      </span>
      <span class="font-bold text-blue-600"> {{ (prog.price || 0) }} ₽ </span>
    </div>
    <h4 class="font-bold text-lg mb-1">{{ prog.name }}</h4>
    <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ prog.description }}</p>
    <div class="flex justify-between text-xs text-gray-500 pt-3 border-t">
      <span>Покрытие: <strong>{{ prog.coverage || 0 }} ₽</strong></span>
      <span>Срок: <strong>{{ prog.durationDays }} дн.</strong></span>
    </div>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; 

const programs = ref([]);
const showCreateForm = ref(false);
const loading = ref(false);
const token = localStorage.getItem('token')

const newProgram = ref({
  name: '',
  description: '',
  type: 'apartment',
  coverage: 500000,
  price: 5000,
  durationDays: 365
});

const fetchPrograms = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/programs', 
    { headers: { Authorization: `Bearer ${token}` }}
    );
    programs.value = res.data;
  } catch (err) {
    alert('Ошибка при загрузке программ');
  }
};

const submitProgram = async () => {
  loading.value = true;
  try {
    await axios.post('http://localhost:5000/api/programs', newProgram.value,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    
    newProgram.value = { name: '', description: '', type: 'apartment', coverage: 500000, price: 5000, durationDays: 365 };
    showCreateForm.value = false;
    alert('Программа успешно создана');
  } catch (err) {
    alert(err.response?.data?.message || 'Ошибка при сохранении');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPrograms);
</script>
