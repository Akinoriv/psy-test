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

<style>
/* Глобальные стили */
:root {
  --color-primary: #6366f1;
  --color-primary-dark: #5855eb;
  --color-secondary: #f3f4f6;
  --color-danger: #ef4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-background: #ffffff;
  --color-background-alt: #f9fafb;
  --color-border: #e5e7eb;
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

html {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background-color: var(--color-background-alt);
  color: var(--color-text);
}

#app {
  min-height: 100vh;
}

/* Анимации переходов между страницами */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Система уведомлений */
.app__notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
}

.app__notification {
  padding: 12px 16px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.app__notification--info {
  background-color: #dbeafe;
  border: 1px solid #3b82f6;
  color: #1e40af;
}

.app__notification--success {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
}

.app__notification--warning {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
}

.app__notification--error {
  background-color: #fecaca;
  border: 1px solid #ef4444;
  color: #991b1b;
}

.app__notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.app__notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Утилитарные классы */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

/* Адаптивность */
@media (max-width: 640px) {
  .app__notifications {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .app__notification {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* Accessibility улучшения */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .app__notification {
    transition: none;
    animation: none;
  }
}

/* Focus стили */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Прелоадер для lazy-loaded компонентов */
.component-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--color-text-muted);
}
</style>
