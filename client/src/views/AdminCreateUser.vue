<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios';
import { showError, showSuccess } from '../store/Modal'

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const phone = ref('')
const email = ref('')
const birthDate = ref('')
const username = ref('')
const password = ref('')
const role = ref('user')
const token = localStorage.getItem('token');

const loading = ref(false)
const showPassword = ref(false)

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
          'Content-Type': 'application/json' // Для JSON данных используем application/json
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

  } catch (err: any) {
    showError(
      err.response?.data?.message ||
      'Ошибка создания пользователя'
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">
        Создание пользователя
      </h2>

      <form
        class="auth-form"
        @submit.prevent="createUser"
      >
        <div class="form-field">
          <label class="field-label">Фамилия</label>
          <input
            v-model="lastName"
            class="auth-input"
            placeholder="Иванов"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Имя</label>
          <input
            v-model="firstName"
            class="auth-input"
            placeholder="Иван"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Отчество</label>
          <input
            v-model="middleName"
            class="auth-input"
            placeholder="Иванович"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Телефон</label>
          <input
            v-model="phone"
            @input="formatPhone"
            class="auth-input"
            placeholder="+7 (999) 999-99-99"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Email</label>
          <input
            v-model="email"
            class="auth-input"
            type="email"
            placeholder="example@mail.ru"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Дата рождения</label>
          <input
            v-model="birthDate"
            class="auth-input"
            type="date"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Логин</label>
          <input
            v-model="username"
            class="auth-input"
            placeholder="Введите логин"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Роль</label>

          <select
            v-model="role"
            class="auth-input role-select"
          >
            <option value="user">
              Клиент
            </option>

            <option value="agent">
              Агент
            </option>

            <option value="inspector">
              Инспектор
            </option>

            <option value="expert">
              Эксперт
            </option>

            <option value="admin">
              Администратор
            </option>
          </select>
        </div>

        <div class="form-field">
          <label class="field-label">Пароль</label>

          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input"
              placeholder="Введите пароль"
              required
            />

            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="auth-btn"
          :disabled="loading"
        >
          {{ loading ? 'Создание...' : 'Создать пользователя' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    135deg,
    #f0f9ff 0%,
    #bae6fd 100%
  );
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,.1);
}

.auth-title {
  text-align: center;
  margin-bottom: 24px;
  color: #2563eb;
  font-size: 1.6rem;
  font-weight: 800;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: .85rem;
  font-weight: 600;
}

.auth-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #f8fafc;
  box-sizing: border-box;
}

.auth-input:focus {
  outline: none;
  border-color: #2563eb;
}

.role-select {
  cursor: pointer;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .auth-input {
  padding-right: 50px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.auth-btn {
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  padding: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    #2563eb,
    #1d4ed8
  );
}

.auth-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}
</style>

