<template>
  <div class="container">
    <div class="header">
      <h2 class="main-title">Управление программами</h2>
      <button
        @click="showCreateForm = !showCreateForm"
        class="btn btn-primary" style="width:auto; padding:10px 16px;">
        {{ showCreateForm ? 'Скрыть форму' : '+ Новая программа' }}
      </button>
    </div>

    <div v-if="showCreateForm" class="card-block">
      <h3 class="form-title">Параметры новой программы</h3>
      <form @submit.prevent="submitProgram" class="form-body">
        <div class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">Название программы</label>
            <input
              v-model="newProgram.name"
              type="text"
              class="form-input"
              placeholder="Например: КАСКО Премиум"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Тип объекта</label>
            <select v-model="newProgram.type" class="form-select" required>
              <option value="home">Дом</option>
              <option value="apartment">Квартира</option>
              <option value="car">Автомобиль</option>
              <option value="other">Иное</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Срок (дней)</label>
            <input
              v-model.number="newProgram.durationDays"
              type="number"
              min="1"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Покрытие (₽)</label>
            <input
              v-model.number="newProgram.coverage"
              type="number"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Цена (₽)</label>
            <input
              v-model.number="newProgram.price"
              type="number"
              class="form-input text-highlight"
              required
            />
          </div>

        </div>

        <div class="form-group">
          <label class="form-label">Описание условий</label>
          <textarea
            v-model="newProgram.description"
            rows="3"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div style="display:flex; gap:10px; margin-top:16px;">
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Сохранение...' : 'Опубликовать программу' }}
          </button>
        </div>

      </form>
    </div>

    <div class="section-container">
      <div class="header">
        <h3 class="main-title">Действующие программы</h3>
      </div>

      <div v-if="!programs || programs.length === 0" class="empty-text">
        Список программ пуст
      </div>

      <div class="card-grid">
        <div v-for="prog in programs" :key="prog._id" class="card">

          <div class="program-footer">
            <span class="badge-type">{{ prog.type }}</span>
            <span class="program-price">{{ prog.price }} ₽</span>
          </div>

          <h4 class="program-name">{{ prog.name }}</h4>
          <p class="program-desc">{{ prog.description }}</p>

          <div class="program-footer">
            <span>Покрытие: <strong>{{ prog.coverage }} ₽</strong></span>
            <span>Срок: <strong>{{ prog.durationDays }} дн.</strong></span>
          </div>

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
