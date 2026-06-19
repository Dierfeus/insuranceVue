import { ref } from 'vue'

export type ModalType = 'error' | 'info' | 'success' | 'warning' | 'confirm'

interface ModalState {
  visible: boolean
  type: ModalType
  title: string
  message: string | string[]
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export const modal = ref<ModalState>({
  visible: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'Ок',
  cancelText: 'Отмена',
  onConfirm: undefined,
  onCancel: undefined
})

export const showModal = (options: {
  type?: ModalType
  title?: string
  message: string | string[]
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}) => {
  modal.value = {
    visible: true,
    type: options.type || 'info',
    title: options.title || getDefaultTitle(options.type || 'info'),
    message: options.message,
    confirmText: options.confirmText || 'Ок',
    cancelText: options.cancelText || 'Отмена',
    onConfirm: options.onConfirm,
    onCancel: options.onCancel
  }
}

export const showError = (msg: string | string[]) => {
  showModal({
    type: 'error',
    title: 'Ошибка',
    message: msg
  })
}

export const showInfo = (msg: string | string[], title = 'Информация') => {
  showModal({
    type: 'info',
    title,
    message: msg
  })
}

export const showSuccess = (msg: string | string[], title = 'Успешно') => {
  showModal({
    type: 'success',
    title,
    message: msg
  })
}

export const showWarning = (msg: string | string[], title = 'Внимание') => {
  showModal({
    type: 'warning',
    title,
    message: msg
  })
}

export const showConfirm = (options: {
  message: string | string[]
  title?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}) => {
  showModal({
    type: 'confirm',
    title: options.title || 'Подтверждение',
    message: options.message,
    confirmText: options.confirmText || 'Да',
    cancelText: options.cancelText || 'Нет',
    onConfirm: options.onConfirm,
    onCancel: options.onCancel
  })
}

export const hideModal = () => {
  modal.value.visible = false
  modal.value.onConfirm = undefined
  modal.value.onCancel = undefined
}

const getDefaultTitle = (type: ModalType): string => {
  switch (type) {
    case 'error': return 'Ошибка'
    case 'info': return 'Информация'
    case 'success': return 'Успешно'
    case 'warning': return 'Внимание'
    case 'confirm': return 'Подтверждение'
    default: return 'Сообщение'
  }
}