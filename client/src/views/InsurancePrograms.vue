<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { showSuccess, showError, showInfo, showConfirm } from '../store/Modal';

const programs = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const editingId = ref(null);
const token = localStorage.getItem('token');
const fileInput = ref(null);
const userRole = ref(null);

const canManage = computed(() => {
  return userRole.value === 'expert';
});

const formData = ref({
  name: '',
  description: '',
  type: 'apartment',
  coverage: 500000,
  price: 5000,
  durationDays: 365,
  image: null,
  imagePreview: ''
});

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

const getTypeLabel = (type) => {
  const types = {
    'home': 'Дом',
    'apartment': 'Квартира',
    'car': 'Автомобиль',
    'other': 'Иное'
  };
  return types[type] || type;
};

// Функция для получения полного URL изображения
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // Если путь уже начинается с http, возвращаем как есть
  if (imagePath.startsWith('http')) return imagePath;
  // Иначе добавляем базовый URL сервера
  // Обратите внимание: путь должен начинаться с /uploads/programs/
  // Если в базе хранится /uploads/programs/... или uploads/programs/...
  // Нормализуем путь
  let normalizedPath = imagePath;
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  return `http://localhost:5000${normalizedPath}`;
};

// Обработчик ошибки загрузки изображения
const handleImageError = (event) => {
  console.error('Ошибка загрузки изображения:', event.target.src);
  event.target.style.display = 'none';
  const parent = event.target.parentElement;
  parent.classList.add('placeholder');
  parent.innerHTML = '<span>Нет изображения</span>';
};

const fetchPrograms = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/programs', 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Загружены программы:', res.data); // Проверяем данные
    programs.value = res.data;
  } catch (err) {
    showError('Ошибка при загрузке программ');
  }
};

// Остальной код без изменений...
const openCreateForm = () => {
  if (!canManage.value) return;
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    type: 'apartment',
    coverage: 500000,
    price: 5000,
    durationDays: 365,
    image: null,
    imagePreview: ''
  };
  if (fileInput.value) fileInput.value.value = '';
};

const editProgram = (program) => {
  if (!canManage.value) return;
  isEditing.value = true;
  editingId.value = program._id;
  formData.value = {
    name: program.name,
    description: program.description,
    type: program.type,
    coverage: program.coverage,
    price: program.price,
    durationDays: program.durationDays,
    image: null,
    imagePreview: program.imageUrl ? getImageUrl(program.imageUrl) : ''
  };
  showForm.value = true;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showInfo('Размер файла не должен превышать 5MB');
    return;
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showInfo('Разрешены только JPEG, PNG и WEBP');
    return;
  }

  formData.value.image = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.value.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  formData.value.image = null;
  formData.value.imagePreview = '';
  if (fileInput.value) fileInput.value.value = '';
};

