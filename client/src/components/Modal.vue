<!-- src/views/Modal.vue -->
<script setup lang="ts">
import { modal, hideModal } from '../store/Modal'
import { computed } from 'vue'

const isVisible = computed(() => modal.value.visible)
const type = computed(() => modal.value.type)
const title = computed(() => modal.value.title)
const message = computed(() => modal.value.message)
const confirmText = computed(() => modal.value.confirmText || 'Ок')
const cancelText = computed(() => modal.value.cancelText || 'Отмена')
const showCancel = computed(() => type.value === 'confirm')

const getModalClass = () => {
  switch (type.value) {
    case 'error': return 'modal-error'
    case 'success': return 'modal-success'
    case 'warning': return 'modal-warning'
    case 'confirm': return 'modal-confirm'
    default: return 'modal-info'
  }
}

const handleConfirm = () => {
  if (modal.value.onConfirm) {
    modal.value.onConfirm()
  }
  hideModal()
}

const handleCancel = () => {
  if (modal.value.onCancel) {
    modal.value.onCancel()
  }
  hideModal()
}

const close = () => {
  if (type.value !== 'confirm') {
    hideModal()
  }
}
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="modal-card" :class="getModalClass()">
      <div class="modal-header">

        <h2 class="modal-title">{{ title }}</h2>
        <button v-if="type !== 'confirm'" class="modal-close" @click="close">✕</button>
      </div>

      <!-- Сообщение (строка или список) -->
      <div v-if="Array.isArray(message)" class="modal-body">
        <ul class="modal-list">
          <li v-for="(err, i) in message" :key="i">{{ err }}</li>
        </ul>
      </div>
      <div v-else class="modal-body">
        <p class="modal-text">{{ message }}</p>
      </div>

      <!-- Кнопки -->
      <div class="modal-footer" :class="{ 'modal-footer-center': !showCancel }">
        <button v-if="showCancel" class="modal-btn modal-btn-cancel" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="modal-btn modal-btn-confirm" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* затемнение фона */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* окно */
.modal-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: pop 0.2s ease-out;
  position: relative;
}

/* Стили в зависимости от типа */
.modal-error .modal-title {
  color: #dc2626;
}
.modal-error .modal-icon {
  background: #fee2e2;
  color: #dc2626;
}

.modal-success .modal-title {
  color: #16a34a;
}
.modal-success .modal-icon {
  background: #dcfce7;
  color: #16a34a;
}

.modal-warning .modal-title {
  color: #d97706;
}
.modal-warning .modal-icon {
  background: #fef3c7;
  color: #d97706;
}

.modal-confirm .modal-title {
  color: #2563eb;
}
.modal-confirm .modal-icon {
  background: #dbeafe;
  color: #2563eb;
}

.modal-info .modal-title {
  color: #2563eb;
}
.modal-info .modal-icon {
  background: #dbeafe;
  color: #2563eb;
}

/* заголовок */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #475569;
}

/* тело */
.modal-body {
  margin-bottom: 20px;
}

.modal-text {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.6;
  margin: 0;
}

.modal-list {
  padding-left: 20px;
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.8;
}

.modal-list li {
  list-style-type: disc;
}

/* футер с кнопками */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.modal-footer-center {
  justify-content: center;
}

.modal-btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.modal-btn-confirm {
  background: #2563eb;
  color: white;
}

.modal-btn-confirm:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.modal-btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.modal-btn-cancel:hover {
  background: #e2e8f0;
}

/* Анимация */
@keyframes pop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 520px) {
  .modal-card {
    padding: 20px;
    margin: 10px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .modal-btn {
    width: 100%;
    text-align: center;
  }
}
</style>