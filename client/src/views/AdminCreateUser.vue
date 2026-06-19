<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { showError, showSuccess, showConfirm } from '../store/Modal'
import { EyeIcon, EyeOffIcon } from '../components/icons/index'

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const phone = ref('')
const email = ref('')
const birthDate = ref('')
const username = ref('')
const password = ref('')
const role = ref('user')

const loading = ref(false)
const showPassword = ref(false)
const token = localStorage.getItem('token')
const users = ref<any[]>([])
const searchQuery = ref('')

const formatPhone = (e: Event) => {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length > 11) value = value.slice(0, 11)

  let result = ''

  if (value.length > 0) {
    result = '+7'

    if (value.length > 1) {
      result += ' (' + value.slice(1, 4)
    }

    if (value.length > 4) {
      result += ') ' + value.slice(4, 7)
    }

    if (value.length > 7) {
      result += '-' + value.slice(7, 9)
    }

    if (value.length > 9) {
      result += '-' + value.slice(9, 11)
    }
  }

  phone.value = result
  input.value = result
}

const createUser = async () => {
  if (!token) {
    showError('Вы не авторизованы')
    return
  }

  loading.value = true

  try {
    await axios.post(
      'http://localhost:5000/auth/admin/create-user',
      {
        username: username.value,
        password: password.value,
        role: role.value,
        firstName: firstName.value,
        lastName: lastName.value,
        middleName: middleName.value,
        phone: phone.value.replace(/\D/g, ''),
        email: email.value,
        birthDate: birthDate.value
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    )

    showSuccess('Пользователь успешно создан')

    firstName.value = ''
    lastName.value = ''
    middleName.value = ''
    phone.value = ''
    email.value = ''
    birthDate.value = ''
    username.value = ''
    password.value = ''
    role.value = 'user'

    await loadEmployees()

  } catch (err: any) {
    if (err.response?.status === 401) {
      showError('Сессия истекла, войдите заново')
    } else if (err.response?.status === 403) {
      showError('Недостаточно прав для создания пользователя')
    } else {
      showError(
        err.response?.data?.message ||
        'Ошибка создания пользователя'
      )
    }
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/users/employees', {
            headers: { Authorization: `Bearer ${token}` }
        })
        users.value = res.data
    } catch (err) {
        showError('Ошибка загрузки работников')
    }
}

const deleteUser = (id: string, username: string) => {
  showConfirm({
    title: 'Удаление пользователя',
    message: `Вы действительно хотите удалить пользователя "${username}"? Это действие нельзя отменить.`,
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    onConfirm: async () => {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await loadEmployees()
        showSuccess('Работник успешно удален')
      } catch (err) {
        showError('Ошибка удаления пользователя')
      }
    }
  })
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return users.value.filter(user => {
    const nameMatch = `${user.lastName} ${user.firstName}`.toLowerCase().includes(query)
    const emailMatch = user.email.toLowerCase().includes(query)
    const phoneMatch = user.phone.includes(query)
    const usernameMatch = user.username.toLowerCase().includes(query)
    const roleMatch = user.role.toLowerCase().includes(query)
    
    return nameMatch || emailMatch || phoneMatch || usernameMatch || roleMatch
  })
})

const getRoleLabel = (role: string) => {
  const roles: Record<string, string> = {
    'user': 'Пользователь',
    'agent': 'Агент',
    'inspector': 'Оценщик',
    'expert': 'Эксперт',
    'admin': 'Администратор'
  }
  return roles[role] || role
}

onMounted(() => {
  loadEmployees()
})
</script>

<template>
  <div class="container">
    
    <!-- ЗАГОЛОВОК -->
    <div class="header">
      <h2 class="main-title">Управление пользователями</h2>
    </div>

    <!-- ФОРМА СОЗДАНИЯ (как в Claims.vue) -->
    <div class="creation-form-container">
      <span class="form-title">Создание пользователя</span>

      <form @submit.prevent="createUser">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Фамилия</label>
            <input v-model="lastName" placeholder="Иванов" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Имя</label>
            <input v-model="firstName" placeholder="Иван" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Отчество</label>
            <input v-model="middleName" placeholder="Иванович" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Телефон</label>
            <input 
              v-model="phone" 
              @input="formatPhone"
              placeholder="+7 (999) 999-99-99" 
              class="form-input" 
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="example@mail.ru" 
              class="form-input" 
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Дата рождения</label>
            <input v-model="birthDate" type="date" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Логин</label>
            <input v-model="username" placeholder="Введите логин" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Роль</label>
            <select v-model="role" class="form-select">
              <option value="user">Пользователь</option>
              <option value="agent">Агент</option>
              <option value="inspector">Оценщик</option>
              <option value="expert">Эксперт</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div class="form-group" style="grid-column: span 1;">
            <label class="form-label">Пароль</label>
            <div class="password-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 6 символов"
                class="form-input"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <EyeOffIcon v-if="showPassword" />
                <EyeIcon v-else />
              </button>
            </div>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary btn-submit">
          {{ loading ? 'Создание...' : 'Создать пользователя' }}
        </button>
      </form>
    </div>

    <!-- ПОИСК ПОЛЬЗОВАТЕЛЕЙ -->
    <div style="margin-top: 32px; margin-bottom: 24px;">
      <div style="position: relative;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск пользователей..."
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
        Найдено: {{ filteredUsers.length }} из {{ users.length }} пользователей
      </div>
    </div>

    <!-- СПИСОК ПОЛЬЗОВАТЕЛЕЙ -->
    <div v-if="filteredUsers.length === 0 && searchQuery" style="text-align: center; padding: 40px; color: #94a3b8;">
      По запросу ничего не найдено
    </div>

    <div v-else-if="users.length === 0" style="text-align: center; padding: 40px; color: #94a3b8;">
      Пользователей пока нет
    </div>

    <div class="card-grid">
      <div v-for="user in filteredUsers" :key="user._id" class="card">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge-type">
            {{ getRoleLabel(user.role) }}
          </span>
          <span style="font-size: 10px; color: #64748b;">
            ID: {{ user._id.slice(-6) }}
          </span>
        </div>

        <div class="program-name">
          {{ user.lastName }} {{ user.firstName }}
        </div>

        <div class="program-desc">
          {{ user.middleName || 'Без отчества' }}
        </div>

        <div class="program-footer">
          <span>Email:</span>
          <span class="footer-val">{{ user.email }}</span>
        </div>

        <div class="program-footer">
          <span>Телефон:</span>
          <span class="footer-val">{{ user.phone }}</span>
        </div>

        <div class="program-footer">
          <span>Логин:</span>
          <span class="footer-val">{{ user.username }}</span>
        </div>

        <div class="card-actions">
          <button 
            @click="deleteUser(user._id, user.username)" 
            class="btn-edit"
            style="color: red; width: 100%;"
          >
            Удалить
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* Стили как в Claims.vue */
.container {
  max-width: 1000px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
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

.creation-form-container {
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
.form-select {
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
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
}

.toggle-password:hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.toggle-password svg {
  width: 20px;
  height: 20px;
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
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit {
  width: 100%;
  margin-top: 1rem;
  background-color: #0fc96c;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0fb361;
  box-shadow: 0 5px 7px -3px rgba(0, 0, 0, 0.1);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

.badge-type {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
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

.footer-val {
  color: #475569;
  font-weight: 600;
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

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>