const submitProgram = async () => {
  if (!canManage.value) return;
  
  if (!formData.value.name.trim()) {
    showInfo('Введите название программы');
    return;
  }
  
  if (!formData.value.description.trim()) {
    showInfo('Введите описание программы');
    return;
  }
  
  if (formData.value.price <= 0) {
    showInfo('Цена должна быть больше 0');
    return;
  }
  
  if (formData.value.coverage <= 0) {
    showInfo('Покрытие должно быть больше 0');
    return;
  }

  loading.value = true;
  
  try {
    const submitData = new FormData();
    submitData.append('name', formData.value.name);
    submitData.append('description', formData.value.description);
    submitData.append('type', formData.value.type);
    submitData.append('coverage', formData.value.coverage);
    submitData.append('price', formData.value.price);
    submitData.append('durationDays', formData.value.durationDays);
    
    if (formData.value.image) {
      submitData.append('image', formData.value.image);
    }

    if (isEditing.value) {
      await axios.put(
        `http://localhost:5000/api/programs/${editingId.value}`,
        submitData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      showSuccess('Программа успешно обновлена');
    } else {
      await axios.post(
        'http://localhost:5000/api/programs',
        submitData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      showSuccess('Программа успешно создана');
    }
    
    closeForm();
    await fetchPrograms();
    
  } catch (err) {
    showError(err.response?.data?.message || 'Ошибка при сохранении программы');
  } finally {
    loading.value = false;
  }
};

const deleteProgram = (id) => {
  if (!canManage.value) return;
  
  showConfirm({
    title: 'Удаление программы',
    message: 'Вы действительно хотите удалить эту программу? Это действие нельзя отменить.',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await axios.delete(`http://localhost:5000/api/programs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchPrograms();
        showSuccess('Программа успешно удалена');
      } catch (err) {
        showError('Ошибка при удалении программы');
      }
    }
  });
};

onMounted(async () => {
  userRole.value = localStorage.getItem('role');
  await fetchPrograms();
});
</script>

<template>
  <!-- Остальной шаблон без изменений -->
  <div class="container">
    <div class="header">
      <h2 class="main-title">Страховые программы</h2>
      <button
        v-if="canManage"
        @click="openCreateForm"
        class="btn-primary"
      >
        + Новая программа
      </button>
    </div>

    <!-- ПОИСК -->
    <div class="search-section">
      <div class="search-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск программ..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="search-clear"
        >
          ✕
        </button>
      </div>
      <div v-if="searchQuery" class="search-stats">
        Найдено: {{ filteredPrograms.length }} из {{ programs.length }} программ
      </div>
    </div>

    <!-- ФОРМА -->
    <div v-if="showForm && canManage" class="form-container">
      <h3 class="form-title">{{ isEditing ? 'Редактирование программы' : 'Параметры новой программы' }}</h3>
      
      <form @submit.prevent="submitProgram" class="program-form">
        <!-- ... поля формы ... -->
        
        <div class="form-group">
          <label class="form-label">Изображение программы</label>
          <div class="file-upload-wrapper">
            <div class="file-upload-area" @click="triggerFileInput">
              <div v-if="formData.imagePreview" class="image-preview">
                <img :src="formData.imagePreview" alt="Preview" />
                <button type="button" class="remove-image" @click.stop="removeImage">✕</button>
              </div>
              <div v-else class="upload-placeholder">
                <p>Нажмите для загрузки изображения</p>
                <span class="upload-hint">PNG, JPG, WEBP до 5MB</span>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="file-input-hidden"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-submit-form">
            {{ loading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Опубликовать программу') }}
          </button>
          <button type="button" @click="closeForm" class="btn-cancel-form">
            Отмена
          </button>
        </div>
      </form>
    </div>

    <!-- СПИСОК ПРОГРАММ -->
    <div class="programs-section">
      
      <div v-if="filteredPrograms.length === 0 && searchQuery" class="empty-search">
        По запросу ничего не найдено
      </div>

      <div v-else-if="programs.length === 0" class="empty-state">
        Список программ пуст
      </div>

      <div class="card-grid">
        <div v-for="prog in filteredPrograms" :key="prog._id" class="card">

          <div class="program-image" v-if="prog.imageUrl">
            <img 
              :src="getImageUrl(prog.imageUrl)" 
              :alt="prog.name" 
              @error="handleImageError"
            />
          </div>
          <div class="program-image placeholder" v-else>
            <span>Нет изображения</span>
          </div>

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

          <div v-if="canManage" class="card-actions">
            <button @click="editProgram(prog)" class="btn-edit">
              Редактировать
            </button>
            <button @click="deleteProgram(prog._id)" class="btn-delete">
              Удалить
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>


<style scoped>
.container {
  max-width: 1000px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.main-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2563eb;
  margin: 0;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: auto;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-section {
  margin-bottom: 24px;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  font-size: 0.95rem;
  background: #f8fafc;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s;
}

.search-clear:hover {
  color: #475569;
  background: #e2e8f0;
}

.search-stats {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #64748b;
}

.form-container {
  background-color: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
}

.form-title {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 16px;
}

.program-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #101011;
  margin-bottom: 4px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  font-size: 0.95rem;
  background: white;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.price-input {
  font-weight: 600;
  color: #2563eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-submit-form {
  flex: 1;
  background-color: #0fc96c;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit-form:hover:not(:disabled) {
  background-color: #0fb361;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-submit-form:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel-form {
  padding: 10px 20px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-form:hover {
  background: #e2e8f0;
}

.file-upload-wrapper {
  margin-top: 4px;
}

.file-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.file-upload-area:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.file-input-hidden {
  display: none;
}

.image-preview {
  position: relative;
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image:hover {
  background: rgba(220, 38, 38, 0.8);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 2.5rem;
}

.upload-placeholder p {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
}

.upload-hint {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Список программ */
.programs-section {
  margin-top: 24px;
}

.empty-search,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

/* Карточки */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  border: 1px solid #f1f5f9;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.program-image {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.program-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-image.placeholder {
  font-size: 0.9rem;
  color: #94a3b8;
  text-align: center;
  padding: 8px;
}

.program-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

.badge-type {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
}

.program-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2563eb;
}

.program-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 12px 0 8px 0;
  color: #1e293b;
}

.program-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-edit {
  font-size: 0.75rem;
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #e2e8f0;
}

.btn-delete {
  font-size: 0.75rem;
  padding: 6px 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 16px;
    margin: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-primary {
    width: 100%;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>