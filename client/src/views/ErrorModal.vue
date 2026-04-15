<script setup lang="ts">
import { errorModal, errorMessage, hideError } from '../store/Modal'

const close = () => hideError()
</script>

<template>
    <div v-if="errorModal" class="modal-overlay" @click.self="close">

    <div class="modal-card">

    <h2 class="modal-title">Ошибка</h2>

    <!-- строка или список -->
    <div v-if="Array.isArray(errorMessage)">
      <ul class="modal-list">
      <li v-for="(err, i) in errorMessage" :key="i">
        {{ err }}
      </li>
      </ul>
    </div>

    <div v-else class="modal-text">
    {{ errorMessage }}
    </div>

    <button class="modal-btn" @click="close">Ок</button>

    </div>
    </div>
</template>