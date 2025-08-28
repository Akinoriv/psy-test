import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'

// Создание экземпляра приложения
const app = createApp(App)

// Подключение Pinia для управления состоянием
const pinia = createPinia()
app.use(pinia)

// Подключение роутера
app.use(router)

// Глобальные конфигурации
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err, info)
  // В продакшене здесь можно отправить ошибку в систему мониторинга
}

app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue warning:', msg, trace)
}

// Глобальные свойства
app.config.globalProperties.$formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

app.config.globalProperties.$formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Монтирование приложения
app.mount('#app')

// Отладочная информация в dev режиме
if (import.meta.env.DEV) {
  console.log('🧠 Psychological Tests MVP started in development mode')
  console.log('Vue version:', app.version)
  console.log('Router:', router)
  console.log('Pinia:', pinia)
}
