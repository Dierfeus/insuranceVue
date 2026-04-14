import { ref } from 'vue'

export const errorModal = ref(false)
export const errorMessage = ref<string | string[]>('')

export const showError = (msg: string | string[]) => {
    errorMessage.value = msg
    errorModal.value = true
}

export const hideError = () => {
    errorModal.value = false
    errorMessage.value = ''
}