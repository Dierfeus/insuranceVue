<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'
import { showError, showSuccess, showInfo } from '../store/Modal'
import { EyeIcon, EyeOffIcon } from '../components/icons/index'

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const phone = ref('')
const email = ref('')
const birthDate = ref('')
const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const router = useRouter()

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
  
  input.value = result
  phone.value = result
}

const validate = () => {
  if (!lastName.value.trim()) {
    showInfo('Введите фамилию')
    return false
  }
  if (!firstName.value.trim()) {
    showInfo('Введите имя')
    return false
  }
  
  const cleanPhone = phone.value.replace(/\D/g, '')
  if (cleanPhone.length < 11) {
    showInfo('Введите корректный номер телефона (11 цифр)')
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value.trim() || !emailRegex.test(email.value)) {
    showInfo('Введите корректный email адрес')
    return false
  }
  
  if (!birthDate.value) {
    showInfo('Выберите дату рождения')
    return false
  }
  
  if (!username.value.trim() || username.value.length < 3) {
    showInfo('Логин должен содержать минимум 3 символа')
    return false
  }
  
  if (!password.value || password.value.length < 6) {
    showInfo('Пароль должен содержать минимум 6 символов')
    return false
  }
  
  return true
}

const register = async () => {
  if (!validate()) return
  
  loading.value = true

  try {
    const cleanPhone = phone.value.replace(/\D/g, '')
    
    await auth.register({
      username: username.value,
      password: password.value,
      role: 'user',
      firstName: firstName.value,
      lastName: lastName.value,
      middleName: middleName.value,
      phone: cleanPhone,
      email: email.value,
      birthDate: birthDate.value
    })

    showSuccess('Аккаунт успешно создан! Теперь вы можете войти.')
    
    firstName.value = ''
    lastName.value = ''
    middleName.value = ''
    phone.value = ''
    email.value = ''
    birthDate.value = ''
    username.value = ''
    password.value = ''
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    
  } catch (err: any) {
    const message = err.response?.data?.message || 'Ошибка регистрации'
    
    if (message.includes('User already exists')) {
      showError('Пользователь с таким логином уже существует')
    } else if (message.includes('Email already in use')) {
      showError('Этот email уже зарегистрирован')
    } else {
      showError(message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Регистрация</h2>

      <form @submit.prevent="register" class="auth-form">
        
        <div class="form-field">
          <label class="field-label">Фамилия</label>
          <input 
            v-model="lastName" 
            placeholder="Иванов" 
            class="auth-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Имя</label>
          <input 
            v-model="firstName" 
            placeholder="Иван" 
            class="auth-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Отчество</label>
          <input 
            v-model="middleName" 
            placeholder="Иванович" 
            class="auth-input"
          />
        </div>

        <div class="form-field">
          <label class="field-label">Номер телефона</label>
          <input 
            v-model="phone" 
            @input="formatPhone"
            placeholder="+7 (999) 999-99-99" 
            class="auth-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="example@mail.ru" 
            class="auth-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Дата рождения</label>
          <input 
            v-model="birthDate" 
            type="date" 
            class="auth-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Логин</label>
          <input 
            v-model="username" 
            placeholder="Придумайте логин" 
            class="auth-input"
            required
          />
        </div>

        <div class="form-field">
          <label class="field-label">Пароль</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Минимум 6 символов"
              class="auth-input"
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
          <div class="password-hint" v-if="password && password.length < 6">
            ⚠ Пароль должен содержать минимум 6 символов
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading" 
          class="auth-btn auth-btn-success"
        >
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <p class="auth-text-link">
        Есть аккаунт? <router-link to="/login">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Только специфичные стили для регистрации */
.auth-page {
  min-height: 100vh;
  background: #bae6fd;
}

.auth-card {
  border-radius: 20px;
  padding: 32px 36px;
  max-width: 440px;
}

.auth-title {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.form-field {
  margin-bottom: 4px;
}

.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 3px;
}

.auth-input {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f8fafc;
}

.auth-input:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.auth-input::placeholder {
  color: #94a3b8;
  font-size: 0.9rem;
}

.auth-btn-success {
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  margin-top: 8px;
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.auth-btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(22,163,74,0.35);
}

.auth-btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-text-link {
  margin-top: 16px;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
    margin: 0 8px;
  }
  .auth-title {
    font-size: 1.3rem;
  }
  .auth-input {
    font-size: 0.9rem;
    padding: 8px 12px;
  }
}
</style>