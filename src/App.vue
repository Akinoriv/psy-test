<template>
  <div id="app" class="app">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Глобальные уведомления -->
    <div v-if="notifications.length > 0" class="app__notifications">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['app__notification', `app__notification--${notification.type}`]"
      >
        {{ notification.message }}
        <button @click="removeNotification(notification.id)" class="app__notification-close">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const notifications = ref([])

// Система уведомлений
const addNotification = (message, type = 'info', duration = 3000) => {
  const id = Date.now()
  notifications.value.push({ id, message, type })

  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Глобальные обработчики ошибок
const handleGlobalError = (error) => {
  console.error('Global error:', error)
  addNotification('Произошла ошибка. Попробуйте еще раз.', 'error')
}

// Обработка офлайн/онлайн состояния
const handleOnline = () => {
  addNotification('Соединение восстановлено', 'success')
}

const handleOffline = () => {
  addNotification('Отсутствует интернет-соединение', 'warning', 0)
}

onMounted(() => {
  // Глобальная обработка ошибок
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', (event) => {
    handleGlobalError(event.reason)
  })

  // Отслеживание состояния сети
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Проверяем начальное состояние сети
  if (!navigator.onLine) {
    handleOffline()
  }
})

// Предоставляем методы уведомлений глобально
window.showNotification = addNotification
</script>

<style lang="scss">
// Импорт основных стилей (исправленный)
@use './styles/main.scss';
</style>
