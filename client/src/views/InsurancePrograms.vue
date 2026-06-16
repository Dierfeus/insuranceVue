<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { showSuccess, showError, showInfo } from '../store/Modal';

const programs = ref([]);
const showCreateForm = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const token = localStorage.getItem('token');

const newProgram = ref({
  name: '',
  description: '',
  type: 'apartment',
  coverage: 500000,
  price: 5000,
  durationDays: 365
});

// --- ПОИСК ПРОГРАММ ---
const filteredPrograms = computed(() => {
  if (!searchQuery.value) return programs.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  
  return programs.value.filter(prog => {
    const nameMatch = prog.name.toLowerCase().includes(query);
    const descMatch = prog.description.toLowerCase().includes(query);
    const typeMatch = getTypeLabel(prog.type).toLowerCase().includes(query);
    const priceMatch = prog.price.toString().includes(query);
    const coverageMatch = prog.coverage.toString().includes(query);
    const durationMatch = prog.durationDays.toString().includes(query);
    
    return nameMatch || descMatch || typeMatch || priceMatch || coverageMatch || durationMatch;
  });
});

// --- ПОЛУЧЕНИЕ ЛАБЕЛА ТИПА ---
const getTypeLabel = (type) => {
  const types = {
    'home': 'Дом',
    'apartment': 'Квартира',
    'car': 'Автомобиль',
    'other': 'Иное'
  };
  return types[type] || type;
};

// --- ЗАГРУЗКА ПРОГРАММ ---
const fetchPrograms = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/programs', 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    programs.value = res.data;
  } catch (err) {
    showError('Ошибка при загрузке программ');
  }
};

// --- СОЗДАНИЕ ПРОГРАММЫ ---
const submitProgram = async () => {
  // Валидация
  if (!newProgram.value.name.trim()) {
    showInfo('Введите название программы');
    return;
  }
  
  if (!newProgram.value.description.trim()) {
    showInfo('Введите описание программы');
    return;
  }
  
  if (newProgram.value.price <= 0) {
    showInfo('Цена должна быть больше 0');
    return;
  }
  
  if (newProgram.value.coverage <= 0) {
    showInfo('Покрытие должно быть больше 0');
    return;
  }

  loading.value = true;
  
  try {
    await axios.post('http://localhost:5000/api/programs', newProgram.value, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Сброс формы
    newProgram.value = {
      name: '',
      description: '',
      type: 'apartment',
      coverage: 500000,
      price: 5000,
      durationDays: 365
    };
    
    showCreateForm.value = false;
    await fetchPrograms();
    showSuccess('Программа успешно создана');
    
  } catch (err) {
    showError(err.response?.data?.message || 'Ошибка при сохранении программы');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPrograms);
</script>

<template>
  <div class="container">
    <div class="header">
      <h2 class="main-title">Управление программами</h2>
      <button
        @click="showCreateForm = !showCreateForm"
        class="btn-primary" style="width:auto; padding:10px 16px;"
      >
        {{ showCreateForm ? 'Скрыть форму' : '+ Новая программа' }}
      </button>
    </div>

    <!-- ПОИСК -->
    <div style="margin-bottom: 24px;">
      <div style="position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск программ..."
          class="form-input"
          style="padding-left: 36px;"
        />
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.6;">🔍</span>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8;"
        >
          ✕
        </button>
      </div>
      <div v-if="searchQuery" style="margin-top: 8px; font-size: 0.8rem; color: #64748b;">
        Найдено: {{ filteredPrograms.length }} из {{ programs.length }} программ
      </div>
    </div>

    <!-- ФОРМА СОЗДАНИЯ -->
    <div v-if="showCreateForm" class="creation-form-container">
      <h3 class="form-title">Параметры новой программы</h3>
      
      <form @submit.prevent="submitProgram" class="form-body">
        <div class="form-group">
          <label class="form-label">Название программы</label>
          <input
            v-model="newProgram.name"
            type="text"
            class="form-input"
            placeholder="Например: КАСКО Премиум"
            required
          />
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
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
              class="form-input"
              style="font-weight: 600; color: #2563eb;"
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
          <button type="submit" :disabled="loading" class="btn-primary" style="flex:1;">
            {{ loading ? 'Сохранение...' : 'Опубликовать программу' }}
          </button>
          <button type="button" @click="showCreateForm = false" class="btn-edit" style="padding: 10px 20px;">
            Отмена
          </button>
        </div>
      </form>
    </div>

    <!-- СПИСОК ПРОГРАММ -->
    <div style="margin-top: 24px;">
      
      <div v-if="filteredPrograms.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
        По запросу ничего не найдено
      </div>

      <div v-else-if="programs.length === 0" style="text-align: center; padding: 40px; color: #94a3b8;">
        Список программ пуст
      </div>

      <div class="card-grid">
        <div v-for="prog in filteredPrograms" :key="prog._id" class="card">

          <div class="program-footer">
            <span class="badge-type">{{ getTypeLabel(prog.type) }}</span>
            <span class="program-price">{{ prog.price.toLocaleString() }} ₽</span>
          </div>

          <h4 class="program-name">{{ prog.name }}</h4>
          <p class="program-desc">{{ prog.description }}</p>

          <div class="program-footer">
            <span>Покрытие: <strong>{{ prog.coverage.toLocaleString() }} ₽</strong></span>
            <span>Срок: <strong>{{ prog.durationDays }} дн.</strong></span>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

