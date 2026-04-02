<template>
  <div class="container">
    <div class="header">
      <h2 class="main-title">Управление программами</h2>
      <button 
        @click="showCreateForm = !showCreateForm"
        class="btn-primary">{{ showCreateForm ? 'Скрыть форму' : '+ Новая программа' }}
      </button>
    </div>

    <div v-if="showCreateForm" class="creation-form-container">
      <h3 class="form-title">Параметры новой программы</h3>
      
      <form @submit.prevent="submitProgram" class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Название -->
          <div class="md:col-span-2">
            <label class="form-label">Название программы</label>
            <input v-model="newProgram.name" type="text" class="form-input" placeholder="Например: КАСКО Премиум" required />
          </div>

          <!-- Тип -->
          <div>
            <label class="form-label">Тип объекта</label>
            <select v-model="newProgram.type" class="form-select" required>
              <option value="home">Дом</option>
              <option value="apartment">Квартира</option>
              <option value="car">Автомобиль</option>
              <option value="other">Иное</option>
            </select>
          </div>

          <!-- Срок -->
          <div>
            <label class="form-label">Рекомендуемый срок (дней)</label>
            <input v-model.number="newProgram.durationDays" type="number" min="1" class="form-input" required />
          </div>

          <!-- Страховая сумма -->
          <div>
            <label class="form-label">Страховое покрытие (₽)</label>
            <input v-model.number="newProgram.coverage" type="number" min="0" class="form-input" placeholder="Сумма выплаты" required />
          </div>

          <!-- Цена -->
          <div>
            <label class="form-label">Стоимость полиса (₽)</label>
            <input v-model.number="newProgram.price" type="number" min="0" class="form-input" placeholder="Цена для клиента" required />
          </div>
        </div>

        <!-- Описание -->
        <div>
          <label class="form-label">Описание условий</label>
          <textarea v-model="newProgram.description" rows="3" class="form-textarea" placeholder="Подробности страхового случая..." required></textarea>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary btn-submit">
          {{ loading ? 'Сохранение...' : 'Опубликовать программу' }}
        </button>
      </form>
    </div>

    <!-- Список существующих программ -->
    <h3 class="text-lg font-semibold mb-4">Действующие программы</h3>

    <div v-if="!programs || programs.length === 0" class="form-title">Список программ пуст.</div>

    <div class="card-grid">
  <div v-for="prog in programs" :key="prog._id" class="card">
    <div class="program-footer">
      <span class="badge-type">
        {{ prog.type }}
      </span>
      <span class="program-price"> {{ (prog.price || 0) }} ₽ </span>
    </div>
    <h4 class="program-name">{{ prog.name }}</h4>
    <p class="program-desc">{{ prog.description }}</p>
    <div class="program-footer">
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
